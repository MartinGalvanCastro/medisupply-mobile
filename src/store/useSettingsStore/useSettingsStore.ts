import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/utils/storage';
import { SettingsState } from './types';

/**
 * Global settings store with selective MMKV persistence
 *
 * ONLY the following fields are persisted to disk:
 * - theme: User's theme preference
 * - notificationsEnabled: Notification settings
 * - hasCompletedOnboarding: Whether user finished onboarding
 *
 * NOT persisted (temporary data):
 * - lastSyncDate: This is temporary and shouldn't persist across app restarts
 * - Actions (setTheme, etc.): Functions are never persisted
 *
 * @example
 * ```typescript
 * const { theme, setTheme } = useSettingsStore();
 *
 * // Change theme (persisted)
 * setTheme('dark');
 *
 * // Enable notifications (persisted)
 * setNotificationsEnabled(true);
 *
 * // Update last sync (NOT persisted)
 * setLastSyncDate(new Date().toISOString());
 * ```
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Default values
      theme: 'system',
      notificationsEnabled: true,
      hasCompletedOnboarding: false,
      lastSyncDate: null,

      // Actions
      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
      setLastSyncDate: (lastSyncDate) => set({ lastSyncDate }),

      reset: () =>
        set({
          theme: 'system',
          notificationsEnabled: true,
          hasCompletedOnboarding: false,
          lastSyncDate: null,
        }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => zustandStorage),
      // Only persist user preferences, not temporary data
      partialize: (state) => ({
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        // lastSyncDate is NOT persisted - it's temporary runtime data
      }),
    }
  )
);
