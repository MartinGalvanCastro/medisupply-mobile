/**
 * Axios Mock Interceptor
 *
 * Custom Axios interceptor-based mocking solution for React Native.
 * Replaces MSW with a native interceptor approach that works in React Native runtime.
 */

import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { MockHandler, MockResponse } from './mocks/handlers/types';
import { mockConfig } from './mocks/config';

/**
 * Delay execution for the specified number of milliseconds
 */
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Match a URL against an endpoint pattern
 */
const matchesEndpoint = (url: string, pattern: string | RegExp): boolean => {
  if (pattern instanceof RegExp) {
    return pattern.test(url);
  }

  // For string patterns, check if the URL includes the pattern
  return url.includes(pattern);
};

/**
 * Match a request config against a handler
 */
const matchesHandler = (config: AxiosRequestConfig, handler: MockHandler): boolean => {
  // Check HTTP method
  if (config.method?.toUpperCase() !== handler.method) {
    return false;
  }

  // Get the URL (might be relative or absolute)
  const url = config.url || '';

  // Check if endpoint matches
  return matchesEndpoint(url, handler.endpoint);
};

/**
 * Find the appropriate handler for a request
 */
const findHandler = (config: AxiosRequestConfig, handlers: MockHandler[]): MockHandler | null => {
  return handlers.find((handler) => matchesHandler(config, handler)) || null;
};

/**
 * Log mock request information
 */
const logMockRequest = (method: string, url: string): void => {
  if (mockConfig.logging) {
    console.log(`[Mock] ${method} ${url}`);
  }
};

/**
 * Log mock response information
 */
const logMockResponse = (method: string, url: string, status: number): void => {
  if (mockConfig.logging) {
    console.log(`[Mock] ${method} ${url} - ${status}`);
  }
};

/**
 * Setup mock interceptor for Axios instance
 */
export const setupMockInterceptor = (
  axiosInstance: AxiosInstance,
  handlers: MockHandler[]
): void => {
  if (!mockConfig.enabled) {
    console.log('[Mock] Mocking is disabled');
    return;
  }

  // Add request interceptor to catch requests and return mock responses
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Try to find a matching handler
      const handler = findHandler(config, handlers);

      if (!handler) {
        // No handler found, let the request go through to the real API
        return config;
      }

      const method = config.method?.toUpperCase() || 'GET';
      const url = config.url || '';

      // Log the mock request
      logMockRequest(method, url);

      // Simulate network delay
      if (mockConfig.delay > 0) {
        await delay(mockConfig.delay);
      }

      try {
        // Execute the handler
        const mockResponse: MockResponse = await Promise.resolve(
          handler.handler(config)
        );

        // Log the mock response
        logMockResponse(method, url, mockResponse.status);

        // Create a mock Axios error for non-2xx status codes
        if (mockResponse.status < 200 || mockResponse.status >= 300) {
          const error: any = new Error(`Mock Request failed with status ${mockResponse.status}`);
          error.isAxiosError = true;
          error.config = config;
          error.response = {
            data: mockResponse.data,
            status: mockResponse.status,
            statusText: getStatusText(mockResponse.status),
            headers: mockResponse.headers || {},
            config,
          };
          throw error;
        }

        // For successful responses, we need to trick Axios into thinking
        // the request completed successfully. We'll inject the response
        // into the adapter.
        config.adapter = async () => {
          return {
            data: mockResponse.data,
            status: mockResponse.status,
            statusText: getStatusText(mockResponse.status),
            headers: mockResponse.headers || {},
            config,
          };
        };

        return config;
      } catch (error: any) {
        // If the handler threw an error (for error responses), re-throw it
        if (error.isAxiosError || error.response) {
          throw error;
        }

        // For unexpected errors, log and re-throw
        console.error('[Mock] Handler error:', error);
        throw error;
      }
    },
    (error) => {
      // Pass through request errors
      return Promise.reject(error);
    }
  );

  // Log initialization
  console.log('[Mock] Interceptor initialized');
  console.log('[Mock] API Base URL:', axiosInstance.defaults.baseURL);
  console.log('[Mock] Mocking enabled:', mockConfig.enabled);
  console.log('[Mock] Logging enabled:', mockConfig.logging);
  console.log('[Mock] Network delay:', mockConfig.delay, 'ms');
  console.log('[Mock] Registered handlers:', handlers.length);

  if (mockConfig.logging) {
    console.log('\n[Mock] Available mock users:');
    console.log('  - client@medisupply.com (password: Test1234!)');
    console.log('  - seller@medisupply.com (password: Test1234!)');
    console.log('  - admin@medisupply.com (password: Admin1234!)\n');
  }
};

/**
 * Get HTTP status text for a status code
 */
const getStatusText = (status: number): string => {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };

  return statusTexts[status] || 'Unknown';
};
