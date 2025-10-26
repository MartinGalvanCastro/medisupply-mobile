import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from './AuthProvider';
import * as authApi from '@/api/generated/authentication/authentication';
import { useAuthStore } from '@/store';
import { useToast } from '@/providers';

// Mock dependencies
jest.mock('@/api/generated/authentication/authentication');
jest.mock('@/store');
jest.mock('@/providers', () => ({
  useToast: jest.fn(),
}));

describe('AuthProvider', () => {
  const mockLoginMutateAsync = jest.fn();
  const mockRefreshMutateAsync = jest.fn();
  const mockSignupMutateAsync = jest.fn();
  const mockFetchMe = jest.fn();
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
      refetch: mockFetchMe,
    });
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
      mockFetchMe.mockResolvedValue({ data: mockUserData });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(mockLoginMutateAsync).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'password123',
          client_type: 'mobile',
        },
      });

      expect(mockSetTokens).toHaveBeenCalledWith({
        accessToken: 'access123',
        idToken: 'id123',
        refreshToken: 'refresh123',
        expiresIn: 3600,
        tokenType: 'Bearer',
      });

      expect(mockFetchMe).toHaveBeenCalled();

      expect(mockSetUser).toHaveBeenCalledWith({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        groups: ['group1'],
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

    it('should handle login with undefined user data fields', async () => {
      const mockLoginResponse = {
        access_token: 'access123',
        id_token: 'id123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      const mockUserData = {
        id: undefined,
        email: undefined,
        name: undefined,
        role: 'admin',
        groups: ['group1'],
      };

      mockLoginMutateAsync.mockResolvedValue(mockLoginResponse);
      mockFetchMe.mockResolvedValue({ data: mockUserData });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(mockSetUser).toHaveBeenCalledWith({
        id: '',
        email: '',
        name: '',
        role: 'admin',
        groups: ['group1'],
      });
    });

    it('should handle login with non-array groups', async () => {
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
        role: null,
        groups: 'not-an-array',
      };

      mockLoginMutateAsync.mockResolvedValue(mockLoginResponse);
      mockFetchMe.mockResolvedValue({ data: mockUserData });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(mockSetUser).toHaveBeenCalledWith({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: undefined,
        groups: undefined,
      });
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
      mockFetchMe.mockResolvedValue({ data: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

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
  });
});
