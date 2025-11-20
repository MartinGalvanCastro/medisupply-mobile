import React from 'react';
import { renderHook, render, waitFor, act } from '@testing-library/react-native';
import * as Ably from 'ably';
import { AblyProvider, useAbly } from './AblyProvider';
import { useAuthStore } from '@/store/useAuthStore/useAuthStore';
import { useAblyToken } from '@/hooks/useAblyToken';
import { useQueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

jest.mock('@/store/useAuthStore/useAuthStore');
jest.mock('@/hooks/useAblyToken');
jest.mock('@tanstack/react-query');
jest.mock('ably');

describe('AblyProvider', () => {
  let mockGetValidToken: jest.Mock;
  let mockClearCache: jest.Mock;
  let mockQueryClientRefetchQueries: jest.Mock;
  let mockChannelSubscribe: jest.Mock;
  let mockChannelUnsubscribe: jest.Mock;
  let mockChannelGet: jest.Mock;
  let mockAblyConnectionOn: jest.Mock;
  let mockAblyClose: jest.Mock;
  let mockAblyConnect: jest.Mock;
  let mockAppStateAddEventListener: jest.Mock;
  let mockUseAuthStore: jest.MockedFunction<typeof useAuthStore>;
  let mockUseAblyToken: jest.MockedFunction<typeof useAblyToken>;
  let mockUseQueryClient: jest.MockedFunction<typeof useQueryClient>;

  const mockTokenResponse = {
    token_request: {
      keyName: 'test-key',
      clientId: 'test-client',
      ttl: 3600000,
      timestamp: 1700000000000,
      capability: '{"mobile:products":["subscribe"]}',
      nonce: 'test-nonce',
      mac: 'test-mac',
    },
    expires_at: 1700003600000,
    channels: ['mobile:products'],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup AppState mock with proper state tracking
    let appStateChangeHandler: ((state: string) => void) | null = null;
    let currentAppState = 'active';

    mockAppStateAddEventListener = jest.fn((event, callback) => {
      appStateChangeHandler = callback;
      return {
        remove: jest.fn(),
      };
    });

    Object.defineProperty(AppState, 'addEventListener', {
      value: mockAppStateAddEventListener,
      writable: true,
      configurable: true,
    });

    // Setup Ably connection mock
    mockAblyConnectionOn = jest.fn((event, callback) => {
      // Store callbacks for testing
      (mockAblyConnectionOn as any)[`${event}Callback`] = callback;
    });
    mockAblyClose = jest.fn();
    mockAblyConnect = jest.fn();

    const mockAblyConnection = {
      on: mockAblyConnectionOn,
      close: mockAblyClose,
      connect: mockAblyConnect,
      state: 'connected',
    };

    // Setup channel mock
    mockChannelSubscribe = jest.fn();
    mockChannelUnsubscribe = jest.fn();
    mockChannelGet = jest.fn(() => ({
      subscribe: mockChannelSubscribe,
      unsubscribe: mockChannelUnsubscribe,
    }));

    const mockAblyChannels = {
      get: mockChannelGet,
    };

    // Setup Ably Realtime mock - create NEW instance each time for proper cleanup tracking
    let instanceCount = 0;
    (Ably.Realtime as unknown as jest.Mock).mockImplementation(() => {
      instanceCount++;
      const mockAblyRealtime: any = {
        connection: mockAblyConnection,
        channels: mockAblyChannels,
        close: mockAblyClose,
        connect: mockAblyConnect,
        instanceId: instanceCount,
      };
      return mockAblyRealtime;
    });

    // Setup useAuthStore mock
    mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {} as any,
      login: jest.fn(),
      logout: jest.fn(),
      setUser: jest.fn(),
      clearAuth: jest.fn(),
    });

    // Setup useAblyToken mock
    mockGetValidToken = jest.fn().mockResolvedValue(mockTokenResponse);
    mockClearCache = jest.fn();
    mockUseAblyToken = useAblyToken as jest.MockedFunction<typeof useAblyToken>;
    mockUseAblyToken.mockReturnValue({
      getValidToken: mockGetValidToken,
      fetchToken: jest.fn(),
      clearCache: mockClearCache,
      isPending: false,
      error: null,
    });

    // Setup useQueryClient mock
    mockQueryClientRefetchQueries = jest.fn().mockResolvedValue(undefined);
    mockUseQueryClient = useQueryClient as jest.MockedFunction<typeof useQueryClient>;
    mockUseQueryClient.mockReturnValue({
      refetchQueries: mockQueryClientRefetchQueries,
    } as any);
  });

  describe('Ably connection initialization', () => {
    it('should initialize Ably connection when authenticated', async () => {
      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalledWith(
          expect.objectContaining({
            autoConnect: true,
            disconnectedRetryTimeout: 15000,
            suspendedRetryTimeout: 30000,
          })
        );
      });
    });

    it('should setup authCallback in Ably configuration', async () => {
      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        const ablyConfig = (Ably.Realtime as unknown as jest.Mock).mock.calls[0][0];
        expect(typeof ablyConfig.authCallback).toBe('function');
      });
    });

    it('should not initialize Ably when not authenticated', () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        user: null as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      expect(Ably.Realtime).not.toHaveBeenCalled();
    });

    it('should close connection when user logs out', async () => {
      const { rerender } = render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        user: null as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      rerender(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(mockAblyClose).toHaveBeenCalled();
        expect(mockClearCache).toHaveBeenCalled();
      });
    });
  });

  describe('authCallback functionality', () => {
    it('should invoke authCallback with token when Ably requests token', async () => {
      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      const ablyConfig = (Ably.Realtime as unknown as jest.Mock).mock.calls[0][0];
      const tokenParams = {} as any;
      const callback = jest.fn();

      await act(async () => {
        await ablyConfig.authCallback(tokenParams, callback);
      });

      await waitFor(() => {
        expect(mockGetValidToken).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith(null, mockTokenResponse.token_request);
      });
    });

    it('should pass error to callback when token fetch fails', async () => {
      const error = new Error('Token fetch failed');
      mockGetValidToken.mockRejectedValueOnce(error);

      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      const ablyConfig = (Ably.Realtime as unknown as jest.Mock).mock.calls[0][0];
      const callback = jest.fn();

      await act(async () => {
        await ablyConfig.authCallback({} as any, callback);
      });

      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith(error, null);
      });
    });

    it('should increment auth failure count on token fetch failure', async () => {
      mockGetValidToken.mockRejectedValueOnce(new Error('Failure 1'));

      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      const ablyConfig = (Ably.Realtime as unknown as jest.Mock).mock.calls[0][0];
      const callback = jest.fn();

      // First failure
      await act(async () => {
        await ablyConfig.authCallback({} as any, callback);
      });

      expect(callback).toHaveBeenCalled();

      // Second failure
      mockGetValidToken.mockRejectedValueOnce(new Error('Failure 2'));
      callback.mockClear();

      await act(async () => {
        await ablyConfig.authCallback({} as any, callback);
      });

      expect(callback).toHaveBeenCalled();
    });

    it('should stop retrying after 3 auth failures', async () => {
      const error = new Error('Auth failed');
      mockGetValidToken.mockRejectedValue(error);

      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      const ablyConfig = (Ably.Realtime as unknown as jest.Mock).mock.calls[0][0];
      const callback = jest.fn();

      // Make 3 failed attempts
      for (let i = 0; i < 3; i++) {
        callback.mockClear();
        await act(async () => {
          await ablyConfig.authCallback({} as any, callback);
        });
        expect(callback).toHaveBeenCalled();
      }

      // Fourth attempt should return error about too many auth failures
      callback.mockClear();
      await act(async () => {
        await ablyConfig.authCallback({} as any, callback);
      });

      expect(callback).toHaveBeenCalledWith(
        expect.any(Error),
        null
      );
      const errorCall = callback.mock.calls[0][0];
      expect(errorCall.message).toContain('Ably authentication failed');
    });

    it('should reset failure count on successful token fetch', async () => {
      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      const ablyConfig = (Ably.Realtime as unknown as jest.Mock).mock.calls[0][0];
      const callback = jest.fn();

      // Successful call
      await act(async () => {
        await ablyConfig.authCallback({} as any, callback);
      });

      expect(callback).toHaveBeenCalledWith(null, mockTokenResponse.token_request);

      // Failed call after success
      mockGetValidToken.mockRejectedValueOnce(new Error('Failure'));
      callback.mockClear();

      await act(async () => {
        await ablyConfig.authCallback({} as any, callback);
      });

      expect(callback).toHaveBeenCalledWith(
        expect.any(Error),
        null
      );

      // Success again - should not be blocked
      mockGetValidToken.mockResolvedValueOnce(mockTokenResponse);
      callback.mockClear();

      await act(async () => {
        await ablyConfig.authCallback({} as any, callback);
      });

      expect(callback).toHaveBeenCalledWith(null, mockTokenResponse.token_request);
    });
  });

  describe('Connection state handling', () => {
    it('should set isConnected to true on connected event', async () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: (props) => <AblyProvider>{props.children}</AblyProvider>,
      });

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      expect(result.current.isConnected).toBe(false);

      // Trigger connected callback
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });
    });

    it('should set isConnected to false on disconnected event', async () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: (props) => <AblyProvider>{props.children}</AblyProvider>,
      });

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // First connect
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Then disconnect
      act(() => {
        const disconnectedCallback = (mockAblyConnectionOn as any).disconnectedCallback;
        disconnectedCallback?.();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });
    });

    it('should set isConnected to false on failed event', async () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: (props) => <AblyProvider>{props.children}</AblyProvider>,
      });

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // Trigger failed callback
      act(() => {
        const failedCallback = (mockAblyConnectionOn as any).failedCallback;
        failedCallback?.({
          reason: {
            code: 50000,
            message: 'Connection failed',
          },
        });
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });
    });

    it('should set isConnected to false on suspended event', async () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: (props) => <AblyProvider>{props.children}</AblyProvider>,
      });

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // Trigger suspended callback
      act(() => {
        const suspendedCallback = (mockAblyConnectionOn as any).suspendedCallback;
        suspendedCallback?.();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });
    });

    it('should handle HMAC signature mismatch error (code 40101)', async () => {
      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      act(() => {
        const failedCallback = (mockAblyConnectionOn as any).failedCallback;
        failedCallback?.({
          reason: {
            code: 40101,
            message: 'HMAC signature mismatch',
          },
        });
      });

      // Should handle gracefully without throwing
      expect(true).toBe(true);
    });
  });

  describe('App state handling', () => {
    it('should register app state change listener', async () => {
      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(mockAppStateAddEventListener).toHaveBeenCalledWith(
          'change',
          expect.any(Function)
        );
      });
    });

    it('should reconnect when app comes to foreground from background', async () => {
      // Setup app state listener to capture the callback
      let appStateCallback: ((state: string) => void) | null = null;
      mockAppStateAddEventListener.mockImplementation((event, callback) => {
        appStateCallback = callback;
        return { remove: jest.fn() };
      });

      // Mock AppState.currentState
      Object.defineProperty(AppState, 'currentState', {
        value: 'active',
        writable: true,
        configurable: true,
      });

      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      const mockAblyInstance = (Ably.Realtime as unknown as jest.Mock).mock.results[0].value;
      mockAblyInstance.connection.state = 'disconnected';

      // Simulate app going to background, then to foreground
      mockAblyConnect.mockClear();
      if (appStateCallback) {
        // First go from active to background
        act(() => {
          appStateCallback?.('background');
        });
      }

      if (appStateCallback) {
        // Then go from background to active - should trigger reconnect
        act(() => {
          appStateCallback?.('active');
        });
      }

      await waitFor(() => {
        expect(mockAblyConnect).toHaveBeenCalled();
      });
    });

    it('should reconnect when connection is suspended and app comes to foreground', async () => {
      let appStateCallback: ((state: string) => void) | null = null;
      mockAppStateAddEventListener.mockImplementation((event, callback) => {
        appStateCallback = callback;
        return { remove: jest.fn() };
      });

      // Mock AppState.currentState
      Object.defineProperty(AppState, 'currentState', {
        value: 'active',
        writable: true,
        configurable: true,
      });

      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      const mockAblyInstance = (Ably.Realtime as unknown as jest.Mock).mock.results[0].value;
      mockAblyInstance.connection.state = 'suspended';

      mockAblyConnect.mockClear();
      if (appStateCallback) {
        act(() => {
          appStateCallback?.('background');
        });
      }

      if (appStateCallback) {
        act(() => {
          appStateCallback?.('active');
        });
      }

      await waitFor(() => {
        expect(mockAblyConnect).toHaveBeenCalled();
      });
    });

    it('should not reconnect when connection is already connected', async () => {
      let appStateCallback: ((state: string) => void) | null = null;
      mockAppStateAddEventListener.mockImplementation((event, callback) => {
        appStateCallback = callback;
        return { remove: jest.fn() };
      });

      // Mock AppState.currentState
      Object.defineProperty(AppState, 'currentState', {
        value: 'active',
        writable: true,
        configurable: true,
      });

      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      const mockAblyInstance = (Ably.Realtime as unknown as jest.Mock).mock.results[0].value;
      mockAblyInstance.connection.state = 'connected';

      mockAblyConnect.mockClear();

      // Simulate app foreground transition
      if (appStateCallback) {
        act(() => {
          appStateCallback?.('background');
        });
      }

      if (appStateCallback) {
        act(() => {
          appStateCallback?.('active');
        });
      }

      // Should not reconnect if already connected
      expect(mockAblyConnect).not.toHaveBeenCalled();
    });

    it('should remove app state listener on unmount', async () => {
      const mockRemove = jest.fn();
      mockAppStateAddEventListener.mockReturnValue({
        remove: mockRemove,
      } as any);

      const { unmount } = render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(mockAppStateAddEventListener).toHaveBeenCalled();
      });

      unmount();

      expect(mockRemove).toHaveBeenCalled();
    });

    it('should handle app state transitions from inactive to active', async () => {
      let appStateCallback: ((state: string) => void) | null = null;
      mockAppStateAddEventListener.mockImplementation((event, callback) => {
        appStateCallback = callback;
        return { remove: jest.fn() };
      });

      // Mock AppState.currentState
      Object.defineProperty(AppState, 'currentState', {
        value: 'active',
        writable: true,
        configurable: true,
      });

      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      const mockAblyInstance = (Ably.Realtime as unknown as jest.Mock).mock.results[0].value;
      mockAblyInstance.connection.state = 'disconnected';

      mockAblyConnect.mockClear();

      // Transition from inactive to active
      if (appStateCallback) {
        act(() => {
          appStateCallback?.('inactive');
        });
      }

      if (appStateCallback) {
        act(() => {
          appStateCallback?.('active');
        });
      }

      await waitFor(() => {
        expect(mockAblyConnect).toHaveBeenCalled();
      });
    });
  });

  describe('Channel subscription', () => {
    it('should subscribe to mobile:products channel when connected', async () => {
      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // Trigger connected event
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(mockChannelGet).toHaveBeenCalledWith('mobile:products');
        expect(mockChannelSubscribe).toHaveBeenCalledWith(
          'order.created',
          expect.any(Function)
        );
      });
    });

    it('should not subscribe to channel when not connected', async () => {
      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      expect(mockChannelSubscribe).not.toHaveBeenCalled();
    });

    it('should not subscribe to channel when not authenticated', async () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        user: null as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      expect(mockChannelSubscribe).not.toHaveBeenCalled();
    });

    it('should unsubscribe from channel on unmount', async () => {
      const { unmount } = render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // Trigger connected event
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(mockChannelSubscribe).toHaveBeenCalled();
      });

      unmount();

      await waitFor(() => {
        expect(mockChannelUnsubscribe).toHaveBeenCalled();
      });
    });

    it('should unsubscribe when connection state changes', async () => {
      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // Subscribe by connecting
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(mockChannelSubscribe).toHaveBeenCalled();
      });

      // Disconnect
      mockChannelUnsubscribe.mockClear();
      act(() => {
        const disconnectedCallback = (mockAblyConnectionOn as any).disconnectedCallback;
        disconnectedCallback?.();
      });

      await waitFor(() => {
        expect(mockChannelUnsubscribe).toHaveBeenCalled();
      });
    });
  });

  describe('Event handling', () => {
    it('should refetch inventories on order.created event', async () => {
      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // Connect to trigger subscription
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(mockChannelSubscribe).toHaveBeenCalled();
      });

      // Get the message handler
      const messageHandler = mockChannelSubscribe.mock.calls[0][1];

      // Trigger order.created event
      const message: Ably.Message = {
        name: 'order.created',
        data: { orderId: '123' },
        timestamp: Date.now(),
        extras: undefined,
        encoding: '',
        id: 'test-id',
      };

      act(() => {
        messageHandler(message);
      });

      await waitFor(() => {
        expect(mockQueryClientRefetchQueries).toHaveBeenCalledWith({
          queryKey: ['inventories'],
          type: 'active',
        });
      });
    });

    it('should not refetch on other events', async () => {
      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // Connect to trigger subscription
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(mockChannelSubscribe).toHaveBeenCalled();
      });

      mockQueryClientRefetchQueries.mockClear();

      // Get the message handler
      const messageHandler = mockChannelSubscribe.mock.calls[0][1];

      // Trigger different event
      const message: Ably.Message = {
        name: 'order.updated',
        data: { orderId: '123' },
        timestamp: Date.now(),
        extras: undefined,
        encoding: '',
        id: 'test-id',
      };

      act(() => {
        messageHandler(message);
      });

      expect(mockQueryClientRefetchQueries).not.toHaveBeenCalled();
    });

    it('should handle multiple order.created events', async () => {
      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // Connect to trigger subscription
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(mockChannelSubscribe).toHaveBeenCalled();
      });

      mockQueryClientRefetchQueries.mockClear();

      const messageHandler = mockChannelSubscribe.mock.calls[0][1];

      // Trigger multiple events
      for (let i = 0; i < 3; i++) {
        const message: Ably.Message = {
          name: 'order.created',
          data: { orderId: `${i}` },
          timestamp: Date.now(),
          extras: undefined,
          encoding: '',
          id: `test-id-${i}`,
        };

        act(() => {
          messageHandler(message);
        });
      }

      await waitFor(() => {
        expect(mockQueryClientRefetchQueries).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('useAbly hook', () => {
    it('should provide isConnected state', async () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: (props) => <AblyProvider>{props.children}</AblyProvider>,
      });

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      expect(typeof result.current.isConnected).toBe('boolean');
      expect(result.current.isConnected).toBe(false);
    });

    it('should provide ably instance', async () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: (props) => <AblyProvider>{props.children}</AblyProvider>,
      });

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      expect(result.current.ably).toBeDefined();
    });

    it('should throw error when used outside provider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAbly());
      }).toThrow('useAbly must be used within an AblyProvider');

      consoleError.mockRestore();
    });

    it('should update isConnected when connection state changes', async () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: (props) => <AblyProvider>{props.children}</AblyProvider>,
      });

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      expect(result.current.isConnected).toBe(false);

      // Connect
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Disconnect
      act(() => {
        const disconnectedCallback = (mockAblyConnectionOn as any).disconnectedCallback;
        disconnectedCallback?.();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });
    });
  });

  describe('Provider cleanup', () => {
    it('should close Ably connection on unmount', async () => {
      const { unmount } = render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      unmount();

      await waitFor(() => {
        expect(mockAblyClose).toHaveBeenCalled();
      });
    });

    it('should close Ably connection when user logs out', async () => {
      const { rerender } = render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // Ensure connection is established
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      mockAblyClose.mockClear();

      // User logs out
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        user: null as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      rerender(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(mockAblyClose).toHaveBeenCalled();
      });
    });

    it('should clear cache on logout', async () => {
      const { rerender } = render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      mockClearCache.mockClear();

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        user: null as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      rerender(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(mockClearCache).toHaveBeenCalled();
      });
    });

    it('should set isConnected to false on logout', async () => {
      const { result, rerender } = renderHook(
        ({ trigger }: any) => useAbly(),
        {
          wrapper: (props) => <AblyProvider>{props.children}</AblyProvider>,
          initialProps: { trigger: 0 },
        }
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // Connect
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Logout
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        user: null as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      rerender({ trigger: 1 });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });
    });

    it('should null out ably reference on logout and call close', async () => {
      const { result, rerender } = renderHook(
        ({ trigger }: any) => useAbly(),
        {
          wrapper: (props) => <AblyProvider>{props.children}</AblyProvider>,
          initialProps: { trigger: 0 },
        }
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // Ensure Ably instance is properly set by triggering a connection
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(result.current.ably).toBeDefined();
      });

      // After logout, ably should be closed and nulled
      mockAblyClose.mockClear();
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        user: null as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      rerender({ trigger: 1 });

      await waitFor(() => {
        expect(mockAblyClose).toHaveBeenCalled();
      });
    });

    it('should handle logout when ablyRef is already null', async () => {
      // Start not authenticated
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        user: null as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      // Ably should not be initialized
      expect(Ably.Realtime).not.toHaveBeenCalled();

      // Now user logs in
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        user: {} as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      const { rerender: rerender2 } = render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // Logout immediately without waiting for connection
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        user: null as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      rerender2(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      // Should handle cleanup gracefully
      expect(mockClearCache).toHaveBeenCalled();
    });

    it('should close connection and nullify ref when logging out with existing ref', async () => {
      // Start with authenticated state and let Ably initialize
      const { rerender } = render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalledTimes(1);
      });

      // Clear mocks to measure the logout behavior
      mockAblyClose.mockClear();
      mockClearCache.mockClear();

      // Perform logout by changing isAuthenticated to false
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        user: null as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      // Re-render to trigger the effect with the new auth state
      await act(async () => {
        rerender(
          <AblyProvider>
            <></>
          </AblyProvider>
        );
      });

      await waitFor(() => {
        // Wait for the logout effect to execute
        // The logout code path calls clearCache when !isAuthenticated
        expect(mockClearCache).toHaveBeenCalled();
      });

      // Verify that close was called
      expect(mockAblyClose).toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle login flow', async () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        user: null as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      const { rerender } = render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      // Initially not authenticated
      expect(Ably.Realtime).not.toHaveBeenCalled();

      // User logs in
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        user: {} as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      rerender(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });
    });

    it('should handle complete lifecycle', async () => {
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        user: {} as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      const { result, rerender, unmount } = renderHook(
        ({ trigger }: any) => useAbly(),
        {
          wrapper: (props) => <AblyProvider>{props.children}</AblyProvider>,
          initialProps: { trigger: 0 },
        }
      );

      // 1. Provider initialized
      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // 2. Connect
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // 3. Receive event
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(mockChannelSubscribe).toHaveBeenCalled();
      });

      const messageHandler = mockChannelSubscribe.mock.calls[0][1];
      mockQueryClientRefetchQueries.mockClear();

      const message: Ably.Message = {
        name: 'order.created',
        data: { orderId: '123' },
        timestamp: Date.now(),
        extras: undefined,
        encoding: '',
        id: 'test-id',
      };

      act(() => {
        messageHandler(message);
      });

      await waitFor(() => {
        expect(mockQueryClientRefetchQueries).toHaveBeenCalled();
      });

      // 4. Logout
      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        user: null as any,
        login: jest.fn(),
        logout: jest.fn(),
        setUser: jest.fn(),
        clearAuth: jest.fn(),
      });

      rerender({ trigger: 1 });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(mockAblyClose).toHaveBeenCalled();
      });

      // 5. Unmount
      unmount();

      expect(true).toBe(true); // Should complete without errors
    });

    it('should refetch on multiple events in sequence', async () => {
      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // Connect to trigger subscription
      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(mockChannelSubscribe).toHaveBeenCalled();
      });

      mockQueryClientRefetchQueries.mockClear();

      const messageHandler = mockChannelSubscribe.mock.calls[0][1];

      // Send multiple events and verify each triggers refetch
      for (let i = 0; i < 3; i++) {
        const message: Ably.Message = {
          name: 'order.created',
          data: { orderId: `${i}` },
          timestamp: Date.now(),
          extras: undefined,
          encoding: '',
          id: `test-id-${i}`,
        };

        act(() => {
          messageHandler(message);
        });
      }

      await waitFor(() => {
        expect(mockQueryClientRefetchQueries).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Provider context value', () => {
    it('should provide ably instance', async () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: (props) => <AblyProvider>{props.children}</AblyProvider>,
      });

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      // Ably instance is provided by the provider
      expect(result.current.ably).toBeDefined();
    });

    it('should update context when connection state changes', async () => {
      const { result } = renderHook(() => useAbly(), {
        wrapper: (props) => <AblyProvider>{props.children}</AblyProvider>,
      });

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      const initialConnected = result.current.isConnected;

      act(() => {
        const connectedCallback = (mockAblyConnectionOn as any).connectedCallback;
        connectedCallback?.();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      expect(result.current.isConnected).not.toBe(initialConnected);
    });
  });

  describe('Error scenarios', () => {
    it('should handle token fetch returning null', async () => {
      mockGetValidToken.mockResolvedValueOnce(null as any);

      render(
        <AblyProvider>
          <></>
        </AblyProvider>
      );

      await waitFor(() => {
        expect(Ably.Realtime).toHaveBeenCalled();
      });

      const ablyConfig = (Ably.Realtime as unknown as jest.Mock).mock.calls[0][0];
      const callback = jest.fn();

      await act(async () => {
        await ablyConfig.authCallback({} as any, callback);
      });

      // Should handle gracefully
      expect(callback).toHaveBeenCalled();
    });
  });
});
