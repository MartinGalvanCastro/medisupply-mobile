export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'en' | 'es';
export type FontSize = 'small' | 'medium' | 'large';
export type ColorScheme = 'default' | 'blue' | 'green' | 'purple';

export interface NotificationSettings {
  enabled: boolean;
  email: boolean;
  push: boolean;
}

export interface AppearanceSettings {
  fontSize: FontSize;
  colorScheme: ColorScheme;
}

export interface SettingsState {
  theme: Theme;
  language: Language;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
}

export interface SettingsActions {
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setNotifications: (notifications: Partial<NotificationSettings>) => void;
  setAppearance: (appearance: Partial<AppearanceSettings>) => void;
  resetSettings: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;
