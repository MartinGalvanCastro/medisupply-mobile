import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useLoginAuthLoginPost,
  useRefreshAuthRefreshPost,
  useSignupAuthSignupPost,
  useGetMeAuthMeGet,
} from '@/api/generated/authentication/authentication';
import { useToast } from '@/providers/ToastProvider';
import { useAuthStore } from '@/store';
import * as authUtils from '@/utils/auth';
import * as errorUtils from '@/utils/error';
import { AuthProvider, useAuth } from './AuthProvider';

// Mock dependencies
jest.mock('@/api/generated/authentication/authentication');
jest.mock('@/providers/ToastProvider');
jest.mock('@/store');
jest.mock('@/utils/auth');
jest.mock('@/utils/error');

const mockUseLoginAuthLoginPost = useLoginAuthLoginPost as jest.MockedFunction<
  typeof useLoginAuthLoginPost
>;
const mockUseRefreshAuthRefreshPost = useRefreshAuthRefreshPost as jest.MockedFunction<
  typeof useRefreshAuthRefreshPost
>;
const mockUseSignupAuthSignupPost = useSignupAuthSignupPost as jest.MockedFunction<
  typeof useSignupAuthSignupPost
>;
const mockUseGetMeAuthMeGet = useGetMeAuthMeGet as jest.MockedFunction<
  typeof useGetMeAuthMeGet
>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockTransformTokensFromLogin = authUtils.transformTokensFromLogin as jest.MockedFunction<
  typeof authUtils.transformTokensFromLogin
>;
const mockTransformUserData = authUtils.transformUserData as jest.MockedFunction<
  typeof authUtils.transformUserData
>;
const mockIsNetworkError = errorUtils.isNetworkError as jest.MockedFunction<
  typeof errorUtils.isNetworkError
>;

describe('AuthProvider', () => {
  let mockQueryClient: QueryClient;
  let mockToast: any;
  let mockAuthStore: any;
  let mockLoginMutate: jest.Mock;
  let mockRefreshMutate: jest.Mock;
  let mockSignupMutate: jest.Mock;
  let mockRefetchMe: jest.Mock;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;

  beforeEach(() => {
    // Create real QueryClient for testing
    mockQueryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    // Setup mock functions
    mockLoginMutate = jest.fn();
    mockRefreshMutate = jest.fn();
    mockSignupMutate = jest.fn();
    mockRefetchMe = jest.fn();

    // Setup mocks
    mockUseLoginAuthLoginPost.mockReturnValue({
      mutateAsync: mockLoginMutate,
      isPending: false,
      isError: false,
      error: null,
    } as any);

    mockUseRefreshAuthRefreshPost.mockReturnValue({
      mutateAsync: mockRefreshMutate,
      isPending: false,
      isError: false,
      error: null,
    } as any);

    mockUseSignupAuthSignupPost.mockReturnValue({
      mutateAsync: mockSignupMutate,
      isPending: false,
      isError: false,
      error: null,
    } as any);

    mockRefetchMe.mockResolvedValue(undefined);

    mockUseGetMeAuthMeGet.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      isError: false,
      refetch: mockRefetchMe,
      isSuccess: false,
    } as any);

    // Setup toast mock
    mockToast = {
      success: jest.fn(),
      error: jest.fn(),
    };
    mockUseToast.mockReturnValue(mockToast);

    // Setup auth store mock
    mockAuthStore = {
      tokens: null,
      user: null,
      setTokens: jest.fn(),
      setUser: jest.fn(),
      logout: jest.fn(),
      updateTokens: jest.fn(),
    };
    mockUseAuthStore.mockReturnValue(mockAuthStore);

    // Setup utility mocks
    mockTransformTokensFromLogin.mockImplementation(
      (response: any) =>
        ({
          accessToken: response.access_token,
          idToken: response.id_token,
          refreshToken: response.refresh_token,
          expiresIn: response.expires_in,
          tokenType: response.token_type,
        } as any)
    );

    mockTransformUserData.mockImplementation((data: any) => ({
      id: data.user_id,
      email: data.email,
      name: data.name,
      role: data.user_type,
      groups: data.groups,
    }));

    mockIsNetworkError.mockReturnValue(false);

    // Create wrapper component
    wrapper = ({ children }) => (
      <QueryClientProvider client={mockQueryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider Initialization', () => {
    it('should fetch user data on mount when tokens exist', async () => {
      mockAuthStore.tokens = {
        accessToken: 'access123',
        idToken: 'id123',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockUseGetMeAuthMeGet).toHaveBeenCalledWith(
          expect.objectContaining({
            query: expect.objectContaining({
              enabled: true,
            }),
          })
        );
      });
    });

    it('should not fetch user data on mount when no tokens exist', () => {
      mockAuthStore.tokens = null;

      renderHook(() => useAuth(), { wrapper });

      // Query should be disabled initially
      expect(mockUseGetMeAuthMeGet).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            enabled: false,
          }),
        })
      );
    });
  });

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleErrorSpy.mockRestore();
    });

    it('should provide auth context value correctly', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.refresh).toBe('function');
      expect(typeof result.current.signup).toBe('function');
      expect(typeof result.current.refetchUser).toBe('function');
    });
  });

  describe('Login', () => {
    it('should successfully login and set tokens', async () => {
      mockLoginMutate.mockResolvedValue({
        access_token: 'new-access',
        id_token: 'new-id',
        refresh_token: 'new-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(mockLoginMutate).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'password',
        },
      });

      await waitFor(() => {
        expect(mockAuthStore.setTokens).toHaveBeenCalled();
      });
    });

    it('should show success toast on successful login', async () => {
      mockLoginMutate.mockResolvedValue({
        access_token: 'new-access',
        id_token: 'new-id',
        refresh_token: 'new-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Login Successful',
          'Welcome back!'
        );
      });
    });

    it('should handle login failure with network error', async () => {
      mockIsNetworkError.mockReturnValue(true);
      const networkError = new Error('Network Error');
      mockLoginMutate.mockRejectedValue(networkError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'No Connection',
          'Please check your internet connection and try again.'
        );
      });
    });

    it('should handle login failure with invalid credentials', async () => {
      mockIsNetworkError.mockReturnValue(false);
      const authError = new Error('Invalid credentials');
      mockLoginMutate.mockRejectedValue(authError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'wrong');
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Login Failed',
          'Invalid credentials. Please try again.'
        );
      });
    });

    it('should clear tokens on login failure', async () => {
      mockLoginMutate.mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      await waitFor(() => {
        expect(mockAuthStore.setTokens).toHaveBeenCalledWith(null);
        expect(mockAuthStore.setUser).toHaveBeenCalledWith(null);
      });
    });
  });

  describe('Logout', () => {
    it('should clear auth store on logout', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(mockAuthStore.logout).toHaveBeenCalled();
    });

    it('should clear query cache on logout', () => {
      const clearSpy = jest.spyOn(mockQueryClient, 'clear');

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(clearSpy).toHaveBeenCalled();
    });

    it('should show success toast on logout', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        'Logged Out',
        'You have been successfully logged out.'
      );
    });
  });

  describe('Signup', () => {
    it('should successfully signup and show toast', async () => {
      mockSignupMutate.mockResolvedValue({
        user_id: 'new-user-id',
        email: 'signup@example.com',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signup(
          'signup@example.com',
          'password123',
          'John Doe',
          '3005551234',
          'Test Institution',
          'hospital',
          '123456789',
          '123 Main St',
          'Bogota',
          'Colombia',
          'John Representative'
        );
      });

      expect(mockSignupMutate).toHaveBeenCalledWith({
        data: {
          email: 'signup@example.com',
          password: 'password123',
          name: 'John Doe',
          user_type: 'client',
          telefono: '3005551234',
          nombre_institucion: 'Test Institution',
          tipo_institucion: 'hospital',
          nit: '123456789',
          direccion: '123 Main St',
          ciudad: 'Bogota',
          pais: 'Colombia',
          representante: 'John Representative',
        },
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Signup Successful',
          'Account created for signup@example.com. Please log in.'
        );
      });
    });

    it('should handle signup failure with network error', async () => {
      mockIsNetworkError.mockReturnValue(true);
      const networkError = new Error('Network Error');
      mockSignupMutate.mockRejectedValue(networkError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.signup(
            'signup@example.com',
            'password123',
            'John Doe',
            '3005551234',
            'Test Institution',
            'hospital',
            '123456789',
            '123 Main St',
            'Bogota',
            'Colombia',
            'John Representative'
          );
        } catch (err) {
          // Error is expected
        }
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'No Connection',
          'Please check your internet connection and try again.'
        );
      });
    });

    it('should handle signup failure with server error', async () => {
      mockIsNetworkError.mockReturnValue(false);
      const serverError = new Error('Server error');
      mockSignupMutate.mockRejectedValue(serverError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.signup(
            'signup@example.com',
            'password123',
            'John Doe',
            '3005551234',
            'Test Institution',
            'hospital',
            '123456789',
            '123 Main St',
            'Bogota',
            'Colombia',
            'John Representative'
          );
        } catch (err) {
          // Error is expected
        }
      });

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Signup Failed',
          'Unable to create account. Please try again.'
        );
      });
    });

    it('should rethrow error after handling signup failure', async () => {
      const signupError = new Error('Signup error');
      mockSignupMutate.mockRejectedValue(signupError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      let caughtError: Error | null = null;

      await act(async () => {
        try {
          await result.current.signup(
            'signup@example.com',
            'password123',
            'John Doe',
            '3005551234',
            'Test Institution',
            'hospital',
            '123456789',
            '123 Main St',
            'Bogota',
            'Colombia',
            'John Representative'
          );
        } catch (err) {
          caughtError = err as any;
        }
      });

      expect((caughtError as any)?.message).toBe('Signup error');
    });
  });

  describe('Refresh Token', () => {
    it('should successfully refresh tokens', async () => {
      mockAuthStore.tokens = {
        accessToken: 'old-access',
        idToken: 'old-id',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };

      mockRefreshMutate.mockResolvedValue({
        access_token: 'new-access',
        id_token: 'new-id',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockRefreshMutate).toHaveBeenCalledWith({
        data: {
          refresh_token: 'refresh123',
        },
      });

      await waitFor(() => {
        expect(mockAuthStore.updateTokens).toHaveBeenCalledWith({
          accessToken: 'new-access',
          idToken: 'new-id',
          expiresIn: 3600,
          tokenType: 'Bearer',
        });
      });
    });

    it('should reject refresh when no refresh token available', async () => {
      mockAuthStore.tokens = {
        accessToken: 'access',
        idToken: 'id',
        refreshToken: null,
        expiresIn: 3600,
      };

      const { result } = renderHook(() => useAuth(), { wrapper });

      let error: Error | null = null;

      await act(async () => {
        try {
          await result.current.refresh();
        } catch (err) {
          error = err as any;
        }
      });

      expect((error as any)?.message).toBe('No refresh token available');
    });

    it('should logout on 401 error during refresh', async () => {
      mockAuthStore.tokens = {
        accessToken: 'old-access',
        idToken: 'old-id',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };

      const error401 = new Error('Unauthorized');
      (error401 as any).response = { status: 401 };
      mockRefreshMutate.mockRejectedValue(error401);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(mockAuthStore.logout).toHaveBeenCalled();
        expect(mockToast.error).toHaveBeenCalledWith(
          'Session Expired',
          'Please log in again.'
        );
      });
    });

    it('should logout on 403 error during refresh', async () => {
      mockAuthStore.tokens = {
        accessToken: 'old-access',
        idToken: 'old-id',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };

      const error403 = new Error('Forbidden');
      (error403 as any).response = { status: 403 };
      mockRefreshMutate.mockRejectedValue(error403);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(mockAuthStore.logout).toHaveBeenCalled();
      });
    });

    it('should keep user logged in on network error during refresh', async () => {
      mockAuthStore.tokens = {
        accessToken: 'old-access',
        idToken: 'old-id',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };

      mockIsNetworkError.mockReturnValue(true);
      const networkError = new Error('Network Error');
      mockRefreshMutate.mockRejectedValue(networkError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(mockAuthStore.logout).not.toHaveBeenCalled();
        expect(mockToast.error).toHaveBeenCalledWith(
          'No Connection',
          'Please check your internet connection and try again.'
        );
      });
    });

    it('should keep user logged in on server error during refresh', async () => {
      mockAuthStore.tokens = {
        accessToken: 'old-access',
        idToken: 'old-id',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };

      mockIsNetworkError.mockReturnValue(false);
      const serverError = new Error('Server Error');
      (serverError as any).response = { status: 500 };
      mockRefreshMutate.mockRejectedValue(serverError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(mockAuthStore.logout).not.toHaveBeenCalled();
        expect(mockToast.error).toHaveBeenCalledWith(
          'Refresh Failed',
          'Server error. Please try again.'
        );
      });
    });
  });

  describe('User Data Fetching', () => {
    it('should store user data when /me fetch succeeds', async () => {
      mockAuthStore.tokens = {
        accessToken: 'access123',
        idToken: 'id123',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };

      const meData = {
        user_id: '123',
        email: 'test@example.com',
        name: 'Test User',
        user_type: 'seller',
        groups: ['seller_users'],
      };

      const transformedUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'seller',
        groups: ['seller_users'],
      };

      mockTransformUserData.mockReturnValue(transformedUser);

      mockUseGetMeAuthMeGet.mockReturnValue({
        data: meData,
        isLoading: false,
        error: null,
        isError: false,
        refetch: mockRefetchMe,
        isSuccess: true,
      } as any);

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockTransformUserData).toHaveBeenCalledWith(meData);
        expect(mockAuthStore.setUser).toHaveBeenCalledWith(transformedUser);
      });
    });

    it('should logout on 401 error when fetching user data', async () => {
      mockAuthStore.tokens = {
        accessToken: 'access123',
        idToken: 'id123',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };

      const error401 = new Error('Unauthorized');
      (error401 as any).response = { status: 401 };

      mockUseGetMeAuthMeGet.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: error401,
        isError: true,
        refetch: mockRefetchMe,
        isSuccess: false,
      } as any);

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockAuthStore.logout).toHaveBeenCalled();
      });
    });

    it('should not logout on non-401 error when fetching user data', async () => {
      mockAuthStore.tokens = {
        accessToken: 'access123',
        idToken: 'id123',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };

      const error500 = new Error('Server Error');
      (error500 as any).response = { status: 500 };

      mockUseGetMeAuthMeGet.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: error500,
        isError: true,
        refetch: mockRefetchMe,
        isSuccess: false,
      } as any);

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockAuthStore.logout).not.toHaveBeenCalled();
      });
    });
  });

  describe('refetchUser', () => {
    it('should manually trigger user refetch', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refetchUser();
      });

      expect(mockRefetchMe).toHaveBeenCalled();
    });
  });

  describe('Toast Debouncing (showToastIfNotRecent)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should show toast on first call', async () => {
      mockLoginMutate.mockResolvedValue({
        access_token: 'access',
        id_token: 'id',
        refresh_token: 'refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const loginPromise = result.current.login('test@example.com', 'password');
        jest.runAllTimers();
        await loginPromise;
      });

      expect(mockToast.success).toHaveBeenCalled();
    });

    it('should suppress duplicate toasts within debounce window', async () => {
      mockLoginMutate.mockResolvedValue({
        access_token: 'access',
        id_token: 'id',
        refresh_token: 'refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        // First login
        const login1 = result.current.login('test@example.com', 'password');
        jest.runAllTimers();
        await login1;

        mockToast.success.mockClear();

        // Second login immediately after (within debounce window)
        const login2 = result.current.login('test@example.com', 'password');
        jest.runAllTimers();
        await login2;
      });

      // Should not be called again due to debouncing
      expect(mockToast.success).not.toHaveBeenCalled();
    });

    it('should show toast again after debounce window expires', async () => {
      mockLoginMutate.mockResolvedValue({
        access_token: 'access',
        id_token: 'id',
        refresh_token: 'refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        // First login
        const login1 = result.current.login('test@example.com', 'password');
        jest.runAllTimers();
        await login1;
      });

      expect(mockToast.success).toHaveBeenCalledTimes(1);

      mockToast.success.mockClear();

      // Advance time beyond debounce window (default 2000ms)
      act(() => {
        jest.advanceTimersByTime(2100);
      });

      await act(async () => {
        // Second login after debounce expires
        const login2 = result.current.login('test@example.com', 'password');
        jest.runAllTimers();
        await login2;
      });

      expect(mockToast.success).toHaveBeenCalledTimes(1);
    });
  });

  describe('Pending States', () => {
    it('should expose isLoginPending state', () => {
      mockUseLoginAuthLoginPost.mockReturnValue({
        mutateAsync: mockLoginMutate,
        isPending: true,
        isError: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoginPending).toBe(true);
    });

    it('should expose isRefreshPending state', () => {
      mockUseRefreshAuthRefreshPost.mockReturnValue({
        mutateAsync: mockRefreshMutate,
        isPending: true,
        isError: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isRefreshPending).toBe(true);
    });

    it('should expose isSignupPending state', () => {
      mockUseSignupAuthSignupPost.mockReturnValue({
        mutateAsync: mockSignupMutate,
        isPending: true,
        isError: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isSignupPending).toBe(true);
    });

    it('should expose isLoadingUser state', () => {
      mockUseGetMeAuthMeGet.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        refetch: mockRefetchMe,
        isSuccess: false,
      } as any);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoadingUser).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle login with empty tokens in store initially', async () => {
      mockAuthStore.tokens = null;

      mockLoginMutate.mockResolvedValue({
        access_token: 'access',
        id_token: 'id',
        refresh_token: 'refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      await waitFor(() => {
        expect(mockAuthStore.setTokens).toHaveBeenCalled();
      });
    });

    it('should handle refresh error without status code', async () => {
      mockAuthStore.tokens = {
        accessToken: 'old-access',
        idToken: 'old-id',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };

      mockIsNetworkError.mockReturnValue(false);
      const unknownError = new Error('Unknown error');
      mockRefreshMutate.mockRejectedValue(unknownError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(mockAuthStore.logout).not.toHaveBeenCalled();
        expect(mockToast.error).toHaveBeenCalled();
      });
    });

    it('should handle refresh error without response object', async () => {
      mockAuthStore.tokens = {
        accessToken: 'old-access',
        idToken: 'old-id',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };

      mockIsNetworkError.mockReturnValue(false);
      const plainError = new Error('Error');
      mockRefreshMutate.mockRejectedValue(plainError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(mockAuthStore.logout).not.toHaveBeenCalled();
      });
    });

    it('should handle /me error without response object', async () => {
      mockAuthStore.tokens = {
        accessToken: 'access123',
        idToken: 'id123',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };

      const plainError = new Error('Network error');

      mockUseGetMeAuthMeGet.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: plainError,
        isError: true,
        refetch: mockRefetchMe,
        isSuccess: false,
      } as any);

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockAuthStore.logout).not.toHaveBeenCalled();
      });
    });
  });
});
