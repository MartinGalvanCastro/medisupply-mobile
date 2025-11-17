import { useCallback, useRef } from 'react';
import { useGenerateTokenAuthAblyTokenPost } from '@/api/generated/realtime/realtime';
import type { AblyTokenResponse } from '@/api/generated/models';

/**
 * Hook to fetch Ably tokens.
 *
 * IMPORTANT: Ably TokenRequests contain nonces which are single-use.
 * We MUST fetch a fresh TokenRequest for each authentication attempt.
 * Caching and reusing TokenRequests causes "Nonce value replayed" errors.
 *
 * Features:
 * - Fetches token from backend using Orval-generated mutation
 * - Tracks last fetch time to prevent request spam (5 second cooldown)
 *
 * @example
 * const { getValidToken, clearCache } = useAblyToken();
 *
 * // Always fetches a fresh token
 * const token = await getValidToken();
 *
 * // Clear cache on logout
 * clearCache();
 */
export const useAblyToken = () => {
  // Track last fetch time to prevent spamming the backend
  const lastFetchRef = useRef<number>(0);

  const { mutateAsync, isPending, error } = useGenerateTokenAuthAblyTokenPost({
    mutation: {
      retry: 1, // Only retry once for token fetch
      retryDelay: 1000, // 1 second delay
    },
  });

  /**
   * Fetch a new token from the backend
   * Always returns a fresh TokenRequest with a new nonce
   */
  const fetchToken = useCallback(async (): Promise<AblyTokenResponse> => {
    try {
      console.log('[useAblyToken] Fetching fresh TokenRequest from backend...');
      const response = await mutateAsync();

      // Update last fetch time
      lastFetchRef.current = Date.now();

      console.log('[useAblyToken] TokenRequest fetched successfully');
      console.log('[useAblyToken] Expires at:', new Date(response.expires_at).toLocaleString());

      const nonce = response.token_request.nonce;
      const nonceDisplay = typeof nonce === 'string' ? nonce.substring(0, 10) + '...' : 'N/A';

      console.log('[useAblyToken] TokenRequest details:', {
        keyName: response.token_request.keyName,
        timestamp: response.token_request.timestamp,
        nonce: nonceDisplay,
        hasCapability: !!response.token_request.capability,
        hasMac: !!response.token_request.mac,
      });

      return response;
    } catch (err) {
      console.error('[useAblyToken] Token fetch failed:', err);
      throw err;
    }
  }, [mutateAsync]);

  /**
   * Get a valid token - ALWAYS fetches fresh to avoid nonce reuse
   *
   * Includes spam protection: won't fetch more than once per 5 seconds
   * to prevent excessive backend calls during rapid reconnection attempts
   */
  const getValidToken = useCallback(async (): Promise<AblyTokenResponse> => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchRef.current;
    const minFetchInterval = 5000; // 5 seconds

    // Spam protection: if we fetched very recently, wait a bit
    if (timeSinceLastFetch < minFetchInterval) {
      const waitTime = minFetchInterval - timeSinceLastFetch;
      console.log(
        `[useAblyToken] Rate limiting: waiting ${waitTime}ms before next fetch...`
      );
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Always fetch fresh TokenRequest (with new nonce)
    // TokenRequests are single-use and cannot be cached
    return fetchToken();
  }, [fetchToken]);

  /**
   * Clear the last fetch timestamp (call on logout)
   */
  const clearCache = useCallback(() => {
    console.log('[useAblyToken] Clearing last fetch timestamp');
    lastFetchRef.current = 0;
  }, []);

  return {
    getValidToken,
    fetchToken,
    clearCache,
    isPending,
    error,
  };
};
