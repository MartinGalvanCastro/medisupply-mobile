import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/utils/storage';
import type { AuthStore, AuthState } from './types';

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => {
        console.log('[AuthStore] setUser called:', user?.name);
        set({
          user,
          isAuthenticated: !!user,
        });
        console.log('[AuthStore] After setUser, current state:', {
          hasUser: !!get().user,
          hasTokens: !!get().tokens,
        });
      },

      setTokens: (tokens) => {
        console.log('[AuthStore] setTokens called:', {
          accessToken: tokens?.accessToken,
          idToken: tokens?.idToken,
        });
        set({
          tokens,
          isAuthenticated: !!tokens,
        });
        // Verify tokens were set immediately
        const currentState = get();
        console.log('[AuthStore] After setTokens, current state:', {
          hasTokens: !!currentState.tokens,
          idToken: currentState.tokens?.idToken,
        });
      },

      login: (user, tokens) => {
        console.log('[AuthStore] login called');
        set({
          user,
          tokens,
          isAuthenticated: true,
        });
      },

      logout: () => {
        console.log('[AuthStore] logout called');
        set(initialState);
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updateTokens: (tokenUpdates) =>
        set((state) => ({
          tokens: state.tokens ? { ...state.tokens, ...tokenUpdates } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
