import {
  useGetMeAuthMeGet,
  useLoginAuthLoginPost,
  useRefreshAuthRefreshPost,
  useSignupAuthSignupPost,
} from '@/api/generated/authentication/authentication';
import { useToast } from '@/providers';
import { useAuthStore } from '@/store';
import { transformTokensFromLogin, transformUserData } from '@/utils/auth';
import { isNetworkError } from '@/utils/error';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthContextValue, AuthProviderProps } from './types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const lastToastRef = useRef<{ type: string; timestamp: number }>({ type: '', timestamp: 0 });

  // Control when /auth/me query executes
  const [shouldFetchUser, setShouldFetchUser] = useState(false);

  // Debug: Log when shouldFetchUser changes
  useEffect(() => {
    console.log('[AuthProvider] shouldFetchUser changed to:', shouldFetchUser);
  }, [shouldFetchUser]);

  const { mutateAsync: loginMutate, isPending: isLoginPending } = useLoginAuthLoginPost();
  const { mutateAsync: refreshMutate, isPending: isRefreshPending } = useRefreshAuthRefreshPost();
  const { mutateAsync: signupMutate, isPending: isSignupPending } = useSignupAuthSignupPost();

  const authStore = useAuthStore();

  /**
   * Use React Query hook with enabled flag to fetch user data
   * Only executes when shouldFetchUser is true
   */
  const {
    data: meData,
    isLoading: isFetchingUser,
    error: meError,
    isError: hasMeError,
  } = useGetMeAuthMeGet({
    query: {
      enabled: shouldFetchUser,
      retry: false, // Don't retry if token is invalid
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    },
  });

  /**
   * Handle successful user data fetch
   * Transform and store user data when /auth/me returns successfully
   */
  useEffect(() => {
    if (meData) {
      console.log('[AuthProvider] meData received, transforming user data');
      const user = transformUserData(meData);
      authStore.setUser(user);
      console.log('[AuthProvider] Setting shouldFetchUser to false after successful fetch');
      setShouldFetchUser(false); // Reset flag after successful fetch
    }
  }, [meData]); // authStore methods are stable, no need to include in dependencies

  /**
   * Handle user data fetch errors
   * If unauthorized (401), clear tokens and logout
   */
  useEffect(() => {
    if (hasMeError && meError && shouldFetchUser) {
      console.error('Failed to fetch user:', meError);

      // If unauthorized, clear tokens and logout
      const errorResponse = meError as { response?: { status?: number } };
      if (errorResponse.response?.status === 401) {
        authStore.logout();
      }

      setShouldFetchUser(false); // Reset flag
    }
  }, [hasMeError, meError, shouldFetchUser]); // authStore methods are stable, no need to include in dependencies

  /**
   * Initialize authentication on mount
   * Check if tokens exist in storage and trigger user fetch if they do
   */
  useEffect(() => {
    const initAuth = () => {
      const { tokens } = authStore;
      if (tokens?.accessToken && tokens?.idToken) {
        // Tokens exist in Zustand storage, fetch user data
        setShouldFetchUser(true);
      }
    };

    initAuth();
  }, []); // Only run once on mount

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

  const login = useCallback(
    (email: string, password: string) => {
      return loginMutate({
        data: {
          email,
          password,
        },
      })
        .then((response) => {
          const tokens = transformTokensFromLogin(response);
          console.log('[AuthProvider] Storing tokens from login response:', {
            accessToken: tokens.accessToken,
            idToken: tokens.idToken,
          });
          authStore.setTokens(tokens);

          // Trigger user fetch using React Query enabled flag
          // Reset to false first to ensure the effect triggers even if it was already true
          console.log('[AuthProvider] Triggering /auth/me fetch');
          setShouldFetchUser(false);
          // Use setTimeout to ensure state update is processed
          setTimeout(() => setShouldFetchUser(true), 0);

          showToastIfNotRecent('success', 'login-success', 'Login Successful', 'Welcome back!');
        })
        .catch((error) => {
          authStore.logout();
          if (isNetworkError(error)) {
            showToastIfNotRecent('error', 'login-error', 'No Connection', 'Please check your internet connection and try again.');
          } else {
            showToastIfNotRecent('error', 'login-error', 'Login Failed', 'Invalid credentials. Please try again.');
          }
          throw error;
        });
    },
    [loginMutate, showToastIfNotRecent] // authStore methods are stable
  );

  const logout = useCallback(() => {
    console.log('[AuthProvider] logout - clearing auth store and query cache');
    authStore.logout();
    // Clear React Query cache to prevent stale data on next login
    queryClient.clear();
    console.log('[AuthProvider] logout - cache cleared');
    showToastIfNotRecent('success', 'logout-success', 'Logged Out', 'You have been successfully logged out.');
  }, [queryClient, showToastIfNotRecent]); // authStore methods are stable

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
  }, [refreshMutate, showToastIfNotRecent]); // authStore methods are stable, reading .tokens at execution time

  const signup = useCallback(
    (
      email: string,
      password: string,
      name: string,
      telefono: string,
      nombre_institucion: string,
      tipo_institucion: string,
      nit: string,
      direccion: string,
      ciudad: string,
      pais: string,
      representante: string
    ) => {
      return signupMutate({
        data: {
          email,
          password,
          name,
          user_type: 'client',
          telefono,
          nombre_institucion,
          tipo_institucion,
          nit,
          direccion,
          ciudad,
          pais,
          representante,
        },
      })
        .then((response) => {
          showToastIfNotRecent('success', 'signup-success', 'Signup Successful', `Account created for ${response.email}. Please log in.`);
          return response;
        })
        .catch((error) => {
          if (isNetworkError(error)) {
            showToastIfNotRecent('error', 'signup-error', 'No Connection', 'Please check your internet connection and try again.');
          } else {
            showToastIfNotRecent('error', 'signup-error', 'Signup Failed', 'Unable to create account. Please try again.');
          }
          throw error;
        });
    },
    [signupMutate, showToastIfNotRecent]
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
