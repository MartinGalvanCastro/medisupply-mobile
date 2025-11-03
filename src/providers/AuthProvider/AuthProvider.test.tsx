import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from './AuthProvider';
import * as authApi from '@/api/generated/authentication/authentication';
import { useAuthStore } from '@/store';
import { useToast } from '@/providers';
import * as authUtils from '@/utils/auth';
import * as errorUtils from '@/utils/error';
import { AxiosError } from 'axios';

// Mock dependencies
jest.mock('@/api/generated/authentication/authentication');
jest.mock('@/store');
jest.mock('@/providers', () => ({
  useToast: jest.fn(),
}));
jest.mock('@/utils/auth');
jest.mock('@/utils/error', () => ({
  isNetworkError: jest.fn(),
  getErrorMessage: jest.fn(),
}));

describe('AuthProvider', () => {
  const mockLoginMutateAsync = jest.fn();
  const mockRefreshMutateAsync = jest.fn();
  const mockSignupMutateAsync = jest.fn();
  const mockSetTokens = jest.fn();
  const mockSetUser = jest.fn();
  const mockUpdateTokens = jest.fn();
  const mockLogout = jest.fn();
  const mockToastSuccess = jest.fn();
  const mockToastError = jest.fn();

  const mockAuthStore: any = {
    tokens: null,
    setTokens: mockSetTokens,
    setUser: mockSetUser,
    updateTokens: mockUpdateTokens,
    logout: mockLogout,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();

    (useToast as jest.Mock).mockReturnValue({
      success: mockToastSuccess,
      error: mockToastError,
    });

    (useAuthStore as unknown as jest.Mock).mockReturnValue(mockAuthStore);

    // Default: errors are not network errors
    (errorUtils.isNetworkError as jest.Mock).mockReturnValue(false);

    (authApi.useLoginAuthLoginPost as jest.Mock).mockReturnValue({
      mutateAsync: mockLoginMutateAsync,
      isPending: false,
    });

    (authApi.useRefreshAuthRefreshPost as jest.Mock).mockReturnValue({
      mutateAsync: mockRefreshMutateAsync,
      isPending: false,
    });

    (authApi.useSignupAuthSignupPost as jest.Mock).mockReturnValue({
      mutateAsync: mockSignupMutateAsync,
      isPending: false,
    });

    (authApi.useGetMeAuthMeGet as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      isError: false,
      refetch: jest.fn(),
    });

    // Mock utility functions
    (authUtils.transformTokensFromLogin as jest.Mock).mockImplementation((response) => ({
      accessToken: response.access_token,
      idToken: response.id_token,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
      tokenType: response.token_type,
    }));

    (authUtils.transformUserData as jest.Mock).mockImplementation((data) => data);
  });

  describe('useAuth', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => renderHook(() => useAuth())).toThrow(
        'useAuth must be used within an AuthProvider'
      );

      console.error = originalError;
    });
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const mockLoginResponse = {
        access_token: 'access123',
        id_token: 'id123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      const mockUserData = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        groups: ['group1'],
      };

      mockLoginMutateAsync.mockResolvedValue(mockLoginResponse);

      // First render without user data
      const { result, rerender } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(mockLoginMutateAsync).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      expect(mockSetTokens).toHaveBeenCalledWith({
        accessToken: 'access123',
        idToken: 'id123',
        refreshToken: 'refresh123',
        expiresIn: 3600,
        tokenType: 'Bearer',
      });

      // Now mock the hook to return user data (simulating React Query fetch)
      (authApi.useGetMeAuthMeGet as jest.Mock).mockReturnValue({
        data: mockUserData,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
      });

      // Re-render to trigger useEffect
      await act(async () => {
        rerender();
      });

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(mockUserData);
      });

      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Login Successful',
        'Welcome back!'
      );
    });

    it('should handle login failure', async () => {
      const mockError = new Error('Invalid credentials');
      mockLoginMutateAsync.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        result.current.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');

      expect(mockLogout).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith(
        'Login Failed',
        'Invalid credentials. Please try again.'
      );
    });


    it('should handle login when user data fetch returns no data', async () => {
      const mockLoginResponse = {
        access_token: 'access123',
        id_token: 'id123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      mockLoginMutateAsync.mockResolvedValue(mockLoginResponse);

      const { result, rerender } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(mockSetTokens).toHaveBeenCalledWith({
        accessToken: 'access123',
        idToken: 'id123',
        refreshToken: 'refresh123',
        expiresIn: 3600,
        tokenType: 'Bearer',
      });

      // Mock the hook to return no data (null)
      (authApi.useGetMeAuthMeGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
        refetch: jest.fn(),
      });

      // Re-render to trigger useEffect
      await act(async () => {
        rerender();
      });

      expect(mockSetUser).not.toHaveBeenCalled();

      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Login Successful',
        'Welcome back!'
      );
    });

    it('should debounce toast notifications', async () => {
      const mockError = new Error('Invalid credentials');
      mockLoginMutateAsync.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // First login attempt should show toast
      await expect(
        result.current.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');

      expect(mockToastError).toHaveBeenCalledTimes(1);
      expect(mockToastError).toHaveBeenCalledWith(
        'Login Failed',
        'Invalid credentials. Please try again.'
      );

      // Second login attempt immediately after should NOT show toast (debounced)
      await expect(
        result.current.login('test@example.com', 'wrongpassword2')
      ).rejects.toThrow('Invalid credentials');

      // Toast should still only have been called once (second call debounced)
      expect(mockToastError).toHaveBeenCalledTimes(1);
    });

    it('should handle network error during login', async () => {
      const networkError = new AxiosError('Network Error');
      networkError.response = undefined;
      mockLoginMutateAsync.mockRejectedValue(networkError);

      // Mock isNetworkError to return true for this error
      (errorUtils.isNetworkError as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        result.current.login('test@example.com', 'password123')
      ).rejects.toThrow('Network Error');

      expect(mockLogout).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith(
        'No Connection',
        'Please check your internet connection and try again.'
      );
    });

  });

  describe('logout', () => {
    it('should successfully logout user', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Logged Out',
        'You have been successfully logged out.'
      );
    });
  });

  describe('refresh', () => {
    it('should successfully refresh tokens', async () => {
      const mockRefreshResponse = {
        access_token: 'new_access123',
        id_token: 'new_id123',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      mockAuthStore.tokens = {
        accessToken: 'old_access',
        idToken: 'old_id',
        refreshToken: 'old_refresh',
        expiresIn: 3600,
      };

      mockRefreshMutateAsync.mockResolvedValue(mockRefreshResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockRefreshMutateAsync).toHaveBeenCalledWith({
        data: {
          refresh_token: 'old_refresh',
        },
      });

      expect(mockUpdateTokens).toHaveBeenCalledWith({
        accessToken: 'new_access123',
        idToken: 'new_id123',
        expiresIn: 3600,
        tokenType: 'Bearer',
      });
    });

    it('should throw error when no refresh token available', async () => {
      mockAuthStore.tokens = null;

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(result.current.refresh()).rejects.toThrow(
        'No refresh token available'
      );
    });

    it('should handle refresh failure', async () => {
      mockAuthStore.tokens = {
        accessToken: 'old_access',
        idToken: 'old_id',
        refreshToken: 'old_refresh',
        expiresIn: 3600,
      };

      const mockError = new Error('Token expired');
      mockRefreshMutateAsync.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(result.current.refresh()).rejects.toThrow('Token expired');

      expect(mockLogout).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith(
        'Session Expired',
        'Please log in again.'
      );
    });

    it('should handle network error during refresh', async () => {
      mockAuthStore.tokens = {
        accessToken: 'old_access',
        idToken: 'old_id',
        refreshToken: 'old_refresh',
        expiresIn: 3600,
      };

      const networkError = new AxiosError('Network Error');
      networkError.response = undefined;
      mockRefreshMutateAsync.mockRejectedValue(networkError);

      // Mock isNetworkError to return true for this error
      (errorUtils.isNetworkError as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(result.current.refresh()).rejects.toThrow('Network Error');

      expect(mockLogout).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith(
        'No Connection',
        'Please check your internet connection and try again.'
      );
    });
  });

  describe('signup', () => {
    it('should successfully signup user', async () => {
      const mockSignupResponse = {
        user_id: 'user123',
        email: 'newuser@example.com',
        message: 'Account created successfully',
      };

      mockSignupMutateAsync.mockResolvedValue(mockSignupResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response;
      await act(async () => {
        response = await result.current.signup(
          'newuser@example.com',
          'password123',
          'New User',
          '+1234567890',
          'Test Hospital',
          'hospital',
          '123456789',
          '123 Main St',
          'Test City',
          'Test Country',
          'John Doe'
        );
      });

      expect(mockSignupMutateAsync).toHaveBeenCalledWith({
        data: {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          user_type: 'client',
          telefono: '+1234567890',
          nombre_institucion: 'Test Hospital',
          tipo_institucion: 'hospital',
          nit: '123456789',
          direccion: '123 Main St',
          ciudad: 'Test City',
          pais: 'Test Country',
          representante: 'John Doe',
        },
      });

      expect(response).toEqual(mockSignupResponse);

      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Signup Successful',
        'Account created for newuser@example.com. Please log in.'
      );
    });

    it('should handle signup failure', async () => {
      const mockError = new Error('Email already exists');
      mockSignupMutateAsync.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        result.current.signup(
          'existing@example.com',
          'password123',
          'Existing User',
          '+1234567890',
          'Test Hospital',
          'hospital',
          '123456789',
          '123 Main St',
          'Test City',
          'Test Country',
          'John Doe'
        )
      ).rejects.toThrow('Email already exists');

      expect(mockToastError).toHaveBeenCalledWith(
        'Signup Failed',
        'Unable to create account. Please try again.'
      );
    });

    it('should handle network error during signup', async () => {
      const networkError = new AxiosError('Network Error');
      networkError.response = undefined;
      mockSignupMutateAsync.mockRejectedValue(networkError);

      // Mock isNetworkError to return true for this error
      (errorUtils.isNetworkError as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        result.current.signup(
          'test@example.com',
          'password123',
          'Test User',
          '+1234567890',
          'Test Hospital',
          'hospital',
          '123456789',
          '123 Main St',
          'Test City',
          'Test Country',
          'John Doe'
        )
      ).rejects.toThrow('Network Error');

      expect(mockToastError).toHaveBeenCalledWith(
        'No Connection',
        'Please check your internet connection and try again.'
      );
    });
  });

  describe('user fetch error handling', () => {
    it('should handle 401 error when fetching user data', async () => {
      const mock401Error = {
        response: { status: 401 },
        message: 'Unauthorized',
      };

      // Mock getMeAuthMeGet to return error
      (authApi.useGetMeAuthMeGet as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mock401Error,
        isError: true,
        refetch: jest.fn(),
      });

      // Mock tokens to trigger shouldFetchUser
      mockAuthStore.tokens = {
        accessToken: 'access-token',
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      };

      // Render the hook which will trigger useEffect
      renderHook(() => useAuth(), { wrapper });

      // Wait for useEffect to process the error
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    it('should handle non-401 error when fetching user data', async () => {
      const mockError = {
        response: { status: 500 },
        message: 'Server error',
      };

      // Mock getMeAuthMeGet to return error
      (authApi.useGetMeAuthMeGet as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        isError: true,
        refetch: jest.fn(),
      });

      // Mock tokens to trigger shouldFetchUser
      mockAuthStore.tokens = {
        accessToken: 'access-token',
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      };

      // Render the hook which will trigger useEffect
      renderHook(() => useAuth(), { wrapper });

      // Wait for useEffect to process - should NOT logout for non-401 errors
      await waitFor(() => {
        expect(mockLogout).not.toHaveBeenCalled();
      });
    });
  });
});
