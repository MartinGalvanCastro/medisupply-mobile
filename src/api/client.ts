import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';

// Get API base URL from environment or use default
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'https://bffproyecto.juanandresdeveloper.com';

// Create axios instance with default configuration
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for adding auth tokens
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Handle unauthorized - clear auth and redirect to login
      console.error('Unauthorized request');
    }

    if (error.response?.status === 403) {
      console.error('Forbidden request');
    }

    if (error.response?.status === 500) {
      console.error('Server error');
    }

    return Promise.reject(error);
  }
);

// Custom instance mutator for Orval
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = axiosInstance({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error: Adding cancel to promise
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default customInstance;
