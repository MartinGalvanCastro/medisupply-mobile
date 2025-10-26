import { renderHook, act } from '@testing-library/react-native';
import { useSettingsStore } from './useSettingsStore';
import type { Theme, Language, NotificationSettings, AppearanceSettings } from './types';

describe('useSettingsStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useSettingsStore.getState().resetSettings();
    });
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.theme).toBe('light');
    expect(result.current.language).toBe('en');
    expect(result.current.notifications).toEqual({
      enabled: true,
      email: true,
      push: true,
    });
    expect(result.current.appearance).toEqual({
      fontSize: 'medium',
      colorScheme: 'default',
    });
  });

  describe('setTheme', () => {
    it('should set theme to dark', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should set theme to auto', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setTheme('auto');
      });

      expect(result.current.theme).toBe('auto');
    });

    it('should update theme from light to dark', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setTheme('light');
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
    });
  });

  describe('setLanguage', () => {
    it('should set language to Spanish', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setLanguage('es');
      });

      expect(result.current.language).toBe('es');
    });

    it('should set language to English', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
    });
  });

  describe('setNotifications', () => {
    it('should update notification enabled status', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setNotifications({ enabled: false });
      });

      expect(result.current.notifications.enabled).toBe(false);
      expect(result.current.notifications.email).toBe(true);
      expect(result.current.notifications.push).toBe(true);
    });

    it('should update email notification setting', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setNotifications({ email: false });
      });

      expect(result.current.notifications.email).toBe(false);
      expect(result.current.notifications.enabled).toBe(true);
    });

    it('should update multiple notification settings', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setNotifications({
          email: false,
          push: false,
        });
      });

      expect(result.current.notifications.email).toBe(false);
      expect(result.current.notifications.push).toBe(false);
      expect(result.current.notifications.enabled).toBe(true);
    });

    it('should disable all notifications', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setNotifications({
          enabled: false,
          email: false,
          push: false,
        });
      });

      expect(result.current.notifications).toEqual({
        enabled: false,
        email: false,
        push: false,
      });
    });
  });

  describe('setAppearance', () => {
    it('should update font size', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setAppearance({ fontSize: 'large' });
      });

      expect(result.current.appearance.fontSize).toBe('large');
      expect(result.current.appearance.colorScheme).toBe('default');
    });

    it('should update color scheme', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setAppearance({ colorScheme: 'blue' });
      });

      expect(result.current.appearance.colorScheme).toBe('blue');
      expect(result.current.appearance.fontSize).toBe('medium');
    });

    it('should update both font size and color scheme', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setAppearance({
          fontSize: 'small',
          colorScheme: 'purple',
        });
      });

      expect(result.current.appearance).toEqual({
        fontSize: 'small',
        colorScheme: 'purple',
      });
    });
  });

  describe('resetSettings', () => {
    it('should reset all settings to initial state', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setTheme('dark');
        result.current.setLanguage('es');
        result.current.setNotifications({ enabled: false });
        result.current.setAppearance({ fontSize: 'large' });
        result.current.resetSettings();
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.language).toBe('en');
      expect(result.current.notifications).toEqual({
        enabled: true,
        email: true,
        push: true,
      });
      expect(result.current.appearance).toEqual({
        fontSize: 'medium',
        colorScheme: 'default',
      });
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple updates in sequence', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setTheme('dark');
        result.current.setLanguage('es');
        result.current.setNotifications({ push: false });
        result.current.setAppearance({ fontSize: 'large', colorScheme: 'blue' });
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.language).toBe('es');
      expect(result.current.notifications.push).toBe(false);
      expect(result.current.appearance.fontSize).toBe('large');
      expect(result.current.appearance.colorScheme).toBe('blue');
    });
  });
});
