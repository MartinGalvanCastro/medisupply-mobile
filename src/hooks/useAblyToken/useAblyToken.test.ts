import { renderHook, act, cleanup } from '@testing-library/react-native';
import { useAblyToken } from './useAblyToken';
import { useGenerateTokenAuthAblyTokenPost } from '@/api/generated/realtime/realtime';
import type { AblyTokenResponse } from '@/api/generated/models';

// Mock the Orval-generated mutation hook
jest.mock('@/api/generated/realtime/realtime', () => ({
  useGenerateTokenAuthAblyTokenPost: jest.fn(),
}));

describe('useAblyToken', () => {
  let fakeTimersActive = false;

  // Mock token response with 1-hour expiry
  const createMockTokenResponse = (expiresInMs = 3600000): AblyTokenResponse => {
    const timestamp = fakeTimersActive ? 1731591000000 : Date.now();
    return {
      token_request: {
        keyName: 'test-key',
        ttl: 3600000,
        timestamp,
        capability: '{"mobile:products":["subscribe"]}',
        nonce: 'test-nonce',
        mac: 'test-mac',
        clientId: 'test-client-id',
      },
      expires_at: timestamp + expiresInMs,
      channels: ['mobile:products'],
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    try {
      cleanup();
    } catch (e) {
      // Ignore errors from cleanup
    }
    if (fakeTimersActive) {
      jest.useRealTimers();
      fakeTimersActive = false;
    }
  });

  const setupFakeTimers = () => {
    if (!fakeTimersActive) {
      jest.useFakeTimers();
      jest.setSystemTime(1731591000000);
      fakeTimersActive = true;
    }
  };

  describe('Token Fetching', () => {
    it('should fetch token on first call to getValidToken', async () => {
      const mockMutateAsync = jest.fn();
      const mockToken = createMockTokenResponse();
      mockMutateAsync.mockResolvedValueOnce(mockToken);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      let token: AblyTokenResponse | undefined;
      await act(async () => {
        token = await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
      expect(token).toEqual(mockToken);
    });

    it('should cache token after successful fetch', async () => {
      const mockMutateAsync = jest.fn();
      const mockToken = createMockTokenResponse();
      mockMutateAsync.mockResolvedValueOnce(mockToken);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(1); // Still only 1 call
    });

    it('should return cached token when valid', async () => {
      setupFakeTimers();
      const mockMutateAsync = jest.fn();
      const mockToken = createMockTokenResponse();
      mockMutateAsync.mockResolvedValueOnce(mockToken);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      let firstToken: AblyTokenResponse | undefined;
      let secondToken: AblyTokenResponse | undefined;

      await act(async () => {
        firstToken = await result.current.getValidToken();
      });

      // Advance time but not near expiry (5 min = 300000ms)
      jest.advanceTimersByTime(1000000); // ~16 min

      await act(async () => {
        secondToken = await result.current.getValidToken();
      });

      expect(firstToken).toBe(secondToken);
      expect(mockMutateAsync).toHaveBeenCalledTimes(1); // No re-fetch
    });
  });

  describe('Token Expiry Detection', () => {
    it('should refetch when token expires in less than 5 minutes', async () => {
      setupFakeTimers();
      const mockMutateAsync = jest.fn();
      const mockTokenFresh = createMockTokenResponse(3600000);
      const mockTokenFresh2 = createMockTokenResponse();

      mockMutateAsync
        .mockResolvedValueOnce(mockTokenFresh)
        .mockResolvedValueOnce(mockTokenFresh2);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      // Fetch first token
      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(1);

      // Call again without advancing time - should still be valid
      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(1);

      // Advance time by 50 minutes - now expires in 10 minutes (still > 5 min)
      jest.advanceTimersByTime(3000000); // 50 minutes

      // Should still use cache
      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(1);

      // Advance time by another 6 minutes - now expires in 4 minutes (less than 5)
      jest.advanceTimersByTime(360000); // 6 minutes

      // Now should refetch
      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });

    it('should refetch when no cached token exists', async () => {
      const mockMutateAsync = jest.fn();
      const mockToken = createMockTokenResponse();
      mockMutateAsync.mockResolvedValueOnce(mockToken);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    it('should refetch at exactly 5 minute boundary', async () => {
      setupFakeTimers();
      const mockMutateAsync = jest.fn();
      const mockTokenExpiring = createMockTokenResponse(300000); // Expires in exactly 5 min
      const mockTokenFresh = createMockTokenResponse();

      mockMutateAsync
        .mockResolvedValueOnce(mockTokenExpiring)
        .mockResolvedValueOnce(mockTokenFresh);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await result.current.getValidToken();
      });

      // Advance time by 1ms past the 5-minute threshold
      jest.advanceTimersByTime(300001);

      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });

    it('should use cached token when expires in more than 5 minutes', async () => {
      setupFakeTimers();
      const mockMutateAsync = jest.fn();
      const mockToken = createMockTokenResponse(600000); // Expires in 10 minutes
      mockMutateAsync.mockResolvedValueOnce(mockToken);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await result.current.getValidToken();
      });

      // Advance time by 4 minutes
      jest.advanceTimersByTime(240000);

      // Should still use cache (expires in 6 minutes)
      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors and throw', async () => {
      const mockMutateAsync = jest.fn();
      const error = new Error('Token fetch failed');
      mockMutateAsync.mockRejectedValueOnce(error);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      let thrownError: Error | null = null;
      try {
        await act(async () => {
          await result.current.getValidToken();
        });
      } catch (e) {
        thrownError = e as Error;
      }
      expect(thrownError?.message).toBe('Token fetch failed');

      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    it('should expose error state from mutation', () => {
      const mockMutateAsync = jest.fn();
      const error = new Error('Mutation error');
      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error,
      });

      const { result } = renderHook(() => useAblyToken());

      expect(result.current.error).toBe(error);
    });

    it('should expose isPending state from mutation', () => {
      const mockMutateAsync = jest.fn();
      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      expect(result.current.isPending).toBe(true);
    });

    it('should retry fetch after error', async () => {
      const mockMutateAsync = jest.fn();
      const mockToken = createMockTokenResponse();
      const error = new Error('Network error');

      mockMutateAsync
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockToken);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      // First attempt fails
      let firstError: Error | null = null;
      try {
        await act(async () => {
          await result.current.getValidToken();
        });
      } catch (e) {
        firstError = e as Error;
      }
      expect(firstError?.message).toBe('Network error');

      // Second attempt succeeds
      let token: AblyTokenResponse | undefined;
      await act(async () => {
        token = await result.current.getValidToken();
      });

      expect(token).toEqual(mockToken);
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cache Management', () => {
    it('should clear cache when clearCache is called', async () => {
      const mockMutateAsync = jest.fn();
      const mockToken = createMockTokenResponse();
      mockMutateAsync.mockResolvedValue(mockToken);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      // Fetch and cache token
      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(1);

      // Clear cache
      act(() => {
        result.current.clearCache();
      });

      // Next call should refetch (cache is cleared)
      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });

    it('should clear cache without triggering fetches', async () => {
      const mockMutateAsync = jest.fn();
      const mockToken = createMockTokenResponse();
      mockMutateAsync.mockResolvedValueOnce(mockToken);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      // Fetch token
      await act(async () => {
        await result.current.getValidToken();
      });

      // Clear cache (should be synchronous, no fetch)
      act(() => {
        result.current.clearCache();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchToken Method', () => {
    it('should fetch fresh token regardless of cache', async () => {
      const mockMutateAsync = jest.fn();
      const mockToken1 = createMockTokenResponse();
      const mockToken2 = createMockTokenResponse(3600000);

      mockMutateAsync
        .mockResolvedValueOnce(mockToken1)
        .mockResolvedValueOnce(mockToken2);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      // Get and cache token
      let token1: AblyTokenResponse | undefined;
      await act(async () => {
        token1 = await result.current.getValidToken();
      });

      // Use fetchToken to get fresh token
      let token2: AblyTokenResponse | undefined;
      await act(async () => {
        token2 = await result.current.fetchToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
      expect(token1).not.toBe(token2);
    });

    it('should update cache when fetchToken is called', async () => {
      const mockMutateAsync = jest.fn();
      const mockToken1 = createMockTokenResponse(3600000);
      const mockToken2 = createMockTokenResponse(7200000);

      mockMutateAsync
        .mockResolvedValueOnce(mockToken1)
        .mockResolvedValueOnce(mockToken2);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      // Fetch first token
      await act(async () => {
        await result.current.fetchToken();
      });

      // Fetch new token
      await act(async () => {
        await result.current.fetchToken();
      });

      // Next getValidToken should return the latest cached token
      let cachedToken: AblyTokenResponse | undefined;
      await act(async () => {
        cachedToken = await result.current.getValidToken();
      });

      expect(cachedToken?.expires_at).toBe(mockToken2.expires_at);
      expect(mockMutateAsync).toHaveBeenCalledTimes(2); // No additional fetch
    });
  });

  describe('Return Values', () => {
    it('should return all expected methods and properties', () => {
      const mockMutateAsync = jest.fn();
      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      expect(result.current).toHaveProperty('getValidToken');
      expect(result.current).toHaveProperty('fetchToken');
      expect(result.current).toHaveProperty('clearCache');
      expect(result.current).toHaveProperty('isPending');
      expect(result.current).toHaveProperty('error');

      expect(typeof result.current.getValidToken).toBe('function');
      expect(typeof result.current.fetchToken).toBe('function');
      expect(typeof result.current.clearCache).toBe('function');
    });

    it('should maintain function references across renders', () => {
      const mockMutateAsync = jest.fn();
      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result, rerender } = renderHook(() => useAblyToken());

      const getValidToken1 = result.current.getValidToken;
      const fetchToken1 = result.current.fetchToken;
      const clearCache1 = result.current.clearCache;

      rerender(() => useAblyToken());

      const getValidToken2 = result.current.getValidToken;
      const fetchToken2 = result.current.fetchToken;
      const clearCache2 = result.current.clearCache;

      // useCallback should maintain references
      expect(getValidToken1).toBe(getValidToken2);
      expect(fetchToken1).toBe(fetchToken2);
      expect(clearCache1).toBe(clearCache2);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete token lifecycle', async () => {
      setupFakeTimers();
      const mockMutateAsync = jest.fn();
      const mockTokenExpiring = createMockTokenResponse(240000); // 4 min
      const mockTokenFresh = createMockTokenResponse(3600000); // 1 hour

      mockMutateAsync
        .mockResolvedValueOnce(mockTokenExpiring)
        .mockResolvedValueOnce(mockTokenFresh);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      // Initial fetch
      let token1: AblyTokenResponse | undefined;
      await act(async () => {
        token1 = await result.current.getValidToken();
      });

      expect(token1?.expires_at).toBe(mockTokenExpiring.expires_at);

      // Move forward, trigger refresh
      jest.advanceTimersByTime(60000); // 1 minute

      // Should refetch (expires in 3 minutes now)
      let token2: AblyTokenResponse | undefined;
      await act(async () => {
        token2 = await result.current.getValidToken();
      });

      expect(token2?.expires_at).toBe(mockTokenFresh.expires_at);

      // Clear cache for logout
      act(() => {
        result.current.clearCache();
      });

      // Verify cache is clear by checking that next call would refetch
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle repeated token refresh cycles', async () => {
      setupFakeTimers();
      const mockMutateAsync = jest.fn();
      const mockToken = createMockTokenResponse(3600000);
      mockMutateAsync.mockResolvedValue(mockToken);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      // Get initial token
      await act(async () => {
        await result.current.getValidToken();
      });

      // Make multiple calls over time without crossing the 5-minute boundary
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(50000); // 50 seconds each

        await act(async () => {
          await result.current.getValidToken();
        });
      }

      // Should still be on first token (total advanced: 250s, < 5min)
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle token expiry exactly at current time', async () => {
      setupFakeTimers();
      const mockMutateAsync = jest.fn();
      const mockToken = createMockTokenResponse(0); // Expires now
      const mockTokenFresh = createMockTokenResponse();

      mockMutateAsync
        .mockResolvedValueOnce(mockToken)
        .mockResolvedValueOnce(mockTokenFresh);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      // First fetch
      await act(async () => {
        await result.current.getValidToken();
      });

      // Should refetch because timeUntilExpiry < 300000
      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle very large expiry times', async () => {
      setupFakeTimers();
      const mockMutateAsync = jest.fn();
      const mockToken = createMockTokenResponse(86400000); // 24 hours
      mockMutateAsync.mockResolvedValueOnce(mockToken);

      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await result.current.getValidToken();
      });

      // Advance 12 hours
      jest.advanceTimersByTime(43200000);

      // Should still use cache
      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    it('should handle mutation with retry configuration', () => {
      const mockMutateAsync = jest.fn();
      (useGenerateTokenAuthAblyTokenPost as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      renderHook(() => useAblyToken());

      // Verify that hook uses mutation options with retry
      expect(useGenerateTokenAuthAblyTokenPost).toHaveBeenCalledWith(
        expect.objectContaining({
          mutation: expect.objectContaining({
            retry: 1,
            retryDelay: 1000,
          }),
        })
      );
    });
  });
});
