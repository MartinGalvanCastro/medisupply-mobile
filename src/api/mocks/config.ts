/**
 * MSW Mock Configuration
 *
 * Centralized configuration for Mock Service Worker.
 * Controls when mocking is enabled and configures mock behavior.
 */

export type MockScenario = 'success' | 'error' | 'empty' | 'slow';

export interface MockConfig {
  /**
   * Enable/disable mocking globally
   * Set via EXPO_PUBLIC_ENABLE_MOCKS environment variable
   */
  enabled: boolean;

  /**
   * Enable console logging for mock requests
   */
  logging: boolean;

  /**
   * Network delay simulation (in milliseconds)
   */
  delay: number;

  /**
   * Current test scenario
   * Use this to test different response states
   */
  scenarios: {
    authentication: MockScenario;
  };
}

/**
 * Default mock configuration
 * Reads from environment variables with fallbacks
 */
export const mockConfig: MockConfig = {
  enabled: process.env.EXPO_PUBLIC_ENABLE_MOCKS === 'true',
  logging: process.env.EXPO_PUBLIC_MOCK_LOGGING === 'true' || true,
  delay: parseInt(process.env.EXPO_PUBLIC_MOCK_DELAY || '750', 10),
  scenarios: {
    authentication: 'success',
  },
};

/**
 * Update mock configuration at runtime
 * Useful for testing different scenarios
 */
export const updateMockConfig = (updates: Partial<MockConfig>): void => {
  Object.assign(mockConfig, updates);
};

/**
 * Reset mock configuration to defaults
 */
export const resetMockConfig = (): void => {
  mockConfig.enabled = process.env.EXPO_PUBLIC_ENABLE_MOCKS === 'true';
  mockConfig.logging = true;
  mockConfig.delay = 750;
  mockConfig.scenarios.authentication = 'success';
};

/**
 * Log mock request information
 */
export const logMockRequest = (
  method: string,
  endpoint: string,
  body?: unknown
): void => {
  if (mockConfig.logging) {
    console.log(`[MSW] ${method} ${endpoint}`, body ? body : '');
  }
};

/**
 * Log mock response information
 */
export const logMockResponse = (
  endpoint: string,
  status: number,
  data?: unknown
): void => {
  if (mockConfig.logging) {
    console.log(`[MSW] Response ${status} for ${endpoint}`, data ? data : '');
  }
};
