import { renderHook, act } from '@testing-library/react-native';
import { useAblyToken } from './useAblyToken';
import { useGenerateTokenAuthAblyTokenPost } from '@/api/generated/realtime/realtime';
import type { AblyTokenResponse } from '@/api/generated/models';

jest.mock('@/api/generated/realtime/realtime');

const mockAblyTokenResponse: AblyTokenResponse = {
  token_request: {
    keyName: 'test-key-name',
    clientId: 'test-client-id',
    ttl: 3600000,
    timestamp: 1700000000000,
    capability: '{"test:channel":["subscribe"]}',
    nonce: 'test-nonce-value-very-long-string',
    mac: 'test-mac-signature',
  },
  expires_at: 1700003600000,
  channels: ['test:channel'],
};

describe('useAblyToken', () => {
  let mockMutateAsync: jest.Mock;
  let mockUseGenerateToken: jest.MockedFunction<typeof useGenerateTokenAuthAblyTokenPost>;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(1700000000000);
    mockMutateAsync = jest.fn();
    mockUseGenerateToken = useGenerateTokenAuthAblyTokenPost as jest.MockedFunction<
      typeof useGenerateTokenAuthAblyTokenPost
    >;

    mockUseGenerateToken.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('fetchToken', () => {
    it('should fetch token successfully and return response', async () => {
      mockMutateAsync.mockResolvedValueOnce(mockAblyTokenResponse);

      const { result } = renderHook(() => useAblyToken());

      let response: AblyTokenResponse | null = null;
      await act(async () => {
        response = await result.current.fetchToken();
      });

      expect(response).toEqual(mockAblyTokenResponse);
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    it('should throw error when mutation fails', async () => {
      const error = new Error('Token fetch failed');
      mockMutateAsync.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await expect(result.current.fetchToken()).rejects.toThrow('Token fetch failed');
      });
    });

    it('should handle network errors during fetch', async () => {
      const networkError = new Error('Network request failed');
      mockMutateAsync.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await expect(result.current.fetchToken()).rejects.toThrow('Network request failed');
      });
    });

    it('should return fresh token with different nonce on each call', async () => {
      const response1 = mockAblyTokenResponse;
      const response2: AblyTokenResponse = {
        ...mockAblyTokenResponse,
        token_request: {
          ...mockAblyTokenResponse.token_request,
          nonce: 'different-nonce-value',
        },
      };

      mockMutateAsync.mockResolvedValueOnce(response1);
      mockMutateAsync.mockResolvedValueOnce(response2);

      const { result } = renderHook(() => useAblyToken());

      let response: AblyTokenResponse | null = null;

      await act(async () => {
        response = await result.current.fetchToken();
      });
      expect((response as unknown as AblyTokenResponse).token_request.nonce).toBe('test-nonce-value-very-long-string');

      await act(async () => {
        response = await result.current.fetchToken();
      });
      expect((response as unknown as AblyTokenResponse).token_request.nonce).toBe('different-nonce-value');
    });

    it('should include all token response fields', async () => {
      mockMutateAsync.mockResolvedValueOnce(mockAblyTokenResponse);

      const { result } = renderHook(() => useAblyToken());

      let response: AblyTokenResponse | null = null;
      await act(async () => {
        response = await result.current.fetchToken();
      });

      expect((response as unknown as AblyTokenResponse).token_request.keyName).toBe('test-key-name');
      expect((response as unknown as AblyTokenResponse).token_request.clientId).toBe('test-client-id');
      expect((response as unknown as AblyTokenResponse).token_request.ttl).toBe(3600000);
      expect((response as unknown as AblyTokenResponse).token_request.capability).toBe('{"test:channel":["subscribe"]}');
      expect((response as unknown as AblyTokenResponse).token_request.nonce).toBe('test-nonce-value-very-long-string');
      expect((response as unknown as AblyTokenResponse).token_request.mac).toBe('test-mac-signature');
      expect((response as unknown as AblyTokenResponse).expires_at).toBe(1700003600000);
      expect((response as unknown as AblyTokenResponse).channels).toEqual(['test:channel']);
    });
  });

  describe('getValidToken', () => {
    it('should fetch token when called for the first time', async () => {
      mockMutateAsync.mockResolvedValueOnce(mockAblyTokenResponse);

      const { result } = renderHook(() => useAblyToken());

      let response: AblyTokenResponse | null = null;
      await act(async () => {
        response = await result.current.getValidToken();
      });

      expect(response).toEqual(mockAblyTokenResponse);
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    it('should enforce rate limiting - wait before next fetch within 5 seconds', async () => {
      mockMutateAsync.mockResolvedValue(mockAblyTokenResponse);

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await result.current.getValidToken();
      });

      let secondFetchComplete = false;
      const secondFetchPromise = act(async () => {
        await result.current.getValidToken();
        secondFetchComplete = true;
      });

      expect(secondFetchComplete).toBe(false);

      act(() => {
        jest.runOnlyPendingTimers();
      });

      await secondFetchPromise;

      expect(secondFetchComplete).toBe(true);
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });

    it('should not rate limit after 5+ seconds have passed since last fetch', async () => {
      mockMutateAsync.mockResolvedValue(mockAblyTokenResponse);

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await result.current.getValidToken();
      });

      act(() => {
        jest.setSystemTime(jest.now() + 6000);
      });

      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });

    it('should always fetch fresh token with new nonce', async () => {
      mockMutateAsync.mockResolvedValue(mockAblyTokenResponse);

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await result.current.getValidToken();
      });

      act(() => {
        jest.setSystemTime(jest.now() + 6000);
      });

      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });

    it('should propagate token fetch errors after rate limiting', async () => {
      mockMutateAsync.mockResolvedValueOnce(mockAblyTokenResponse);

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await result.current.getValidToken();
      });

      const error = new Error('Token fetch failed');
      mockMutateAsync.mockRejectedValueOnce(error);

      act(() => {
        jest.setSystemTime(jest.now() + 6000);
      });

      await act(async () => {
        await expect(result.current.getValidToken()).rejects.toThrow('Token fetch failed');
      });
    });
  });

  describe('clearCache', () => {
    it('should clear cache without throwing', () => {
      mockMutateAsync.mockResolvedValue(mockAblyTokenResponse);

      const { result } = renderHook(() => useAblyToken());

      // clearCache should not throw
      act(() => {
        result.current.clearCache();
      });

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('should allow fetch after clearCache', async () => {
      mockMutateAsync.mockResolvedValue(mockAblyTokenResponse);

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await result.current.getValidToken();
      });

      // Clear and try another fetch with time advanced
      act(() => {
        result.current.clearCache();
        jest.setSystemTime(jest.now() + 100);
      });

      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });

    it('should be safe to call multiple times', () => {
      mockMutateAsync.mockResolvedValue(mockAblyTokenResponse);

      const { result } = renderHook(() => useAblyToken());

      // Multiple calls should not throw
      act(() => {
        result.current.clearCache();
        result.current.clearCache();
        result.current.clearCache();
      });

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('hook state and properties', () => {
    it('should return isPending and error from mutation hook', () => {
      mockUseGenerateToken.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
        error: new Error('Test error'),
      } as any);

      const { result } = renderHook(() => useAblyToken());

      expect(result.current.isPending).toBe(true);
      expect(result.current.error).toEqual(new Error('Test error'));
    });

    it('should return all required hook methods', () => {
      const { result } = renderHook(() => useAblyToken());

      expect(typeof result.current.getValidToken).toBe('function');
      expect(typeof result.current.fetchToken).toBe('function');
      expect(typeof result.current.clearCache).toBe('function');
      expect(typeof result.current.isPending).toBe('boolean');
      expect(result.current.error).toBeNull();
    });

    it('should maintain stable function references', () => {
      const { result } = renderHook(() => useAblyToken());

      const fetchToken = result.current.fetchToken;
      const getValidToken = result.current.getValidToken;
      const clearCache = result.current.clearCache;

      expect(result.current.fetchToken).toBe(fetchToken);
      expect(result.current.getValidToken).toBe(getValidToken);
      expect(result.current.clearCache).toBe(clearCache);
    });
  });

  describe('complex token responses', () => {
    it('should handle token response with non-string nonce', async () => {
      const responseWithNonStringNonce: AblyTokenResponse = {
        ...mockAblyTokenResponse,
        token_request: {
          ...mockAblyTokenResponse.token_request,
          nonce: 12345 as any, // Non-string nonce
        },
      };

      mockMutateAsync.mockResolvedValueOnce(responseWithNonStringNonce);

      const { result } = renderHook(() => useAblyToken());

      let response: AblyTokenResponse | null = null;
      await act(async () => {
        response = await result.current.fetchToken();
      });

      expect((response as unknown as AblyTokenResponse).token_request.nonce).toBe(12345);
    });

    it('should handle token response with multiple channels', async () => {
      const multiChannelResponse: AblyTokenResponse = {
        ...mockAblyTokenResponse,
        channels: ['mobile:products', 'mobile:orders', 'users:user123'],
      };

      mockMutateAsync.mockResolvedValueOnce(multiChannelResponse);

      const { result } = renderHook(() => useAblyToken());

      let response: AblyTokenResponse | null = null;
      await act(async () => {
        response = await result.current.fetchToken();
      });

      expect((response as unknown as AblyTokenResponse).channels).toHaveLength(3);
      expect((response as unknown as AblyTokenResponse).channels).toContain('mobile:products');
      expect((response as unknown as AblyTokenResponse).channels).toContain('mobile:orders');
      expect((response as unknown as AblyTokenResponse).channels).toContain('users:user123');
    });

    it('should preserve complex capability JSON', async () => {
      const complexCapability =
        '{"dev:users:user123":["subscribe"],"dev:orders:*":["publish"]}';
      const responseWithComplexCapability: AblyTokenResponse = {
        ...mockAblyTokenResponse,
        token_request: {
          ...mockAblyTokenResponse.token_request,
          capability: complexCapability,
        },
      };

      mockMutateAsync.mockResolvedValueOnce(responseWithComplexCapability);

      const { result } = renderHook(() => useAblyToken());

      let response: AblyTokenResponse | null = null;
      await act(async () => {
        response = await result.current.fetchToken();
      });

      expect((response as unknown as AblyTokenResponse).token_request.capability).toBe(complexCapability);
    });

    it('should handle very long nonce strings', async () => {
      const veryLongNonce = 'n'.repeat(1000);
      const responseWithLongNonce: AblyTokenResponse = {
        ...mockAblyTokenResponse,
        token_request: {
          ...mockAblyTokenResponse.token_request,
          nonce: veryLongNonce,
        },
      };

      mockMutateAsync.mockResolvedValueOnce(responseWithLongNonce);

      const { result } = renderHook(() => useAblyToken());

      let response: AblyTokenResponse | null = null;
      await act(async () => {
        response = await result.current.fetchToken();
      });

      expect((response as unknown as AblyTokenResponse).token_request.nonce).toBe(veryLongNonce);
    });
  });

  describe('multiple sequential operations', () => {
    it('should handle three sequential fetches with rate limiting', async () => {
      mockMutateAsync.mockResolvedValue(mockAblyTokenResponse);

      const { result } = renderHook(() => useAblyToken());

      const responses: (AblyTokenResponse | null)[] = [];

      await act(async () => {
        responses.push(await result.current.getValidToken());
      });

      act(() => {
        jest.setSystemTime(jest.now() + 6000);
      });

      await act(async () => {
        responses.push(await result.current.getValidToken());
      });

      act(() => {
        jest.setSystemTime(jest.now() + 6000);
      });

      await act(async () => {
        responses.push(await result.current.getValidToken());
      });

      expect(responses).toHaveLength(3);
      expect(mockMutateAsync).toHaveBeenCalledTimes(3);
    });

    it('should reset rate limiting after clearCache in sequence', async () => {
      mockMutateAsync.mockResolvedValue(mockAblyTokenResponse);

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await result.current.getValidToken();
      });

      act(() => {
        result.current.clearCache();
      });

      await act(async () => {
        await result.current.getValidToken();
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('error scenarios', () => {
    it('should handle API error during fetch', async () => {
      const error = new Error('API Server Error');
      mockMutateAsync.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await expect(result.current.fetchToken()).rejects.toThrow('API Server Error');
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    it('should handle timeout during token fetch', async () => {
      const error = new Error('Request timeout');
      mockMutateAsync.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await expect(result.current.fetchToken()).rejects.toThrow('Request timeout');
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('rate limiting edge cases', () => {
    it('should calculate correct wait time for partial rate limit period', async () => {
      mockMutateAsync.mockResolvedValue(mockAblyTokenResponse);

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await result.current.getValidToken();
      });

      act(() => {
        jest.setSystemTime(jest.now() + 2000);
      });

      let fetchComplete = false;
      const fetchPromise = act(async () => {
        await result.current.getValidToken();
        fetchComplete = true;
      });

      expect(fetchComplete).toBe(false);

      act(() => {
        jest.runOnlyPendingTimers();
      });

      await fetchPromise;

      expect(fetchComplete).toBe(true);
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle token fetch error after rate limit wait', async () => {
      mockMutateAsync.mockResolvedValueOnce(mockAblyTokenResponse);

      const { result } = renderHook(() => useAblyToken());

      await act(async () => {
        await result.current.getValidToken();
      });

      const error = new Error('Backend service unavailable');
      mockMutateAsync.mockRejectedValueOnce(error);

      act(() => {
        jest.setSystemTime(jest.now() + 6000);
      });

      await act(async () => {
        await expect(result.current.getValidToken()).rejects.toThrow(
          'Backend service unavailable'
        );
      });
    });
  });

  describe('token data integrity', () => {
    it('should preserve all token request fields unchanged', async () => {
      const customResponse: AblyTokenResponse = {
        token_request: {
          keyName: 'custom-key',
          clientId: 'custom-client',
          ttl: 7200000,
          timestamp: 1700100000000,
          capability: '{"*":["*"]}',
          nonce: 'custom-nonce',
          mac: 'custom-mac',
        },
        expires_at: 1700107200000,
        channels: ['channel1', 'channel2'],
      };

      mockMutateAsync.mockResolvedValueOnce(customResponse);

      const { result } = renderHook(() => useAblyToken());

      let response: AblyTokenResponse | null = null;
      await act(async () => {
        response = await result.current.fetchToken();
      });

      expect(response).toEqual(customResponse);
    });

    it('should return different tokens on subsequent calls', async () => {
      const token1 = mockAblyTokenResponse;
      const token2: AblyTokenResponse = {
        ...mockAblyTokenResponse,
        token_request: {
          ...mockAblyTokenResponse.token_request,
          nonce: 'nonce-2',
          timestamp: 1700001000000,
        },
      };

      mockMutateAsync.mockResolvedValueOnce(token1);
      mockMutateAsync.mockResolvedValueOnce(token2);

      const { result } = renderHook(() => useAblyToken());

      let response1: AblyTokenResponse | null = null;
      let response2: AblyTokenResponse | null = null;

      await act(async () => {
        response1 = await result.current.fetchToken();
      });

      await act(async () => {
        response2 = await result.current.fetchToken();
      });

      expect((response1 as unknown as AblyTokenResponse).token_request.nonce).not.toBe((response2 as unknown as AblyTokenResponse).token_request.nonce);
      expect((response1 as unknown as AblyTokenResponse).token_request.timestamp).not.toBe((response2 as unknown as AblyTokenResponse).token_request.timestamp);
    });
  });
});
