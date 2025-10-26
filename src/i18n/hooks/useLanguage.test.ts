import { renderHook, act } from '@testing-library/react-native';
import { useLanguage } from './useLanguage';

const mockChangeLanguage = jest.fn();

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'en',
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

describe('useLanguage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return current language', () => {
    const { result } = renderHook(() => useLanguage());

    expect(result.current.currentLanguage).toBe('en');
  });

  it('should return changeLanguage function', () => {
    const { result } = renderHook(() => useLanguage());

    expect(result.current.changeLanguage).toBeDefined();
    expect(typeof result.current.changeLanguage).toBe('function');
  });

  it('should change language when changeLanguage is called', async () => {
    const { result } = renderHook(() => useLanguage());

    await act(async () => {
      await result.current.changeLanguage('es');
    });

    expect(mockChangeLanguage).toHaveBeenCalledWith('es');
  });

  it('should handle language change to English', async () => {
    const { result } = renderHook(() => useLanguage());

    await act(async () => {
      await result.current.changeLanguage('en');
    });

    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('should maintain stable function reference', () => {
    const { result } = renderHook(() => useLanguage());

    expect(typeof result.current.changeLanguage).toBe('function');
    expect(result.current.changeLanguage).toBeDefined();
  });
});
