/**
 * Mock Handler Types
 *
 * Type definitions for the Axios interceptor-based mocking system.
 * These types define the contract for mock handlers and responses.
 */

import type { AxiosRequestConfig } from 'axios';

/**
 * HTTP methods supported by mock handlers
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Mock response structure
 * Handlers should return this object to mock HTTP responses
 */
export interface MockResponse<T = any> {
  /**
   * HTTP status code
   */
  status: number;

  /**
   * Response body data
   */
  data: T;

  /**
   * Optional headers to include in the response
   */
  headers?: Record<string, string>;
}

/**
 * Mock handler function signature
 * Receives the Axios request config and returns a mock response
 */
export type MockHandlerFunction = (
  config: AxiosRequestConfig
) => Promise<MockResponse> | MockResponse;

/**
 * Mock handler configuration
 * Defines how to match requests and what response to return
 */
export interface MockHandler {
  /**
   * HTTP method to match
   */
  method: HttpMethod;

  /**
   * Endpoint pattern to match
   * Can be:
   * - Exact string match: '/auth/login'
   * - Regular expression: /\/auth\/.*\/
   */
  endpoint: string | RegExp;

  /**
   * Handler function that generates the mock response
   */
  handler: MockHandlerFunction;

  /**
   * Optional description for logging/debugging
   */
  description?: string;
}

/**
 * Type guard to check if a value is a MockResponse
 */
export function isMockResponse(value: any): value is MockResponse {
  return (
    value &&
    typeof value === 'object' &&
    'status' in value &&
    'data' in value &&
    typeof value.status === 'number'
  );
}
