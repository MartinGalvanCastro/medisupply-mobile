import { AxiosError } from 'axios';

/**
 * Check if error is a network error
 *
 * Detects various types of network-related errors from axios requests:
 * - No response from server (Network Error)
 * - Connection aborted or timeout (ECONNABORTED)
 * - General network errors (ERR_NETWORK)
 *
 * @param error - Unknown error object to check
 * @returns true if the error is network-related, false otherwise
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    // Network error (no response from server)
    if (!error.response && error.message === 'Network Error') {
      return true;
    }
    // Request timeout or no internet connection
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      return true;
    }
  }
  return false;
};

/**
 * Extract error message from various error types
 *
 * Attempts to extract a meaningful error message from different error sources:
 * - AxiosError: Tries response.data.detail first, then error.message
 * - Standard Error: Uses error.message
 * - Unknown: Returns default message
 *
 * @param error - Unknown error object
 * @param defaultMessage - Fallback message if no specific message can be extracted
 * @returns Extracted or default error message
 */
export const getErrorMessage = (error: unknown, defaultMessage: string = 'An error occurred'): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.detail || error.message || defaultMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};
