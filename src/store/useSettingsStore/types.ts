/**
 * Settings store types
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export type SettingsState = {
  // Theme settings
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Notification settings
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;

  // Onboarding
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;

  // Last sync timestamp
  lastSyncDate: string | null;
  setLastSyncDate: (date: string) => void;

  // Reset all settings
  reset: () => void;
};
