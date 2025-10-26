import { renderHook } from '@testing-library/react-native';
import { useTranslation } from './useTranslation';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params) {
        return `${key}_translated_with_params`;
      }
      return `${key}_translated`;
    },
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
}));

describe('useTranslation', () => {
  it('should return translation function', () => {
    const { result } = renderHook(() => useTranslation());

    expect(result.current.t).toBeDefined();
    expect(typeof result.current.t).toBe('function');
  });

  it('should return i18n instance', () => {
    const { result } = renderHook(() => useTranslation());

    expect(result.current.i18n).toBeDefined();
    expect(result.current.i18n.language).toBe('en');
  });

  it('should translate keys correctly', () => {
    const { result } = renderHook(() => useTranslation());

    const translated = result.current.t('common.loading');
    expect(translated).toBe('common.loading_translated');
  });

  it('should translate keys with parameters', () => {
    const { result } = renderHook(() => useTranslation());

    const translated = result.current.t('validation.min', { min: 5 });
    expect(translated).toBe('validation.min_translated_with_params');
  });

  it('should handle nested translation keys', () => {
    const { result } = renderHook(() => useTranslation());

    const translated = result.current.t('common.error');
    expect(translated).toBe('common.error_translated');
  });
});
