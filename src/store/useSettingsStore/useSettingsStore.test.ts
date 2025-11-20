import { useSettingsStore } from './useSettingsStore';
import type {
  Theme,
  Language,
  FontSize,
  ColorScheme,
  NotificationSettings,
  AppearanceSettings,
} from './types';

describe('useSettingsStore', () => {
  // Reset store state before each test
  beforeEach(() => {
    useSettingsStore.setState({
      theme: 'light',
      language: 'en',
      notifications: {
        enabled: true,
        email: true,
        push: true,
      },
      appearance: {
        fontSize: 'medium',
        colorScheme: 'default',
      },
    });
  });

  describe('Initial State', () => {
    it('should initialize with default theme', () => {
      const state = useSettingsStore.getState();
      expect(state.theme).toBe('light');
    });

    it('should initialize with default language', () => {
      const state = useSettingsStore.getState();
      expect(state.language).toBe('en');
    });

    it('should initialize with default notifications', () => {
      const state = useSettingsStore.getState();
      expect(state.notifications).toEqual({
        enabled: true,
        email: true,
        push: true,
      });
    });

    it('should initialize with default appearance', () => {
      const state = useSettingsStore.getState();
      expect(state.appearance).toEqual({
        fontSize: 'medium',
        colorScheme: 'default',
      });
    });

    it('should have all required action methods', () => {
      const state = useSettingsStore.getState();
      expect(typeof state.setTheme).toBe('function');
      expect(typeof state.setLanguage).toBe('function');
      expect(typeof state.setNotifications).toBe('function');
      expect(typeof state.setAppearance).toBe('function');
      expect(typeof state.resetSettings).toBe('function');
    });
  });

  describe('setTheme action', () => {
    it('should set theme to dark', () => {
      useSettingsStore.getState().setTheme('dark');
      expect(useSettingsStore.getState().theme).toBe('dark');
    });

    it('should set theme to light', () => {
      useSettingsStore.getState().setTheme('dark');
      expect(useSettingsStore.getState().theme).toBe('dark');

      useSettingsStore.getState().setTheme('light');
      expect(useSettingsStore.getState().theme).toBe('light');
    });

    it('should set theme to auto', () => {
      useSettingsStore.getState().setTheme('auto');
      expect(useSettingsStore.getState().theme).toBe('auto');
    });

    it('should support all valid theme values', () => {
      const themes: Theme[] = ['light', 'dark', 'auto'];
      themes.forEach((theme) => {
        useSettingsStore.getState().setTheme(theme);
        expect(useSettingsStore.getState().theme).toBe(theme);
      });
    });

    it('should update only theme, preserving other state', () => {
      useSettingsStore.getState().setLanguage('es');
      useSettingsStore.getState().setTheme('dark');

      const state = useSettingsStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.language).toBe('es');
      expect(state.notifications).toEqual({
        enabled: true,
        email: true,
        push: true,
      });
      expect(state.appearance).toEqual({
        fontSize: 'medium',
        colorScheme: 'default',
      });
    });

    it('should handle setting same theme value', () => {
      useSettingsStore.getState().setTheme('light');
      expect(useSettingsStore.getState().theme).toBe('light');

      useSettingsStore.getState().setTheme('light');
      expect(useSettingsStore.getState().theme).toBe('light');
    });
  });

  describe('setLanguage action', () => {
    it('should set language to es', () => {
      useSettingsStore.getState().setLanguage('es');
      expect(useSettingsStore.getState().language).toBe('es');
    });

    it('should set language to en', () => {
      useSettingsStore.getState().setLanguage('es');
      expect(useSettingsStore.getState().language).toBe('es');

      useSettingsStore.getState().setLanguage('en');
      expect(useSettingsStore.getState().language).toBe('en');
    });

    it('should support all valid language values', () => {
      const languages: Language[] = ['en', 'es'];
      languages.forEach((language) => {
        useSettingsStore.getState().setLanguage(language);
        expect(useSettingsStore.getState().language).toBe(language);
      });
    });

    it('should update only language, preserving other state', () => {
      useSettingsStore.getState().setTheme('dark');
      useSettingsStore.getState().setLanguage('es');

      const state = useSettingsStore.getState();
      expect(state.language).toBe('es');
      expect(state.theme).toBe('dark');
      expect(state.notifications).toEqual({
        enabled: true,
        email: true,
        push: true,
      });
      expect(state.appearance).toEqual({
        fontSize: 'medium',
        colorScheme: 'default',
      });
    });

    it('should handle setting same language value', () => {
      useSettingsStore.getState().setLanguage('en');
      expect(useSettingsStore.getState().language).toBe('en');

      useSettingsStore.getState().setLanguage('en');
      expect(useSettingsStore.getState().language).toBe('en');
    });
  });

  describe('setNotifications action', () => {
    it('should disable all notifications', () => {
      useSettingsStore.getState().setNotifications({
        enabled: false,
        email: false,
        push: false,
      });

      expect(useSettingsStore.getState().notifications).toEqual({
        enabled: false,
        email: false,
        push: false,
      });
    });

    it('should disable only email notifications', () => {
      useSettingsStore.getState().setNotifications({ email: false });

      expect(useSettingsStore.getState().notifications).toEqual({
        enabled: true,
        email: false,
        push: true,
      });
    });

    it('should disable only push notifications', () => {
      useSettingsStore.getState().setNotifications({ push: false });

      expect(useSettingsStore.getState().notifications).toEqual({
        enabled: true,
        email: true,
        push: false,
      });
    });

    it('should disable enabled flag while preserving email and push', () => {
      useSettingsStore.getState().setNotifications({ enabled: false });

      expect(useSettingsStore.getState().notifications).toEqual({
        enabled: false,
        email: true,
        push: true,
      });
    });

    it('should merge multiple notification settings', () => {
      useSettingsStore.getState().setNotifications({
        enabled: false,
        email: false,
      });

      expect(useSettingsStore.getState().notifications).toEqual({
        enabled: false,
        email: false,
        push: true,
      });
    });

    it('should update notifications incrementally', () => {
      useSettingsStore.getState().setNotifications({ enabled: false });
      expect(useSettingsStore.getState().notifications.enabled).toBe(false);

      useSettingsStore.getState().setNotifications({ email: false });

      expect(useSettingsStore.getState().notifications).toEqual({
        enabled: false,
        email: false,
        push: true,
      });
    });

    it('should handle empty object in setNotifications', () => {
      useSettingsStore.getState().setNotifications({});

      expect(useSettingsStore.getState().notifications).toEqual({
        enabled: true,
        email: true,
        push: true,
      });
    });

    it('should update only notifications, preserving other state', () => {
      useSettingsStore.getState().setTheme('dark');
      useSettingsStore.getState().setLanguage('es');
      useSettingsStore.getState().setNotifications({ email: false });

      const state = useSettingsStore.getState();
      expect(state.notifications).toEqual({
        enabled: true,
        email: false,
        push: true,
      });
      expect(state.theme).toBe('dark');
      expect(state.language).toBe('es');
      expect(state.appearance).toEqual({
        fontSize: 'medium',
        colorScheme: 'default',
      });
    });

    it('should support partial notification updates', () => {
      useSettingsStore.getState().setNotifications({ enabled: false });
      expect(useSettingsStore.getState().notifications.enabled).toBe(false);
      expect(useSettingsStore.getState().notifications.email).toBe(true);
      expect(useSettingsStore.getState().notifications.push).toBe(true);

      useSettingsStore.getState().setNotifications({ push: false });
      expect(useSettingsStore.getState().notifications.enabled).toBe(false);
      expect(useSettingsStore.getState().notifications.email).toBe(true);
      expect(useSettingsStore.getState().notifications.push).toBe(false);
    });
  });

  describe('setAppearance action', () => {
    it('should set fontSize to large', () => {
      useSettingsStore.getState().setAppearance({ fontSize: 'large' });

      expect(useSettingsStore.getState().appearance).toEqual({
        fontSize: 'large',
        colorScheme: 'default',
      });
    });

    it('should set fontSize to small', () => {
      useSettingsStore.getState().setAppearance({ fontSize: 'small' });

      expect(useSettingsStore.getState().appearance).toEqual({
        fontSize: 'small',
        colorScheme: 'default',
      });
    });

    it('should set fontSize to medium', () => {
      useSettingsStore.getState().setAppearance({ fontSize: 'large' });
      useSettingsStore.getState().setAppearance({ fontSize: 'medium' });

      expect(useSettingsStore.getState().appearance.fontSize).toBe('medium');
    });

    it('should support all valid fontSize values', () => {
      const fontSizes: FontSize[] = ['small', 'medium', 'large'];
      fontSizes.forEach((fontSize) => {
        useSettingsStore.getState().setAppearance({ fontSize });
        expect(useSettingsStore.getState().appearance.fontSize).toBe(fontSize);
      });
    });

    it('should set colorScheme to blue', () => {
      useSettingsStore.getState().setAppearance({ colorScheme: 'blue' });

      expect(useSettingsStore.getState().appearance).toEqual({
        fontSize: 'medium',
        colorScheme: 'blue',
      });
    });

    it('should set colorScheme to green', () => {
      useSettingsStore.getState().setAppearance({ colorScheme: 'green' });

      expect(useSettingsStore.getState().appearance).toEqual({
        fontSize: 'medium',
        colorScheme: 'green',
      });
    });

    it('should set colorScheme to purple', () => {
      useSettingsStore.getState().setAppearance({ colorScheme: 'purple' });

      expect(useSettingsStore.getState().appearance).toEqual({
        fontSize: 'medium',
        colorScheme: 'purple',
      });
    });

    it('should set colorScheme to default', () => {
      useSettingsStore.getState().setAppearance({ colorScheme: 'blue' });
      useSettingsStore.getState().setAppearance({ colorScheme: 'default' });

      expect(useSettingsStore.getState().appearance.colorScheme).toBe('default');
    });

    it('should support all valid colorScheme values', () => {
      const colorSchemes: ColorScheme[] = ['default', 'blue', 'green', 'purple'];
      colorSchemes.forEach((colorScheme) => {
        useSettingsStore.getState().setAppearance({ colorScheme });
        expect(useSettingsStore.getState().appearance.colorScheme).toBe(colorScheme);
      });
    });

    it('should merge multiple appearance settings', () => {
      useSettingsStore.getState().setAppearance({
        fontSize: 'large',
        colorScheme: 'blue',
      });

      expect(useSettingsStore.getState().appearance).toEqual({
        fontSize: 'large',
        colorScheme: 'blue',
      });
    });

    it('should update appearance incrementally', () => {
      useSettingsStore.getState().setAppearance({ fontSize: 'large' });
      expect(useSettingsStore.getState().appearance.fontSize).toBe('large');

      useSettingsStore.getState().setAppearance({ colorScheme: 'green' });

      expect(useSettingsStore.getState().appearance).toEqual({
        fontSize: 'large',
        colorScheme: 'green',
      });
    });

    it('should handle empty object in setAppearance', () => {
      useSettingsStore.getState().setAppearance({});

      expect(useSettingsStore.getState().appearance).toEqual({
        fontSize: 'medium',
        colorScheme: 'default',
      });
    });

    it('should update only appearance, preserving other state', () => {
      useSettingsStore.getState().setTheme('dark');
      useSettingsStore.getState().setLanguage('es');
      useSettingsStore.getState().setAppearance({ fontSize: 'large', colorScheme: 'blue' });

      const state = useSettingsStore.getState();
      expect(state.appearance).toEqual({
        fontSize: 'large',
        colorScheme: 'blue',
      });
      expect(state.theme).toBe('dark');
      expect(state.language).toBe('es');
      expect(state.notifications).toEqual({
        enabled: true,
        email: true,
        push: true,
      });
    });

    it('should support partial appearance updates', () => {
      useSettingsStore.getState().setAppearance({ fontSize: 'large' });
      expect(useSettingsStore.getState().appearance.fontSize).toBe('large');
      expect(useSettingsStore.getState().appearance.colorScheme).toBe('default');

      useSettingsStore.getState().setAppearance({ colorScheme: 'purple' });
      expect(useSettingsStore.getState().appearance.fontSize).toBe('large');
      expect(useSettingsStore.getState().appearance.colorScheme).toBe('purple');
    });
  });

  describe('resetSettings action', () => {
    it('should reset all settings to initial state', () => {
      useSettingsStore.getState().setTheme('dark');
      useSettingsStore.getState().setLanguage('es');
      useSettingsStore.getState().setNotifications({ email: false });
      useSettingsStore.getState().setAppearance({ fontSize: 'large' });

      expect(useSettingsStore.getState().theme).toBe('dark');
      expect(useSettingsStore.getState().language).toBe('es');

      useSettingsStore.getState().resetSettings();

      const state = useSettingsStore.getState();
      expect(state.theme).toBe('light');
      expect(state.language).toBe('en');
      expect(state.notifications).toEqual({
        enabled: true,
        email: true,
        push: true,
      });
      expect(state.appearance).toEqual({
        fontSize: 'medium',
        colorScheme: 'default',
      });
    });

    it('should reset to initial state from partially changed state', () => {
      useSettingsStore.getState().setTheme('dark');

      useSettingsStore.getState().resetSettings();

      expect(useSettingsStore.getState().theme).toBe('light');
    });

    it('should reset only theme and language, preserving notifications and appearance changes', () => {
      useSettingsStore.getState().setTheme('dark');
      useSettingsStore.getState().setLanguage('es');
      useSettingsStore.getState().setNotifications({ email: false });
      useSettingsStore.getState().setAppearance({ fontSize: 'large' });

      useSettingsStore.getState().resetSettings();

      const state = useSettingsStore.getState();
      expect(state.theme).toBe('light');
      expect(state.language).toBe('en');
      expect(state.notifications.email).toBe(true);
      expect(state.appearance.fontSize).toBe('medium');
    });

    it('should handle resetting immediately after creation', () => {
      useSettingsStore.getState().resetSettings();

      const state = useSettingsStore.getState();
      expect(state.theme).toBe('light');
      expect(state.language).toBe('en');
      expect(state.notifications).toEqual({
        enabled: true,
        email: true,
        push: true,
      });
      expect(state.appearance).toEqual({
        fontSize: 'medium',
        colorScheme: 'default',
      });
    });

    it('should handle resetting multiple times', () => {
      useSettingsStore.getState().setTheme('dark');
      useSettingsStore.getState().resetSettings();
      expect(useSettingsStore.getState().theme).toBe('light');

      useSettingsStore.getState().setTheme('auto');
      useSettingsStore.getState().resetSettings();
      expect(useSettingsStore.getState().theme).toBe('light');
    });

    it('should reset all state properties to initial values', () => {
      useSettingsStore.getState().setTheme('auto');
      useSettingsStore.getState().setLanguage('es');
      useSettingsStore.getState().setNotifications({
        enabled: false,
        email: false,
        push: false,
      });
      useSettingsStore.getState().setAppearance({
        fontSize: 'small',
        colorScheme: 'purple',
      });

      useSettingsStore.getState().resetSettings();

      const initialState = useSettingsStore.getState();
      expect(initialState.theme).toBe('light');
      expect(initialState.language).toBe('en');
      expect(initialState.notifications.enabled).toBe(true);
      expect(initialState.notifications.email).toBe(true);
      expect(initialState.notifications.push).toBe(true);
      expect(initialState.appearance.fontSize).toBe('medium');
      expect(initialState.appearance.colorScheme).toBe('default');
    });
  });

  describe('Complex state transitions', () => {
    it('should handle multiple sequential updates', () => {
      useSettingsStore.getState().setTheme('dark');
      expect(useSettingsStore.getState().theme).toBe('dark');

      useSettingsStore.getState().setLanguage('es');
      expect(useSettingsStore.getState().language).toBe('es');
      expect(useSettingsStore.getState().theme).toBe('dark');

      useSettingsStore.getState().setNotifications({ email: false });
      expect(useSettingsStore.getState().notifications.email).toBe(false);
      expect(useSettingsStore.getState().theme).toBe('dark');
      expect(useSettingsStore.getState().language).toBe('es');

      useSettingsStore.getState().setAppearance({ fontSize: 'large' });
      expect(useSettingsStore.getState().appearance.fontSize).toBe('large');
      expect(useSettingsStore.getState().notifications.email).toBe(false);
      expect(useSettingsStore.getState().theme).toBe('dark');
      expect(useSettingsStore.getState().language).toBe('es');
    });

    it('should handle rapid successive updates within same sequence', () => {
      useSettingsStore.getState().setTheme('dark');
      useSettingsStore.getState().setLanguage('es');
      useSettingsStore.getState().setNotifications({ email: false, push: false });
      useSettingsStore.getState().setAppearance({ fontSize: 'small', colorScheme: 'purple' });

      const state = useSettingsStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.language).toBe('es');
      expect(state.notifications).toEqual({
        enabled: true,
        email: false,
        push: false,
      });
      expect(state.appearance).toEqual({
        fontSize: 'small',
        colorScheme: 'purple',
      });
    });

    it('should handle toggle operations', () => {
      useSettingsStore.getState().setTheme('dark');
      expect(useSettingsStore.getState().theme).toBe('dark');

      useSettingsStore.getState().setTheme('light');
      expect(useSettingsStore.getState().theme).toBe('light');

      useSettingsStore.getState().setTheme('dark');
      expect(useSettingsStore.getState().theme).toBe('dark');
    });

    it('should preserve state across multiple store accesses', () => {
      useSettingsStore.getState().setTheme('dark');

      const state1 = useSettingsStore.getState();
      const state2 = useSettingsStore.getState();

      expect(state1.theme).toBe('dark');
      expect(state2.theme).toBe('dark');
      expect(state1.theme).toBe(state2.theme);
    });

    it('should handle complex state updates with all actions', () => {
      // Update theme
      useSettingsStore.getState().setTheme('auto');
      expect(useSettingsStore.getState().theme).toBe('auto');

      // Update language
      useSettingsStore.getState().setLanguage('es');
      expect(useSettingsStore.getState().language).toBe('es');

      // Update notifications partially
      useSettingsStore.getState().setNotifications({ push: false });
      expect(useSettingsStore.getState().notifications.push).toBe(false);
      expect(useSettingsStore.getState().notifications.enabled).toBe(true);
      expect(useSettingsStore.getState().notifications.email).toBe(true);

      // Update appearance partially
      useSettingsStore.getState().setAppearance({ fontSize: 'large' });
      expect(useSettingsStore.getState().appearance.fontSize).toBe('large');
      expect(useSettingsStore.getState().appearance.colorScheme).toBe('default');

      // Update more appearance
      useSettingsStore.getState().setAppearance({ colorScheme: 'blue' });
      expect(useSettingsStore.getState().appearance.fontSize).toBe('large');
      expect(useSettingsStore.getState().appearance.colorScheme).toBe('blue');

      // Verify all states remain correct
      const state = useSettingsStore.getState();
      expect(state.theme).toBe('auto');
      expect(state.language).toBe('es');
      expect(state.notifications.push).toBe(false);
      expect(state.appearance.fontSize).toBe('large');
      expect(state.appearance.colorScheme).toBe('blue');
    });
  });

  describe('Edge cases and state consistency', () => {
    it('should maintain state consistency across all properties', () => {
      const initialState = useSettingsStore.getState();

      // Verify all properties exist and have correct types
      expect(typeof initialState.theme).toBe('string');
      expect(typeof initialState.language).toBe('string');
      expect(typeof initialState.notifications).toBe('object');
      expect(typeof initialState.appearance).toBe('object');

      // Verify nested objects have correct structure
      expect(typeof initialState.notifications.enabled).toBe('boolean');
      expect(typeof initialState.notifications.email).toBe('boolean');
      expect(typeof initialState.notifications.push).toBe('boolean');
      expect(typeof initialState.appearance.fontSize).toBe('string');
      expect(typeof initialState.appearance.colorScheme).toBe('string');
    });

    it('should not corrupt state with rapid theme changes', () => {
      const themes: Theme[] = ['light', 'dark', 'auto', 'light', 'dark'];
      themes.forEach((theme) => {
        useSettingsStore.getState().setTheme(theme);
      });
      expect(useSettingsStore.getState().theme).toBe('dark');
    });

    it('should not corrupt state with rapid language changes', () => {
      const languages: Language[] = ['en', 'es', 'en', 'es', 'en'];
      languages.forEach((language) => {
        useSettingsStore.getState().setLanguage(language);
      });
      expect(useSettingsStore.getState().language).toBe('en');
    });

    it('should handle notification state merging correctly', () => {
      useSettingsStore.getState().setNotifications({ enabled: false });
      useSettingsStore.getState().setNotifications({ email: false });
      useSettingsStore.getState().setNotifications({ push: true });

      const notifications = useSettingsStore.getState().notifications;
      expect(notifications.enabled).toBe(false);
      expect(notifications.email).toBe(false);
      expect(notifications.push).toBe(true);
    });

    it('should handle appearance state merging correctly', () => {
      useSettingsStore.getState().setAppearance({ fontSize: 'small' });
      useSettingsStore.getState().setAppearance({ colorScheme: 'blue' });
      useSettingsStore.getState().setAppearance({ fontSize: 'large' });

      const appearance = useSettingsStore.getState().appearance;
      expect(appearance.fontSize).toBe('large');
      expect(appearance.colorScheme).toBe('blue');
    });

    it('should reset properly after complex state changes', () => {
      // Create complex state
      useSettingsStore.getState().setTheme('auto');
      useSettingsStore.getState().setLanguage('es');
      useSettingsStore.getState().setNotifications({
        enabled: false,
        email: true,
        push: false,
      });
      useSettingsStore.getState().setAppearance({
        fontSize: 'large',
        colorScheme: 'purple',
      });

      // Reset
      useSettingsStore.getState().resetSettings();

      // Verify complete reset
      const state = useSettingsStore.getState();
      expect(state.theme).toBe('light');
      expect(state.language).toBe('en');
      expect(state.notifications).toEqual({
        enabled: true,
        email: true,
        push: true,
      });
      expect(state.appearance).toEqual({
        fontSize: 'medium',
        colorScheme: 'default',
      });
    });

    it('should maintain independent state across different action types', () => {
      // Theme changes should not affect language
      useSettingsStore.getState().setTheme('dark');
      expect(useSettingsStore.getState().language).toBe('en');

      // Language changes should not affect notifications
      useSettingsStore.getState().setLanguage('es');
      expect(useSettingsStore.getState().notifications).toEqual({
        enabled: true,
        email: true,
        push: true,
      });

      // Notification changes should not affect appearance
      useSettingsStore.getState().setNotifications({ email: false });
      expect(useSettingsStore.getState().appearance).toEqual({
        fontSize: 'medium',
        colorScheme: 'default',
      });
    });
  });
});
