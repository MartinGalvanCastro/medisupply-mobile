import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const { tokens } = useAuthStore.getState();
    if (tokens?.idToken) {
      config.headers.Authorization = `Bearer ${tokens.idToken}`;
      console.log('[API Client] Adding Authorization header');
    } else {
      console.log('[API Client] No idToken available, skipping Authorization header');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401/403 unauthorized errors
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      console.log('[API Client] Received 401/403, attempting token refresh...');

      // If already refreshing, queue this request
      if (isRefreshing) {
        console.log('[API Client] Refresh in progress, queuing request...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { tokens, logout, setTokens } = useAuthStore.getState();

      if (!tokens?.refreshToken) {
        console.log('[API Client] No refresh token available, logging out...');
        logout();
        processQueue(new Error('No refresh token'), null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        console.log('[API Client] Refreshing tokens...');

        // Call the refresh endpoint directly (avoiding circular dependency)
        const response = await axiosInstance.post<{
          access_token: string;
          id_token: string;
          expires_in: number;
          token_type: string;
        }>('/auth/refresh', {
          refresh_token: tokens.refreshToken,
        });

        const newTokens = {
          accessToken: response.data.access_token,
          idToken: response.data.id_token,
          refreshToken: tokens.refreshToken, // Keep the same refresh token
          expiresIn: response.data.expires_in,
          tokenType: response.data.token_type,
        };

        console.log('[API Client] Token refresh successful');
        setTokens(newTokens);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newTokens.idToken}`;

        processQueue(null, newTokens.idToken);
        isRefreshing = false;

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        console.error('[API Client] Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;

        // Only logout on authentication errors (401, 403), not on server errors (5xx)
        const status = refreshError?.response?.status;
        if (status === 401 || status === 403) {
          console.log('[API Client] Authentication failed, logging out...');
          logout();
        } else {
          console.log('[API Client] Token refresh failed due to server/network error, keeping user logged in');
        }

        return Promise.reject(refreshError);
      }
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
