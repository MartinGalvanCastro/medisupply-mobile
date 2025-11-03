import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { setupMockInterceptor } from './mock-interceptor';
import { handlers } from './mocks/handlers';
import { useAuthStore } from '@/store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup mock interceptor (will only activate if EXPO_PUBLIC_ENABLE_MOCKS=true)
setupMockInterceptor(axiosInstance, handlers);

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const { tokens } = useAuthStore.getState();
    if (tokens?.idToken) {
      config.headers.Authorization = `Bearer ${tokens.idToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response?.status === 401) {
      // Handle unauthorized - logout user
    }
    return Promise.reject(error);
  }
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = axiosInstance({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }: AxiosResponse<T>) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default customInstance;
