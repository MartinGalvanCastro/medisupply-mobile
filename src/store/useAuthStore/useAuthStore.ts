import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/utils/storage';
import { AuthState } from './types';

/**
 * Global authentication store using Zustand with selective MMKV persistence
 *
 * ONLY the following fields are persisted to disk:
 * - token: Auth token for API requests
 * - user: User data (id, email, name)
 *
 * NOT persisted (computed on app start):
 * - isAuthenticated: Derived from presence of user
 * - Actions (setUser, setToken, logout): Functions are never persisted
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      // Only persist specific fields
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        // isAuthenticated is NOT persisted - it's recomputed from user presence
      }),
    }
  )
);
