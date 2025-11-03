import { AxiosError } from 'axios';
import { isNetworkError, getErrorMessage } from './error.utils';

describe('error.utils', () => {
  describe('isNetworkError', () => {
    it('should return true for Network Error without response', () => {
      const error = new AxiosError('Network Error');
      error.response = undefined;

      expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for ECONNABORTED error code', () => {
      const error = new AxiosError('Connection aborted');
      error.code = 'ECONNABORTED';

      expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for ERR_NETWORK error code', () => {
      const error = new AxiosError('Network error');
      error.code = 'ERR_NETWORK';

      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for AxiosError with response', () => {
      const error = new AxiosError('Server error');
      error.response = {
        data: {},
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      };

      expect(isNetworkError(error)).toBe(false);
    });

    it('should return false for AxiosError with different message', () => {
      const error = new AxiosError('Different error');
      error.response = undefined;

      expect(isNetworkError(error)).toBe(false);
    });

    it('should return false for non-AxiosError', () => {
      const error = new Error('Regular error');

      expect(isNetworkError(error)).toBe(false);
    });

    it('should return false for null error', () => {
      expect(isNetworkError(null)).toBe(false);
    });

    it('should return false for undefined error', () => {
      expect(isNetworkError(undefined)).toBe(false);
    });

    it('should return false for string error', () => {
      expect(isNetworkError('Network Error')).toBe(false);
    });

    it('should return false for object error', () => {
      expect(isNetworkError({ message: 'Network Error' })).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract detail from AxiosError response data', () => {
      const error = new AxiosError('Error');
      error.response = {
        data: { detail: 'Invalid credentials' },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      };

      expect(getErrorMessage(error)).toBe('Invalid credentials');
    });

    it('should fallback to error message when no detail in response', () => {
      const error = new AxiosError('Request failed');
      error.response = {
        data: {},
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      };

      expect(getErrorMessage(error)).toBe('Request failed');
    });

    it('should use default message when AxiosError has no response or message', () => {
      const error = new AxiosError();
      error.response = undefined;
      error.message = '';

      expect(getErrorMessage(error)).toBe('An error occurred');
    });

    it('should use custom default message for AxiosError', () => {
      const error = new AxiosError();
      error.response = undefined;
      error.message = '';

      expect(getErrorMessage(error, 'Custom default')).toBe('Custom default');
    });

    it('should extract message from standard Error', () => {
      const error = new Error('Something went wrong');

      expect(getErrorMessage(error)).toBe('Something went wrong');
    });

    it('should use default message for unknown error type', () => {
      const error = { someProperty: 'value' };

      expect(getErrorMessage(error)).toBe('An error occurred');
    });

    it('should use custom default message for unknown error type', () => {
      const error = 'string error';

      expect(getErrorMessage(error, 'Custom error message')).toBe('Custom error message');
    });

    it('should handle null error with default message', () => {
      expect(getErrorMessage(null)).toBe('An error occurred');
    });

    it('should handle undefined error with default message', () => {
      expect(getErrorMessage(undefined)).toBe('An error occurred');
    });

    it('should prioritize response.data.detail over error.message for AxiosError', () => {
      const error = new AxiosError('Generic message');
      error.response = {
        data: { detail: 'Specific detail' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };

      expect(getErrorMessage(error)).toBe('Specific detail');
    });

    it('should handle AxiosError with no response and use message', () => {
      const error = new AxiosError('Network timeout');
      error.response = undefined;

      expect(getErrorMessage(error)).toBe('Network timeout');
    });

    it('should handle Error with empty message', () => {
      const error = new Error('');

      expect(getErrorMessage(error, 'Fallback message')).toBe('');
    });
  });
});
