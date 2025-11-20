import { AxiosError } from 'axios';
import { isNetworkError, getErrorMessage } from './error.utils';

describe('isNetworkError', () => {
  it('returns true for network error without response', () => {
    const error = new AxiosError('Network Error');
    error.response = undefined;
    expect(isNetworkError(error)).toBe(true);
  });

  it('returns true for ECONNABORTED error code', () => {
    const error = new AxiosError('timeout');
    error.code = 'ECONNABORTED';
    expect(isNetworkError(error)).toBe(true);
  });

  it('returns true for ERR_NETWORK error code', () => {
    const error = new AxiosError('network error');
    error.code = 'ERR_NETWORK';
    expect(isNetworkError(error)).toBe(true);
  });

  it('returns false for axios error with response', () => {
    const error = new AxiosError('Bad Request');
    error.response = { status: 400, data: {}, headers: {}, statusText: 'Bad Request', config: {} as any };
    expect(isNetworkError(error)).toBe(false);
  });

  it('returns false for non-axios errors', () => {
    expect(isNetworkError(new Error('Some error'))).toBe(false);
    expect(isNetworkError('string error')).toBe(false);
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError(undefined)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('extracts message from axios error response detail', () => {
    const error = new AxiosError('Request failed');
    error.response = {
      status: 400,
      data: { detail: 'Invalid credentials' },
      headers: {},
      statusText: 'Bad Request',
      config: {} as any,
    };
    expect(getErrorMessage(error)).toBe('Invalid credentials');
  });

  it('falls back to axios error message', () => {
    const error = new AxiosError('Request timeout');
    error.response = {
      status: 500,
      data: {},
      headers: {},
      statusText: 'Server Error',
      config: {} as any,
    };
    expect(getErrorMessage(error)).toBe('Request timeout');
  });

  it('returns default message when axios error has no message', () => {
    const error = new AxiosError('');
    error.response = {
      status: 500,
      data: {},
      headers: {},
      statusText: 'Server Error',
      config: {} as any,
    };
    expect(getErrorMessage(error)).toBe('An error occurred');
  });

  it('falls back to default message when axios error has empty detail and message', () => {
    const error = new AxiosError();
    error.response = {
      status: 500,
      data: { detail: '' },
      headers: {},
      statusText: 'Server Error',
      config: {} as any,
    };
    expect(getErrorMessage(error)).toBe('An error occurred');
  });

  it('extracts message from standard Error', () => {
    const error = new Error('Something went wrong');
    expect(getErrorMessage(error)).toBe('Something went wrong');
  });

  it('returns default message for unknown error types', () => {
    expect(getErrorMessage('string error')).toBe('An error occurred');
    expect(getErrorMessage(null)).toBe('An error occurred');
    expect(getErrorMessage(undefined)).toBe('An error occurred');
    expect(getErrorMessage(123)).toBe('An error occurred');
  });

  it('uses custom default message', () => {
    expect(getErrorMessage(null, 'Custom error')).toBe('Custom error');
  });
});
