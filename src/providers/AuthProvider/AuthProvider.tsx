import {
  useGetMeAuthMeGet,
  useLoginAuthLoginPost,
  useRefreshAuthRefreshPost,
  useSignupAuthSignupPost,
} from '@/api/generated/authentication/authentication';
import type { LoginResponse } from '@/api/generated/models';
import { useToast } from '@/providers';
import { useAuthStore } from '@/store';
import type { AuthTokens, User } from '@/store/useAuthStore/types';
import axios from 'axios';
import React, { createContext, useCallback, useContext, useRef } from 'react';
import type { AuthContextValue, AuthProviderProps } from './types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const toast = useToast();
  const lastToastRef = useRef<{ type: string; timestamp: number }>({ type: '', timestamp: 0 });

  const { mutateAsync: loginMutate, isPending: isLoginPending } = useLoginAuthLoginPost();
  const { mutateAsync: refreshMutate, isPending: isRefreshPending } = useRefreshAuthRefreshPost();
  const { mutateAsync: signupMutate, isPending: isSignupPending } = useSignupAuthSignupPost();
  const { refetch: fetchMe } = useGetMeAuthMeGet({
    query: { enabled: false },
  });

  const authStore = useAuthStore();

  // Helper to check if error is a network error
  const isNetworkError = useCallback((error: unknown): boolean => {
    if (axios.isAxiosError(error)) {
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
  }, []);

  // Helper to prevent toast spam
  const showToastIfNotRecent = useCallback((
    type: 'error' | 'success',
    toastKey: string,
    title: string,
    message: string,
    debounceMs: number = 2_000
  ) => {
    const now = Date.now();
    const { type: lastType, timestamp: lastTimestamp } = lastToastRef.current;

    // Only show toast if it's been more than debounceMs since last toast of same type
    if (lastType !== toastKey || now - lastTimestamp > debounceMs) {
      lastToastRef.current = { type: toastKey, timestamp: now };
      if (type === 'error') {
        toast.error(title, message);
      } else {
        toast.success(title, message);
      }
    }
  }, [toast]);

  const transformTokensFromLogin = (response: LoginResponse): AuthTokens => ({
    accessToken: response.access_token,
    idToken: response.id_token,
    refreshToken: response.refresh_token,
    expiresIn: response.expires_in,
    tokenType: response.token_type,
  });

  const transformUserData = (data: Record<string, unknown>): User => ({
    id: String(data.id ?? ''),
    email: String(data.email ?? ''),
    name: String(data.name ?? ''),
    role: data.role ? String(data.role) : undefined,
    groups: Array.isArray(data.groups) ? data.groups.map(String) : undefined,
  });

  const login = useCallback(
    (email: string, password: string) => {
      // TODO: Remove mock - temporary for development
      // Mock successful login
      const mockTokens: AuthTokens = {
        accessToken: 'mock-access-token',
        idToken: 'mock-id-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
      };

      const mockUser: User = {
        id: '1',
        email: email,
        name: 'Test User',
        role: email.includes('seller') ? 'seller' : 'client',
      };

      authStore.setTokens(mockTokens);
      authStore.setUser(mockUser);
      showToastIfNotRecent('success', 'login-success', 'Login Successful', 'Welcome back!');
      return Promise.resolve();

      // Original implementation (commented out for now)
      // return loginMutate({
      //   data: {
      //     email,
      //     password,
      //     client_type: 'mobile',
      //   },
      // })
      //   .then((response) => {
      //     const tokens = transformTokensFromLogin(response);
      //     authStore.setTokens(tokens);
      //     return fetchMe();
      //   })
      //   .then(({ data }) => {
      //     if (data) {
      //       const user = transformUserData(data);
      //       authStore.setUser(user);
      //     }
      //     showToastIfNotRecent('success', 'login-success', 'Login Successful', 'Welcome back!');
      //   })
      //   .catch((error) => {
      //     authStore.logout();
      //     if (isNetworkError(error)) {
      //       showToastIfNotRecent('error', 'login-error', 'No Connection', 'Please check your internet connection and try again.');
      //     } else {
      //       showToastIfNotRecent('error', 'login-error', 'Login Failed', 'Invalid credentials. Please try again.');
      //     }
      //     throw error;
      //   });
    },
    [authStore, showToastIfNotRecent]
  );

  const logout = useCallback(() => {
    authStore.logout();
    showToastIfNotRecent('success', 'logout-success', 'Logged Out', 'You have been successfully logged out.');
  }, [authStore, showToastIfNotRecent]);

  const refresh = useCallback(() => {
    const currentTokens = authStore.tokens;
    if (!currentTokens?.refreshToken) {
      return Promise.reject(new Error('No refresh token available'));
    }

    return refreshMutate({
      data: {
        refresh_token: currentTokens.refreshToken,
      },
    })
      .then((response) => {
        // Refresh response doesn't include refresh_token, keep the existing one
        authStore.updateTokens({
          accessToken: response.access_token,
          idToken: response.id_token,
          expiresIn: response.expires_in,
          tokenType: response.token_type,
        });
      })
      .catch((error) => {
        authStore.logout();
        if (isNetworkError(error)) {
          showToastIfNotRecent('error', 'session-expired', 'No Connection', 'Please check your internet connection and try again.');
        } else {
          showToastIfNotRecent('error', 'session-expired', 'Session Expired', 'Please log in again.');
        }
        throw error;
      });
  }, [refreshMutate, authStore, showToastIfNotRecent, isNetworkError]);

  const signup = useCallback(
    (
      email: string,
      password: string,
      telefono: string,
      nombre_institucion: string,
      tipo_institucion: string,
      nit: string,
      direccion: string,
      ciudad: string,
      pais: string,
      representante: string
    ) => {
      // TODO: Remove mock - temporary for development
      // Mock successful signup
      showToastIfNotRecent('success', 'signup-success', 'Signup Successful', `Account created for ${email}. Please log in.`);
      return Promise.resolve({
        email,
        user_id: 'mock-user-id',
        cliente_id: 'mock-client-id',
        nombre_institucion
      });

      // Original implementation (commented out for now)
      // return signupMutate({
      //   data: {
      //     email,
      //     password,
      //     user_type: 'client',
      //     telefono,
      //     nombre_institucion,
      //     tipo_institucion,
      //     nit,
      //     direccion,
      //     ciudad,
      //     pais,
      //     representante,
      //   },
      // })
      //   .then((response) => {
      //     showToastIfNotRecent('success', 'signup-success', 'Signup Successful', `Account created for ${response.email}. Please log in.`);
      //     return response;
      //   })
      //   .catch((error) => {
      //     if (isNetworkError(error)) {
      //       showToastIfNotRecent('error', 'signup-error', 'No Connection', 'Please check your internet connection and try again.');
      //     } else {
      //       showToastIfNotRecent('error', 'signup-error', 'Signup Failed', 'Unable to create account. Please try again.');
      //     }
      //     throw error;
      //   });
    },
    [showToastIfNotRecent]
  );

  const value: AuthContextValue = {
    login,
    logout,
    refresh,
    signup,
    isLoginPending,
    isRefreshPending,
    isSignupPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
