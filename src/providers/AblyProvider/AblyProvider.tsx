import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Ably from 'ably';
import { AppState, AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore/useAuthStore';
import { useAblyToken } from '@/hooks/useAblyToken';
import type { AblyProviderProps, AblyContextValue } from './types';

const AblyContext = createContext<AblyContextValue | undefined>(undefined);

/**
 * AblyProvider - Manages Ably real-time connection and event subscriptions
 *
 * Features:
 * - Initializes Ably connection when user is authenticated
 * - Handles token fetching and caching via useAblyToken
 * - Monitors connection state (connected/disconnected)
 * - Handles app backgrounding/foregrounding (reconnects when needed)
 * - Subscribes to 'mobile:products' channel
 * - Invalidates React Query cache on 'product.updated' events
 * - Cleans up connection on logout
 *
 * @example
 * // In app/_layout.tsx
 * <AblyProvider>
 *   <App />
 * </AblyProvider>
 *
 * // In any component
 * const { isConnected } = useAbly();
 */
export const AblyProvider: React.FC<AblyProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const { getValidToken, clearCache } = useAblyToken();
  const queryClient = useQueryClient();

  const ablyRef = useRef<Ably.Realtime | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  /**
   * Handle logout cleanup separately
   * This effect must run BEFORE the init effect to properly clean up
   * when user logs out before the init cleanup runs
   */
  useEffect(() => {
    if (!isAuthenticated && ablyRef.current) {
      // User logged out and we have an active connection - clean it up
      console.log('[AblyProvider] User logged out, closing connection');
      ablyRef.current.close();
      ablyRef.current = null;
      clearCache();
      setIsConnected(false);
    }
  }, [isAuthenticated, clearCache]);

  /**
   * Initialize Ably connection when user is authenticated
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    console.log('[AblyProvider] Initializing Ably connection...');

    // Track auth failures to prevent infinite retry loops
    let authFailureCount = 0;
    const MAX_AUTH_FAILURES = 3;

    // Create Ably instance with authCallback
    const ably = new Ably.Realtime({
      authCallback: async (_tokenParams, callback) => {
        try {
          console.log('[AblyProvider] authCallback invoked by Ably');

          // Stop retrying after too many failures
          if (authFailureCount >= MAX_AUTH_FAILURES) {
            console.error('[AblyProvider] Too many auth failures, stopping retries');
            const error = new Error('Ably authentication failed after multiple attempts. Please check backend token generation.');
            callback(error as any, null);
            return;
          }

          const tokenData = await getValidToken();

          // Ably expects TokenRequest format
          // Backend returns generic object that matches TokenRequest structure
          callback(null, tokenData.token_request as any);

          // Reset failure count on success
          authFailureCount = 0;
        } catch (error) {
          console.error('[AblyProvider] authCallback failed:', error);
          authFailureCount++;
          // Cast to ErrorInfo or null
          callback(error as Ably.ErrorInfo, null);
        }
      },

      // Mobile-optimized connection settings
      disconnectedRetryTimeout: 15000, // 15s retry timeout for mobile networks
      suspendedRetryTimeout: 30000, // 30s for poor connectivity
      autoConnect: true, // Auto-reconnect on network recovery
    });

    // Connection state listeners
    ably.connection.on('connected', () => {
      console.log('[AblyProvider] ✅ Connected to Ably');
      setIsConnected(true);
    });

    ably.connection.on('disconnected', () => {
      console.log('[AblyProvider] ❌ Disconnected from Ably');
      setIsConnected(false);
    });

    ably.connection.on('failed', (stateChange) => {
      console.error('[AblyProvider] 🔴 Connection failed:', stateChange.reason);
      console.error('[AblyProvider] Reason code:', stateChange.reason?.code);
      console.error('[AblyProvider] Reason message:', stateChange.reason?.message);

      // Log specific auth errors
      if (stateChange.reason?.code === 40101) {
        console.error('[AblyProvider] ❌ HMAC signature mismatch - Backend is generating invalid TokenRequests');
        console.error('[AblyProvider] This is a BACKEND ISSUE. Check:');
        console.error('[AblyProvider]   1. Ably API key is correct');
        console.error('[AblyProvider]   2. HMAC calculation uses correct algorithm');
        console.error('[AblyProvider]   3. Timestamp is within acceptable range');
      }

      setIsConnected(false);
    });

    ably.connection.on('suspended', () => {
      console.warn('[AblyProvider] ⚠️ Connection suspended');
      setIsConnected(false);
    });

    ablyRef.current = ably;

    // Cleanup on unmount or when authentication changes
    return () => {
      console.log('[AblyProvider] Cleaning up Ably connection');
      ably.close();
      // Don't null the ref here - logout effect will handle nulling it
      // ablyRef.current = null;
    };
  }, [isAuthenticated, getValidToken]);

  /**
   * Handle app state changes (background/foreground transitions)
   * Critical for mobile: iOS suspends WebSocket connections in background
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextAppState;

      console.log('[AblyProvider] App state changed:', previousState, '→', nextAppState);

      // App came to foreground
      if (
        previousState.match(/inactive|background/) &&
        nextAppState === 'active' &&
        ablyRef.current
      ) {
        console.log('[AblyProvider] App foregrounded, checking connection...');

        const connectionState = ablyRef.current.connection.state;
        console.log('[AblyProvider] Current connection state:', connectionState);

        // Reconnect if disconnected or suspended
        if (connectionState === 'disconnected' || connectionState === 'suspended') {
          console.log('[AblyProvider] Reconnecting...');
          ablyRef.current.connect();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Subscribe to product updates channel when connected
   */
  useEffect(() => {
    if (!ablyRef.current || !isConnected || !isAuthenticated) {
      return;
    }

    console.log('[AblyProvider] Subscribing to mobile:products channel...');

    const channel = ablyRef.current.channels.get('mobile:products');

    /**
     * Handle order.created event
     * Refetches inventories in the background without showing loading state
     */
    const handleOrderCreated = (message: Ably.Message) => {
      console.log('[AblyProvider] 📦 Order created event received:', {
        eventName: message.name,
        timestamp: message.timestamp,
        data: message.data,
      });

      if (message.name === 'order.created') {
        console.log('[AblyProvider] Refetching inventories in background...');

        // Background refetch - updates cache without showing loading spinner
        // Only refetches queries currently mounted/active for optimal performance
        queryClient.refetchQueries({
          queryKey: ['inventories'],
          type: 'active', // Only refetch active queries (currently on screen)
        });
      }
    };

    // Subscribe to the event
    channel.subscribe('order.created', handleOrderCreated);

    console.log('[AblyProvider] ✅ Subscribed to order.created events');

    // Cleanup on unmount or when connection changes
    return () => {
      console.log('[AblyProvider] Unsubscribing from mobile:products channel');
      channel.unsubscribe('order.created', handleOrderCreated);
    };
  }, [isConnected, isAuthenticated, queryClient]);

  const value: AblyContextValue = {
    ably: ablyRef.current,
    isConnected,
  };

  return <AblyContext.Provider value={value}>{children}</AblyContext.Provider>;
};

/**
 * Hook to access Ably context
 *
 * @example
 * const { isConnected, ably } = useAbly();
 *
 * if (isConnected) {
 *   console.log('Connected to Ably!');
 * }
 *
 * @throws Error if used outside AblyProvider
 */
export const useAbly = (): AblyContextValue => {
  const context = useContext(AblyContext);
  if (context === undefined) {
    throw new Error('useAbly must be used within an AblyProvider');
  }
  return context;
};
