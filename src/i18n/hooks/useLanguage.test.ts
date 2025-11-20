import { renderHook, act } from '@testing-library/react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from './useLanguage';

jest.mock('react-i18next');

describe('useLanguage', () => {
  let mockChangeLanguage: jest.Mock;
  let mockI18n: { language: string; changeLanguage: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockChangeLanguage = jest.fn().mockResolvedValue(undefined);
    mockI18n = {
      language: 'en',
      changeLanguage: mockChangeLanguage,
    };
    (useTranslation as jest.Mock).mockReturnValue({
      i18n: mockI18n,
    });
  });

  describe('currentLanguage', () => {
    it('returns the current language from i18n', () => {
      const { result } = renderHook(() => useLanguage());

      expect(result.current.currentLanguage).toBe('en');
    });

    it('returns Spanish when language is set to es', () => {
      mockI18n.language = 'es';
      const { result } = renderHook(() => useLanguage());

      expect(result.current.currentLanguage).toBe('es');
    });

    it('updates currentLanguage when i18n.language changes', () => {
      const { result } = renderHook(() => useLanguage());

      expect(result.current.currentLanguage).toBe('en');

      mockI18n.language = 'es';

      const { result: result2 } = renderHook(() => useLanguage());
      expect(result2.current.currentLanguage).toBe('es');
    });
  });

  describe('changeLanguage', () => {
    it('calls i18n.changeLanguage with the specified language', async () => {
      const { result } = renderHook(() => useLanguage());

      await act(async () => {
        await result.current.changeLanguage('es');
      });

      expect(mockChangeLanguage).toHaveBeenCalledWith('es');
      expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
    });

    it('returns a promise that resolves when changeLanguage completes', async () => {
      mockChangeLanguage.mockResolvedValue(undefined);
      const { result } = renderHook(() => useLanguage());

      let resolved = false;

      await act(async () => {
        result.current.changeLanguage('es').then(() => {
          resolved = true;
        });
      });

      expect(resolved).toBe(true);
    });

    it('can change language from en to es', async () => {
      const { result } = renderHook(() => useLanguage());

      await act(async () => {
        await result.current.changeLanguage('es');
      });

      expect(mockChangeLanguage).toHaveBeenCalledWith('es');
    });

    it('can change language from es to en', async () => {
      mockI18n.language = 'es';
      const { result } = renderHook(() => useLanguage());

      await act(async () => {
        await result.current.changeLanguage('en');
      });

      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });

    it('handles errors from i18n.changeLanguage', async () => {
      const error = new Error('Language change failed');
      mockChangeLanguage.mockRejectedValueOnce(error);
      const { result } = renderHook(() => useLanguage());

      const promise = act(async () => {
        return result.current.changeLanguage('es');
      });

      await expect(promise).rejects.toThrow('Language change failed');
      expect(mockChangeLanguage).toHaveBeenCalledWith('es');
    });

    it('returns the same function reference on re-renders when i18n dependency does not change', () => {
      const { result, rerender } = renderHook(
        ({ trigger }: any) => useLanguage(),
        { initialProps: { trigger: 0 } }
      );

      const firstChangeLanguage = result.current.changeLanguage;

      rerender({ trigger: 1 });

      const secondChangeLanguage = result.current.changeLanguage;

      expect(firstChangeLanguage).toBe(secondChangeLanguage);
    });

    it('updates changeLanguage callback when i18n instance changes', () => {
      const { result } = renderHook(() => useLanguage());

      const firstChangeLanguage = result.current.changeLanguage;

      const newMockI18n = {
        language: 'en',
        changeLanguage: jest.fn(),
      };

      (useTranslation as jest.Mock).mockReturnValue({
        i18n: newMockI18n,
      });

      const { result: result2 } = renderHook(() => useLanguage());

      const secondChangeLanguage = result2.current.changeLanguage;

      expect(firstChangeLanguage).not.toBe(secondChangeLanguage);
    });
  });

  describe('hook behavior', () => {
    it('returns an object with currentLanguage and changeLanguage properties', () => {
      const { result } = renderHook(() => useLanguage());

      expect(result.current).toHaveProperty('currentLanguage');
      expect(result.current).toHaveProperty('changeLanguage');
      expect(typeof result.current.changeLanguage).toBe('function');
    });

    it('useTranslation is called on hook initialization', () => {
      renderHook(() => useLanguage());

      expect(useTranslation).toHaveBeenCalled();
    });

    it('can perform multiple language changes in sequence', async () => {
      const { result } = renderHook(() => useLanguage());

      mockChangeLanguage.mockResolvedValue(undefined);

      await act(async () => {
        await result.current.changeLanguage('es');
        await result.current.changeLanguage('en');
        await result.current.changeLanguage('es');
      });

      expect(mockChangeLanguage).toHaveBeenCalledTimes(3);
      expect(mockChangeLanguage).toHaveBeenNthCalledWith(1, 'es');
      expect(mockChangeLanguage).toHaveBeenNthCalledWith(2, 'en');
      expect(mockChangeLanguage).toHaveBeenNthCalledWith(3, 'es');
    });

    it('supports concurrent language change calls', async () => {
      const { result } = renderHook(() => useLanguage());

      mockChangeLanguage.mockResolvedValue(undefined);

      await act(async () => {
        await Promise.all([
          result.current.changeLanguage('es'),
          result.current.changeLanguage('en'),
        ]);
      });

      expect(mockChangeLanguage).toHaveBeenCalledTimes(2);
    });
  });
});
