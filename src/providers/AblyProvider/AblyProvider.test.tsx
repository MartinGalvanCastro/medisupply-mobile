import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import * as Ably from 'ably';
import { useQueryClient } from '@tanstack/react-query';
import type { AblyTokenResponse } from '@/api/generated/models';
import type { AppStateStatus } from 'react-native';

// Mock dependencies - MUST come before importing AblyProvider
jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(),
  },
  Appearance: {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn(),
  },
  AccessibilityInfo: {
    isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    Version: '15.0',
    select: jest.fn((obj) => obj.ios),
  },
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812, scale: 2, fontScale: 1 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
}));

// Suppress CSS interop warnings
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

jest.mock('@/store/useAuthStore/useAuthStore');
jest.mock('@/hooks/useAblyToken');

jest.mock('ably', () => {
  const mockConnection = {
    on: jest.fn(),
    state: 'connected',
  };

  const mockChannel = {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  };

  const mockChannels = {
    get: jest.fn(() => mockChannel),
  };

  return {
    Realtime: jest.fn(() => ({
      connection: mockConnection,
      channels: mockChannels,
      close: jest.fn(),
    })),
  };
});

// Import after mocks are set up
import { AblyProvider, useAbly } from './AblyProvider';
import { useAuthStore } from '@/store/useAuthStore/useAuthStore';
import { useAblyToken } from '@/hooks/useAblyToken';
import { AppState } from 'react-native';

describe('AblyProvider', () => {
  let mockGetValidToken: jest.Mock;
  let mockClearCache: jest.Mock;
  let mockQueryClient: any;
  let mockAblyInstance: any;
  let mockConnectionOn: jest.Mock;
  let mockChannelSubscribe: jest.Mock;
  let mockChannelUnsubscribe: jest.Mock;
  let mockChannelGet: jest.Mock;
  let mockAppStateAddEventListener: jest.Mock;
  let appStateListeners: { [key: string]: (state: AppStateStatus) => void } = {};
  const now = Date.now();

  const createMockTokenResponse = (): AblyTokenResponse => ({
    token_request: {
      keyName: 'test-key',
      ttl: 3600000,
      timestamp: now,
      capability: '{"mobile:products":["subscribe"]}',
      nonce: 'test-nonce',
      mac: 'test-mac',
      clientId: 'test-client-id',
    },
    expires_at: now + 3600000,
    channels: ['mobile:products'],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    appStateListeners = {};

    // Setup useAblyToken mock
    mockGetValidToken = jest.fn();
    mockClearCache = jest.fn();
    (useAblyToken as jest.Mock).mockReturnValue({
      getValidToken: mockGetValidToken,
      clearCache: mockClearCache,
      isPending: false,
      error: null,
    });

    // Setup useQueryClient mock
    mockQueryClient = {
      invalidateQueries: jest.fn(),
      refetchQueries: jest.fn(),
    };
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);

    // Setup AppState mock
    mockAppStateAddEventListener = jest.fn((event, callback) => {
      appStateListeners[event] = callback;
      return { remove: jest.fn() };
    });
    (AppState.addEventListener as jest.Mock) = mockAppStateAddEventListener;
    (AppState.currentState as any) = 'active';

    // Setup Ably mocks
    mockConnectionOn = jest.fn();
    mockChannelSubscribe = jest.fn();
    mockChannelUnsubscribe = jest.fn();
    mockChannelGet = jest.fn();

    mockAblyInstance = {
      connection: {
        on: mockConnectionOn,
        state: 'connected',
      },
      channels: {
        get: mockChannelGet,
      },
      close: jest.fn(),
      connect: jest.fn(),
    };

    mockChannelGet.mockReturnValue({
      subscribe: mockChannelSubscribe,
      unsubscribe: mockChannelUnsubscribe,
    });

    (Ably.Realtime as unknown as jest.Mock).mockImplementation(() => mockAblyInstance);
  });

  const TestComponent = ({ children }: { children: React.ReactNode }) => (
    <AblyProvider>{children}</AblyProvider>
  );

  describe('Authentication State', () => {
    it('should not initialize Ably when user is not authenticated', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: false,
      });

      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      expect(Ably.Realtime).not.toHaveBeenCalled();
    });

    it('should initialize Ably when user is authenticated', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: true,
      });
      mockGetValidToken.mockResolvedValue(createMockTokenResponse());

      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      expect(Ably.Realtime).toHaveBeenCalled();
    });

    it('should close connection and clear cache on logout', async () => {
      let isAuthenticated = true;
      (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
        isAuthenticated,
      }));
      mockGetValidToken.mockResolvedValue(createMockTokenResponse());

      const { rerender } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      expect(Ably.Realtime).toHaveBeenCalled();
      expect(mockAblyInstance.close).not.toHaveBeenCalled();

      // Simulate logout
      isAuthenticated = false;
      (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
        isAuthenticated,
      }));

      rerender(() => useAbly());

      expect(mockAblyInstance.close).toHaveBeenCalled();
      expect(mockClearCache).toHaveBeenCalled();
    });
  });

  describe('Connection Initialization', () => {
    beforeEach(() => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: true,
      });
    });

    it('should create Ably instance with authCallback', () => {
      mockGetValidToken.mockResolvedValue(createMockTokenResponse());

      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      expect(Ably.Realtime).toHaveBeenCalledWith(
        expect.objectContaining({
          authCallback: expect.any(Function),
          disconnectedRetryTimeout: 15000,
          suspendedRetryTimeout: 30000,
          autoConnect: true,
        })
      );
    });

    it('should call authCallback when Ably requests token', async () => {
      const mockToken = createMockTokenResponse();
      mockGetValidToken.mockResolvedValue(mockToken);

      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // Get the authCallback that was passed to Ably.Realtime
      const callArgs = (Ably.Realtime as unknown as jest.Mock).mock.calls[0][0];
      const authCallback = callArgs.authCallback;

      const mockCallback = jest.fn();

      await act(async () => {
        await authCallback({}, mockCallback);
      });

      expect(mockGetValidToken).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(null, mockToken.token_request);
    });

    it('should handle authCallback errors', async () => {
      const error = new Error('Token fetch failed');
      mockGetValidToken.mockRejectedValue(error);

      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      const callArgs = (Ably.Realtime as unknown as jest.Mock).mock.calls[0][0];
      const authCallback = callArgs.authCallback;

      const mockCallback = jest.fn();

      await act(async () => {
        await authCallback({}, mockCallback);
      });

      expect(mockCallback).toHaveBeenCalledWith(error, null);
    });
  });

  describe('Connection State Events', () => {
    beforeEach(() => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: true,
      });
      mockGetValidToken.mockResolvedValue(createMockTokenResponse());
    });

    it('should set isConnected to true on connected event', () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      expect(result.current.isConnected).toBe(false);

      // Simulate connected event
      const connectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'connected'
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      expect(result.current.isConnected).toBe(true);
    });

    it('should set isConnected to false on disconnected event', () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // First connect
      const connectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'connected'
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      expect(result.current.isConnected).toBe(true);

      // Then disconnect
      const disconnectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'disconnected'
      )?.[1];

      act(() => {
        disconnectedHandler?.();
      });

      expect(result.current.isConnected).toBe(false);
    });

    it('should set isConnected to false on failed event', () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      const failedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'failed'
      )?.[1];

      act(() => {
        failedHandler?.({ reason: 'Network error' });
      });

      expect(result.current.isConnected).toBe(false);
    });

    it('should set isConnected to false on suspended event', () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      const suspendedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'suspended'
      )?.[1];

      act(() => {
        suspendedHandler?.();
      });

      expect(result.current.isConnected).toBe(false);
    });

    it('should register all connection event listeners', () => {
      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      expect(mockConnectionOn).toHaveBeenCalledWith('connected', expect.any(Function));
      expect(mockConnectionOn).toHaveBeenCalledWith('disconnected', expect.any(Function));
      expect(mockConnectionOn).toHaveBeenCalledWith('failed', expect.any(Function));
      expect(mockConnectionOn).toHaveBeenCalledWith('suspended', expect.any(Function));
    });
  });

  describe('App State Handling', () => {
    beforeEach(() => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: true,
      });
      mockGetValidToken.mockResolvedValue(createMockTokenResponse());
    });

    it('should register AppState listener', () => {
      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      expect(mockAppStateAddEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('should reconnect when app comes to foreground from background', () => {
      mockAblyInstance.connection.state = 'disconnected';

      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // First transition to background
      act(() => {
        appStateListeners['change']?.('background');
      });

      // Then transition to foreground
      act(() => {
        appStateListeners['change']?.('active');
      });

      expect(mockAblyInstance.connect).toHaveBeenCalled();
    });

    it('should reconnect when app comes to foreground from inactive', () => {
      mockAblyInstance.connection.state = 'suspended';

      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // First transition to inactive
      act(() => {
        appStateListeners['change']?.('inactive');
      });

      // Then transition to foreground
      act(() => {
        appStateListeners['change']?.('active');
      });

      expect(mockAblyInstance.connect).toHaveBeenCalled();
    });

    it('should not reconnect if already connected', () => {
      mockAblyInstance.connection.state = 'connected';

      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      act(() => {
        appStateListeners['change']?.('active');
      });

      expect(mockAblyInstance.connect).not.toHaveBeenCalled();
    });

    it('should not attempt to reconnect without Ably instance', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: false,
      });

      renderHook(() => {
        // This will throw, but we're testing the behavior
        try {
          useAbly();
        } catch (e) {
          // Expected to throw when used outside provider
        }
      });

      // No Ably instance, so app state change should not throw
      expect(() => {
        act(() => {
          appStateListeners['change']?.('active');
        });
      }).not.toThrow();
    });

    it('should handle app state transition from background to foreground', () => {
      mockAblyInstance.connection.state = 'suspended';

      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // Simulate background
      act(() => {
        appStateListeners['change']?.('background');
      });

      // Simulate foreground
      act(() => {
        appStateListeners['change']?.('active');
      });

      expect(mockAblyInstance.connect).toHaveBeenCalled();
    });
  });

  describe('Channel Subscription', () => {
    beforeEach(() => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: true,
      });
      mockGetValidToken.mockResolvedValue(createMockTokenResponse());
    });

    it('should subscribe to mobile:products channel when connected', async () => {
      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // Trigger connected state
      const connectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'connected'
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      await act(async () => {
        // Allow promises to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockChannelGet).toHaveBeenCalledWith('mobile:products');
      expect(mockChannelSubscribe).toHaveBeenCalledWith('product.updated', expect.any(Function));
    });

    it('should not subscribe when not connected', () => {
      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      expect(mockChannelSubscribe).not.toHaveBeenCalled();
    });

    it('should not subscribe when not authenticated', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: false,
      });

      renderHook(() => {
        try {
          useAbly();
        } catch (e) {
          // Expected
        }
      }, { wrapper: TestComponent });

      expect(mockChannelSubscribe).not.toHaveBeenCalled();
    });

    it('should unsubscribe on unmount', async () => {
      const { unmount } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // Trigger connected state
      const connectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'connected'
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      unmount();

      // Verify unsubscribe was called
      expect(mockChannelUnsubscribe).toHaveBeenCalledWith('product.updated', expect.any(Function));
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: true,
      });
      mockGetValidToken.mockResolvedValue(createMockTokenResponse());
    });

    it('should invalidate products query on product.updated event', async () => {
      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // Connect
      const connectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'connected'
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Get the event handler
      const eventHandler = mockChannelSubscribe.mock.calls[0]?.[1];

      const mockMessage: Ably.Message = {
        name: 'product.updated',
        data: { productId: '123' },
        timestamp: Date.now(),
      } as any;

      act(() => {
        eventHandler?.(mockMessage);
      });

      expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: ['products'],
        type: 'active',
      });
    });

    it('should ignore non-product.updated events', async () => {
      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      const connectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'connected'
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const eventHandler = mockChannelSubscribe.mock.calls[0]?.[1];

      const mockMessage: Ably.Message = {
        name: 'other.event',
        data: { test: 'data' },
        timestamp: Date.now(),
      } as any;

      act(() => {
        eventHandler?.(mockMessage);
      });

      expect(mockQueryClient.refetchQueries).not.toHaveBeenCalled();
    });

    it('should handle multiple product.updated events', async () => {
      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      const connectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'connected'
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const eventHandler = mockChannelSubscribe.mock.calls[0]?.[1];

      // Send multiple events
      for (let i = 0; i < 3; i++) {
        const mockMessage: Ably.Message = {
          name: 'product.updated',
          data: { productId: `${i}` },
          timestamp: Date.now(),
        } as any;

        act(() => {
          eventHandler?.(mockMessage);
        });
      }

      expect(mockQueryClient.refetchQueries).toHaveBeenCalledTimes(3);
    });
  });

  describe('Context Value', () => {
    beforeEach(() => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: true,
      });
      mockGetValidToken.mockResolvedValue(createMockTokenResponse());
    });

    it('should provide ably instance through context', () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // Need to trigger a connection event to force a re-render
      // (the ably instance is stored in a ref, so we need state to change to see it updated)
      const connectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'connected'
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      // After a state change, the context value will include the ably instance
      expect(result.current.ably).toBe(mockAblyInstance);
    });

    it('should provide isConnected state through context', () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      expect(result.current.isConnected).toBe(false);

      const connectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'connected'
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      expect(result.current.isConnected).toBe(true);
    });

    it('should return null ably instance when not authenticated', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: false,
      });

      const { result } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // When not authenticated, ably should be null
      expect(result.current.ably).toBeNull();
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('useAbly Hook', () => {
    it('should throw when used outside AblyProvider', () => {
      expect(() => {
        renderHook(() => useAbly());
      }).toThrow('useAbly must be used within an AblyProvider');
    });

    it('should return context when used within AblyProvider', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: true,
      });
      mockGetValidToken.mockResolvedValue(createMockTokenResponse());

      const { result } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      expect(result.current).toHaveProperty('ably');
      expect(result.current).toHaveProperty('isConnected');
    });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: true,
      });
      mockGetValidToken.mockResolvedValue(createMockTokenResponse());
    });

    it('should close connection on unmount', () => {
      const { unmount } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      unmount();

      expect(mockAblyInstance.close).toHaveBeenCalled();
    });

    it('should cleanup AppState listener on unmount', () => {
      const mockRemove = jest.fn();
      mockAppStateAddEventListener.mockReturnValue({ remove: mockRemove });

      const { unmount } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      unmount();

      expect(mockRemove).toHaveBeenCalled();
    });

    it('should unsubscribe from channel on connection change', async () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: true,
      });

      const { rerender } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // Trigger connected state to subscribe
      const connectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'connected'
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Trigger disconnected state
      const disconnectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'disconnected'
      )?.[1];

      act(() => {
        disconnectedHandler?.();
      });

      expect(mockChannelUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: true,
      });
      mockGetValidToken.mockResolvedValue(createMockTokenResponse());
    });

    it('should handle rapid authentication state changes', async () => {
      let isAuthenticated = true;
      (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
        isAuthenticated,
      }));

      const { rerender } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // Logout
      isAuthenticated = false;
      (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
        isAuthenticated,
      }));
      rerender(() => useAbly());

      expect(mockAblyInstance.close).toHaveBeenCalled();

      // Login again
      isAuthenticated = true;
      (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
        isAuthenticated,
      }));
      rerender(() => useAbly());

      expect(Ably.Realtime).toHaveBeenCalledTimes(2);
    });

    it('should handle connection state changes during subscription setup', async () => {
      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // Connect
      const connectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'connected'
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      // Disconnect before subscription completes
      const disconnectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'disconnected'
      )?.[1];

      act(() => {
        disconnectedHandler?.();
      });

      expect(mockChannelUnsubscribe).toHaveBeenCalled();
    });

    it('should handle missing Ably instance gracefully', () => {
      mockAblyInstance = null;
      (Ably.Realtime as unknown as jest.Mock).mockReturnValue(null);

      // When Ably.Realtime returns null, the provider will crash when trying to set up listeners
      // This is expected behavior - Ably initialization should not return null
      expect(() => {
        renderHook(() => useAbly(), {
          wrapper: TestComponent,
        });
      }).toThrow();
    });

    it('should handle authCallback with null tokenParams', async () => {
      const mockToken = createMockTokenResponse();
      mockGetValidToken.mockResolvedValue(mockToken);

      renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      const callArgs = (Ably.Realtime as unknown as jest.Mock).mock.calls[0][0];
      const authCallback = callArgs.authCallback;

      const mockCallback = jest.fn();

      await act(async () => {
        await authCallback(null, mockCallback);
      });

      expect(mockCallback).toHaveBeenCalledWith(null, mockToken.token_request);
    });
  });

  describe('Integration Scenarios', () => {
    beforeEach(() => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        isAuthenticated: true,
      });
      mockGetValidToken.mockResolvedValue(createMockTokenResponse());
    });

    it('should handle complete connection lifecycle', async () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      expect(result.current.isConnected).toBe(false);

      // Connect
      const connectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'connected'
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      expect(result.current.isConnected).toBe(true);

      // Receive event
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const eventHandler = mockChannelSubscribe.mock.calls[0]?.[1];
      const mockMessage: Ably.Message = {
        name: 'product.updated',
        data: { productId: '123' },
        timestamp: Date.now(),
      } as any;

      act(() => {
        eventHandler?.(mockMessage);
      });

      expect(mockQueryClient.refetchQueries).toHaveBeenCalled();

      // Disconnect
      const disconnectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'disconnected'
      )?.[1];

      act(() => {
        disconnectedHandler?.();
      });

      expect(result.current.isConnected).toBe(false);
    });

    it('should handle app background and foreground with events', async () => {
      mockAblyInstance.connection.state = 'disconnected';

      const { result } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // App goes to background
      act(() => {
        appStateListeners['change']?.('background');
      });

      // App comes to foreground
      act(() => {
        appStateListeners['change']?.('active');
      });

      expect(mockAblyInstance.connect).toHaveBeenCalled();

      // Now connect
      const connectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'connected'
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      expect(result.current.isConnected).toBe(true);
    });

    it('should handle logout flow completely', async () => {
      let isAuthenticated = true;
      (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
        isAuthenticated,
      }));

      const { result, rerender } = renderHook(() => useAbly(), {
        wrapper: TestComponent,
      });

      // Connect
      const connectedHandler = mockConnectionOn.mock.calls.find(
        (call) => call[0] === 'connected'
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      expect(result.current.isConnected).toBe(true);

      // Logout
      isAuthenticated = false;
      (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
        isAuthenticated,
      }));

      rerender(() => useAbly());

      expect(mockAblyInstance.close).toHaveBeenCalled();
      expect(mockClearCache).toHaveBeenCalled();
    });
  });
});
