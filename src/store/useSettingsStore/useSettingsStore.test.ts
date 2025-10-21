import { renderHook, act } from '@testing-library/react-hooks';
import { useSettingsStore } from './useSettingsStore';

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    contains: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
}));

describe('useSettingsStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useSettingsStore());
    act(() => {
      result.current.reset();
    });
  });

  it('should have default values', () => {
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.theme).toBe('system');
    expect(result.current.notificationsEnabled).toBe(true);
    expect(result.current.hasCompletedOnboarding).toBe(false);
    expect(result.current.lastSyncDate).toBe(null);
  });

  it('should update theme', () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
  });

  it('should toggle notifications', () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.setNotificationsEnabled(false);
    });

    expect(result.current.notificationsEnabled).toBe(false);
  });

  it('should mark onboarding as completed', () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.setHasCompletedOnboarding(true);
    });

    expect(result.current.hasCompletedOnboarding).toBe(true);
  });

  it('should reset to defaults', () => {
    const { result } = renderHook(() => useSettingsStore());

    // Change some values
    act(() => {
      result.current.setTheme('dark');
      result.current.setNotificationsEnabled(false);
      result.current.setHasCompletedOnboarding(true);
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.theme).toBe('system');
    expect(result.current.notificationsEnabled).toBe(true);
    expect(result.current.hasCompletedOnboarding).toBe(false);
  });
});
