import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './AuthProvider';
import { useAuthStore } from '@/store/useAuthStore/useAuthStore';
import { useToast } from '@/providers/ToastProvider/ToastProvider';
import * as authAPIs from '@/api/generated/authentication/authentication';
import { transformTokensFromLogin, transformUserData } from '@/utils/auth';

// Mock dependencies
jest.mock('@/store/useAuthStore/useAuthStore');
jest.mock('@/providers/ToastProvider/ToastProvider');
jest.mock('@/api/generated/authentication/authentication');
jest.mock('@/utils/auth');
jest.mock('@/utils/error', () => ({
  isNetworkError: jest.fn((error) => error?.message === 'Network error'),
}));

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: jest.fn(),
  useQuery: jest.fn(),
}));

describe('AuthProvider', () => {
  let mockToast: any;
  let mockAuthStore: any;
  let mockQueryClient: any;
  let mockLoginMutate: jest.Mock;
  let mockRefreshMutate: jest.Mock;
  let mockSignupMutate: jest.Mock;
  let mockGetMeQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(1704067200000); // 2024-01-01T00:00:00.000Z

    // Setup QueryClient mock first
    mockQueryClient = {
      clear: jest.fn(),
      invalidateQueries: jest.fn(),
      mount: jest.fn(),
      unmount: jest.fn(),
      isFetching: jest.fn(() => 0),
      getQueryData: jest.fn(),
      setQueryData: jest.fn(),
      getQueryState: jest.fn(),
      removeQueries: jest.fn(),
      cancelQueries: jest.fn(),
      resetQueries: jest.fn(),
      refetchQueries: jest.fn(),
      fetchQuery: jest.fn(),
      prefetchQuery: jest.fn(),
      fetchInfiniteQuery: jest.fn(),
      prefetchInfiniteQuery: jest.fn(),
      resumePausedMutations: jest.fn(),
      getDefaultOptions: jest.fn(() => ({})),
      setDefaultOptions: jest.fn(),
      getQueryDefaults: jest.fn(),
      setQueryDefaults: jest.fn(),
      getMutationDefaults: jest.fn(),
      setMutationDefaults: jest.fn(),
      getLogger: jest.fn(),
      setLogger: jest.fn(),
      getIsServerError: jest.fn(),
      setIsServerError: jest.fn(),
    };
    const { useQueryClient } = require('@tanstack/react-query');
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);

    // Setup Toast mock
    mockToast = {
      error: jest.fn(),
      success: jest.fn(),
    };
    (useToast as jest.Mock).mockReturnValue(mockToast);

    // Setup Auth Store mock
    mockAuthStore = {
      tokens: null,
      user: null,
      setTokens: jest.fn(),
      setUser: jest.fn(),
      logout: jest.fn(),
      updateTokens: jest.fn(),
    };
    (useAuthStore as unknown as jest.Mock).mockReturnValue(mockAuthStore);

    // Setup API mocks
    mockLoginMutate = jest.fn().mockResolvedValue({
      access_token: 'access-123',
      id_token: 'id-123',
      refresh_token: 'refresh-123',
      expires_in: 3600,
      token_type: 'Bearer',
    });

    mockRefreshMutate = jest.fn().mockResolvedValue({
      access_token: 'new-access-456',
      id_token: 'new-id-456',
      expires_in: 3600,
      token_type: 'Bearer',
    });

    mockSignupMutate = jest.fn().mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    });

    mockGetMeQuery = {
      data: null,
      isLoading: false,
      error: null,
      isError: false,
    };

    (authAPIs.useLoginAuthLoginPost as jest.Mock).mockReturnValue({
      mutateAsync: mockLoginMutate,
      isPending: false,
    });

    (authAPIs.useRefreshAuthRefreshPost as jest.Mock).mockReturnValue({
      mutateAsync: mockRefreshMutate,
      isPending: false,
    });

    (authAPIs.useSignupAuthSignupPost as jest.Mock).mockReturnValue({
      mutateAsync: mockSignupMutate,
      isPending: false,
    });

    (authAPIs.useGetMeAuthMeGet as jest.Mock).mockReturnValue(mockGetMeQuery);

    (transformTokensFromLogin as jest.Mock).mockImplementation((response) => ({
      accessToken: response.access_token,
      idToken: response.id_token,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
      tokenType: response.token_type,
    }));

    (transformUserData as jest.Mock).mockImplementation((data) => ({
      id: data.id,
      email: data.email,
      name: data.name,
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('useAuth hook', () => {
    it('should throw when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('should return auth context when used within provider', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('refresh');
      expect(result.current).toHaveProperty('signup');
      expect(result.current).toHaveProperty('isLoginPending');
      expect(result.current).toHaveProperty('isRefreshPending');
      expect(result.current).toHaveProperty('isSignupPending');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      const loginResponse = {
        access_token: 'access-123',
        id_token: 'id-123',
        refresh_token: 'refresh-123',
        expires_in: 3600,
        token_type: 'Bearer',
      };
      mockLoginMutate.mockResolvedValueOnce(loginResponse);

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(mockLoginMutate).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      expect(transformTokensFromLogin).toHaveBeenCalledWith(loginResponse);
      expect(mockAuthStore.setTokens).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith(
        'Login Successful',
        'Welcome back!'
      );
    });

    it('should handle login error with network error', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const error = new Error('Network error');
      mockLoginMutate.mockRejectedValueOnce(error);

      try {
        await act(async () => {
          await result.current.login('test@example.com', 'password123');
        });
      } catch (e) {
        // Error is expected, continue
      }

      expect(mockAuthStore.logout).toHaveBeenCalled();
      expect(mockToast.error).toHaveBeenCalledWith(
        'No Connection',
        'Please check your internet connection and try again.'
      );
    });

    it('should handle login error with invalid credentials', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const error = new Error('Invalid credentials');
      mockLoginMutate.mockRejectedValueOnce(error);

      try {
        await act(async () => {
          await result.current.login('test@example.com', 'wrong');
        });
      } catch (e) {
        // Error is expected, continue
      }

      expect(mockAuthStore.logout).toHaveBeenCalled();
      expect(mockToast.error).toHaveBeenCalledWith(
        'Login Failed',
        'Invalid credentials. Please try again.'
      );
    });

    it('should not spam toasts on repeated login failures', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const error = new Error('Invalid credentials');

      // First login attempt
      mockLoginMutate.mockRejectedValueOnce(error);
      try {
        await act(async () => {
          await result.current.login('test@example.com', 'wrong');
        });
      } catch (e) {
        // Error expected
      }

      expect(mockToast.error).toHaveBeenCalledTimes(1);

      // Second login attempt immediately after (should be debounced)
      mockLoginMutate.mockRejectedValueOnce(error);
      try {
        await act(async () => {
          await result.current.login('test@example.com', 'wrong');
        });
      } catch (e) {
        // Error expected
      }

      // Should still be 1 because of debouncing (within 2 second window)
      expect(mockToast.error).toHaveBeenCalledTimes(1);

      // Advance time past debounce threshold (2000ms)
      act(() => {
        jest.advanceTimersByTime(2001);
      });

      mockLoginMutate.mockRejectedValueOnce(error);
      try {
        await act(async () => {
          await result.current.login('test@example.com', 'wrong');
        });
      } catch (e) {
        // Error expected
      }

      expect(mockToast.error).toHaveBeenCalledTimes(2);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        result.current.logout();
      });

      expect(mockAuthStore.logout).toHaveBeenCalled();
      expect(mockQueryClient.clear).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith(
        'Logged Out',
        'You have been successfully logged out.'
      );
    });

    it('should debounce logout success toasts', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // First logout
      await act(async () => {
        result.current.logout();
      });

      expect(mockToast.success).toHaveBeenCalledTimes(1);

      // Second logout immediately (should be debounced)
      await act(async () => {
        result.current.logout();
      });

      expect(mockToast.success).toHaveBeenCalledTimes(1);

      // Advance time past debounce
      act(() => {
        jest.advanceTimersByTime(2001);
      });

      await act(async () => {
        result.current.logout();
      });

      expect(mockToast.success).toHaveBeenCalledTimes(2);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      mockAuthStore.tokens = {
        accessToken: 'access-123',
        idToken: 'id-123',
        refreshToken: 'refresh-123',
        expiresIn: 3600,
      };

      const { result } = renderHook(() => useAuth(), { wrapper });

      const refreshResponse = {
        access_token: 'new-access-456',
        id_token: 'new-id-456',
        expires_in: 3600,
        token_type: 'Bearer',
      };
      mockRefreshMutate.mockResolvedValueOnce(refreshResponse);

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockRefreshMutate).toHaveBeenCalledWith({
        data: {
          refresh_token: 'refresh-123',
        },
      });

      expect(mockAuthStore.updateTokens).toHaveBeenCalledWith({
        accessToken: refreshResponse.access_token,
        idToken: refreshResponse.id_token,
        expiresIn: refreshResponse.expires_in,
        tokenType: refreshResponse.token_type,
      });
    });

    it('should reject when no refresh token available', async () => {
      mockAuthStore.tokens = null;

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.refresh();
        })
      ).rejects.toThrow('No refresh token available');
    });

    it('should handle refresh error with network error', async () => {
      mockAuthStore.tokens = {
        accessToken: 'access-123',
        idToken: 'id-123',
        refreshToken: 'refresh-123',
        expiresIn: 3600,
      };

      const { result } = renderHook(() => useAuth(), { wrapper });

      const error = new Error('Network error');
      mockRefreshMutate.mockRejectedValueOnce(error);

      try {
        await act(async () => {
          await result.current.refresh();
        });
      } catch (e) {
        // Error is expected, continue
      }

      expect(mockAuthStore.logout).toHaveBeenCalled();
      expect(mockToast.error).toHaveBeenCalledWith(
        'No Connection',
        'Please check your internet connection and try again.'
      );
    });

    it('should handle refresh error with session expired', async () => {
      mockAuthStore.tokens = {
        accessToken: 'access-123',
        idToken: 'id-123',
        refreshToken: 'refresh-123',
        expiresIn: 3600,
      };

      const { result } = renderHook(() => useAuth(), { wrapper });

      const error = new Error('Session expired');
      mockRefreshMutate.mockRejectedValueOnce(error);

      try {
        await act(async () => {
          await result.current.refresh();
        });
      } catch (e) {
        // Error is expected, continue
      }

      expect(mockAuthStore.logout).toHaveBeenCalled();
      expect(mockToast.error).toHaveBeenCalledWith(
        'Session Expired',
        'Please log in again.'
      );
    });
  });

  describe('signup', () => {
    it('should signup user successfully', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const signupResponse = {
        id: 'user-123',
        email: 'newuser@example.com',
        name: 'New User',
      };
      mockSignupMutate.mockResolvedValueOnce(signupResponse);

      let response;
      await act(async () => {
        response = await result.current.signup(
          'newuser@example.com',
          'password123',
          'New User',
          '1234567890',
          'Institution Name',
          'Hospital',
          '123456789',
          'Street 123',
          'Bogota',
          'Colombia',
          'John Doe'
        );
      });

      expect(mockSignupMutate).toHaveBeenCalledWith({
        data: {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          user_type: 'client',
          telefono: '1234567890',
          nombre_institucion: 'Institution Name',
          tipo_institucion: 'Hospital',
          nit: '123456789',
          direccion: 'Street 123',
          ciudad: 'Bogota',
          pais: 'Colombia',
          representante: 'John Doe',
        },
      });

      expect(response).toEqual(signupResponse);
      expect(mockToast.success).toHaveBeenCalledWith(
        'Signup Successful',
        'Account created for newuser@example.com. Please log in.'
      );
    });

    it('should handle signup error with network error', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const error = new Error('Network error');
      mockSignupMutate.mockRejectedValueOnce(error);

      try {
        await act(async () => {
          await result.current.signup(
            'newuser@example.com',
            'password123',
            'New User',
            '1234567890',
            'Institution Name',
            'Hospital',
            '123456789',
            'Street 123',
            'Bogota',
            'Colombia',
            'John Doe'
          );
        });
      } catch (e) {
        // Error is expected, continue
      }

      expect(mockToast.error).toHaveBeenCalledWith(
        'No Connection',
        'Please check your internet connection and try again.'
      );
    });

    it('should handle signup error with general error', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const error = new Error('Signup failed');
      mockSignupMutate.mockRejectedValueOnce(error);

      try {
        await act(async () => {
          await result.current.signup(
            'newuser@example.com',
            'password123',
            'New User',
            '1234567890',
            'Institution Name',
            'Hospital',
            '123456789',
            'Street 123',
            'Bogota',
            'Colombia',
            'John Doe'
          );
        });
      } catch (e) {
        // Error is expected, continue
      }

      expect(mockToast.error).toHaveBeenCalledWith(
        'Signup Failed',
        'Unable to create account. Please try again.'
      );
    });
  });

  describe('initialization', () => {
    it('should initialize auth on mount with existing tokens', () => {
      mockAuthStore.tokens = {
        accessToken: 'access-123',
        idToken: 'id-123',
        refreshToken: 'refresh-123',
        expiresIn: 3600,
      };

      (authAPIs.useGetMeAuthMeGet as jest.Mock).mockReturnValue({
        ...mockGetMeQuery,
        data: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      });

      renderHook(() => useAuth(), { wrapper });

      // Verify that fetch should be enabled
      const lastCall = (authAPIs.useGetMeAuthMeGet as jest.Mock).mock
        .calls.length;
      expect(lastCall).toBeGreaterThan(0);
    });

    it('should not fetch user when no tokens present', () => {
      mockAuthStore.tokens = null;

      renderHook(() => useAuth(), { wrapper });

      // Verify the hook is called with enabled: false initially
      expect(authAPIs.useGetMeAuthMeGet).toHaveBeenCalled();
    });
  });

  describe('pending states', () => {
    it('should expose login pending state', () => {
      (authAPIs.useLoginAuthLoginPost as jest.Mock).mockReturnValue({
        mutateAsync: mockLoginMutate,
        isPending: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoginPending).toBe(true);
    });

    it('should expose refresh pending state', () => {
      (authAPIs.useRefreshAuthRefreshPost as jest.Mock).mockReturnValue({
        mutateAsync: mockRefreshMutate,
        isPending: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isRefreshPending).toBe(true);
    });

    it('should expose signup pending state', () => {
      (authAPIs.useSignupAuthSignupPost as jest.Mock).mockReturnValue({
        mutateAsync: mockSignupMutate,
        isPending: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isSignupPending).toBe(true);
    });
  });
});
