import { useTranslation } from './useTranslation';
import * as ReactI18next from 'react-i18next';

// Mock react-i18next
jest.mock('react-i18next');

describe('useTranslation', () => {
  const mockT = jest.fn();
  const mockChangeLanguage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations before each test
    mockT.mockReset();
    mockChangeLanguage.mockReset();

    // Default mock setup
    (ReactI18next.useTranslation as jest.Mock).mockReturnValue({
      t: mockT,
      i18n: {
        changeLanguage: mockChangeLanguage,
        language: 'en',
      },
    });
  });

  describe('Return value structure', () => {
    it('should return an object with t and i18n properties', () => {
      const result = useTranslation();

      expect(result).toHaveProperty('t');
      expect(result).toHaveProperty('i18n');
      expect(typeof result.t).toBe('function');
      expect(typeof result.i18n).toBe('object');
    });

    it('should return both t function and i18n object', () => {
      const { t, i18n } = useTranslation();

      expect(t).toBeDefined();
      expect(i18n).toBeDefined();
    });
  });

  describe('t function - translation', () => {
    it('should call underlying t function with key only', () => {
      mockT.mockReturnValue('Welcome back');

      const { t } = useTranslation();
      const result = t('auth.login.title');

      expect(mockT).toHaveBeenCalledWith('auth.login.title', undefined);
      expect(result).toBe('Welcome back');
    });

    it('should call underlying t function with key and params', () => {
      mockT.mockReturnValue('Maximum 50 characters allowed');

      const { t } = useTranslation();
      const params = { max: 50 };
      const result = t('validation.max', params);

      expect(mockT).toHaveBeenCalledWith('validation.max', params);
      expect(result).toBe('Maximum 50 characters allowed');
    });

    it('should translate nested keys correctly', () => {
      mockT.mockReturnValue('Sign In');

      const { t } = useTranslation();
      const result = t('auth.login.signIn');

      expect(mockT).toHaveBeenCalledWith('auth.login.signIn', undefined);
      expect(result).toBe('Sign In');
    });

    it('should handle deeply nested keys', () => {
      mockT.mockReturnValue('Schedule Visit');

      const { t } = useTranslation();
      const result = t('clientDetail.scheduleVisitModal.title');

      expect(mockT).toHaveBeenCalledWith('clientDetail.scheduleVisitModal.title', undefined);
      expect(result).toBe('Schedule Visit');
    });

    it('should support string parameters', () => {
      mockT.mockReturnValue('Product added');

      const { t } = useTranslation();
      const params = { productName: 'Aspirin', quantity: 5 };
      const result = t('inventory.addedToCartMessage', params);

      expect(mockT).toHaveBeenCalledWith('inventory.addedToCartMessage', params);
      expect(result).toBe('Product added');
    });

    it('should support numeric parameters', () => {
      mockT.mockReturnValue('Version 1.0.0');

      const { t } = useTranslation();
      const params = { version: 100 };
      const result = t('account.appInfo.version', params);

      expect(mockT).toHaveBeenCalledWith('account.appInfo.version', params);
      expect(result).toBe('Version 1.0.0');
    });

    it('should handle mixed string and numeric parameters', () => {
      mockT.mockReturnValue('Minimum 8 characters required');

      const { t } = useTranslation();
      const params = { min: 8, fieldName: 'password' };
      const result = t('validation.min', params);

      expect(mockT).toHaveBeenCalledWith('validation.min', params);
      expect(result).toBe('Minimum 8 characters required');
    });

    it('should handle empty params object', () => {
      mockT.mockReturnValue('Loading...');

      const { t } = useTranslation();
      const result = t('common.loading', {});

      expect(mockT).toHaveBeenCalledWith('common.loading', {});
      expect(result).toBe('Loading...');
    });

    it('should handle multiple sequential translation calls', () => {
      mockT.mockReturnValueOnce('Sign In').mockReturnValueOnce('Sign Up').mockReturnValueOnce('Cancel');

      const { t } = useTranslation();

      const signin = t('auth.login.signIn');
      const signup = t('auth.signup.signUp');
      const cancel = t('common.cancel');

      expect(mockT).toHaveBeenCalledTimes(3);
      expect(signin).toBe('Sign In');
      expect(signup).toBe('Sign Up');
      expect(cancel).toBe('Cancel');
    });

    it('should preserve parameter types in translation call', () => {
      mockT.mockReturnValue('Result');

      const { t } = useTranslation();
      const stringParam = 'test';
      const numberParam = 42;

      t('some.key' as any, { str: stringParam, num: numberParam });

      expect(mockT).toHaveBeenCalledWith('some.key' as any, {
        str: stringParam,
        num: numberParam,
      });
    });
  });

  describe('i18n object - access to underlying i18n', () => {
    it('should expose i18n object with changeLanguage', () => {
      const { i18n } = useTranslation();

      expect(i18n.changeLanguage).toBeDefined();
      expect(typeof i18n.changeLanguage).toBe('function');
    });

    it('should expose i18n object with language property', () => {
      (ReactI18next.useTranslation as jest.Mock).mockReturnValue({
        t: mockT,
        i18n: {
          changeLanguage: mockChangeLanguage,
          language: 'en',
        },
      });

      const { i18n } = useTranslation();

      expect(i18n.language).toBe('en');
    });

    it('should expose current language as English', () => {
      (ReactI18next.useTranslation as jest.Mock).mockReturnValue({
        t: mockT,
        i18n: {
          changeLanguage: mockChangeLanguage,
          language: 'en',
        },
      });

      const { i18n } = useTranslation();

      expect(i18n.language).toBe('en');
    });

    it('should expose current language as Spanish', () => {
      (ReactI18next.useTranslation as jest.Mock).mockReturnValue({
        t: mockT,
        i18n: {
          changeLanguage: mockChangeLanguage,
          language: 'es',
        },
      });

      const { i18n } = useTranslation();

      expect(i18n.language).toBe('es');
    });

    it('should pass through all i18n properties', () => {
      const mockI18n = {
        changeLanguage: mockChangeLanguage,
        language: 'en',
        languages: ['en', 'es'],
        dir: 'ltr',
      };

      (ReactI18next.useTranslation as jest.Mock).mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const { i18n } = useTranslation();

      expect(i18n).toEqual(mockI18n);
      expect(i18n.languages).toEqual(['en', 'es']);
      expect(i18n.dir).toBe('ltr');
    });
  });

  describe('Hook integration', () => {
    it('should call react-i18next useTranslation hook once', () => {
      useTranslation();

      expect(ReactI18next.useTranslation).toHaveBeenCalledTimes(1);
    });

    it('should use default namespace from react-i18next', () => {
      useTranslation();

      expect(ReactI18next.useTranslation).toHaveBeenCalledWith();
    });

    it('should destructure both t and i18n from react-i18next', () => {
      (ReactI18next.useTranslation as jest.Mock).mockReturnValue({
        t: mockT,
        i18n: { language: 'en' },
      });

      const { t, i18n } = useTranslation();

      expect(typeof t).toBe('function');
      expect(i18n.language).toBe('en');
    });
  });

  describe('Multiple hook instances', () => {
    it('should return independent instances', () => {
      const instance1 = useTranslation();
      const instance2 = useTranslation();

      expect(typeof instance1.t).toBe('function');
      expect(typeof instance2.t).toBe('function');
    });

    it('should allow using multiple instances independently', () => {
      mockT.mockReturnValueOnce('Result 1').mockReturnValueOnce('Result 2');

      const { t: t1 } = useTranslation();
      const { t: t2 } = useTranslation();

      const result1 = t1('key1' as any);
      const result2 = t2('key2' as any);

      expect(result1).toBe('Result 1');
      expect(result2).toBe('Result 2');
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined params gracefully', () => {
      mockT.mockReturnValue('Loading...');

      const { t } = useTranslation();
      const result = t('common.loading', undefined);

      expect(mockT).toHaveBeenCalledWith('common.loading', undefined);
      expect(result).toBe('Loading...');
    });

    it('should handle empty key string', () => {
      mockT.mockReturnValue('');

      const { t } = useTranslation();
      const result = t('' as any);

      expect(result).toBe('');
    });

    it('should handle t function returning empty string', () => {
      mockT.mockReturnValue('');

      const { t } = useTranslation();
      const result = t('missing.key' as any);

      expect(result).toBe('');
    });

    it('should handle large parameter objects', () => {
      mockT.mockReturnValue('Translation');

      const { t } = useTranslation();
      const largeParams = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
        key4: 'value4',
        key5: 'value5',
        key6: 100,
        key7: 200,
      };

      const result = t('some.key' as any, largeParams);

      expect(mockT).toHaveBeenCalledWith('some.key' as any, largeParams);
      expect(result).toBe('Translation');
    });

    it('should handle zero and false values in params', () => {
      mockT.mockReturnValue('Count: 0');

      const { t } = useTranslation();
      const params = { count: 0, enabled: false } as any;

      const result = t('some.key' as any, params);

      expect(mockT).toHaveBeenCalledWith('some.key' as any, params);
      expect(result).toBe('Count: 0');
    });
  });

  describe('Type safety', () => {
    it('should accept translation keys from locales', () => {
      mockT.mockReturnValue('Common');

      const { t } = useTranslation();

      // These should not throw type errors
      const result1 = t('common.loading');
      const result2 = t('auth.login.title');
      const result3 = t('validation.email');

      expect(result1).toBe('Common');
      expect(result2).toBe('Common');
      expect(result3).toBe('Common');
    });

    it('should accept params as Record<string, string | number>', () => {
      mockT.mockReturnValue('Result');

      const { t } = useTranslation();

      const stringParams: Record<string, string | number> = { key: 'value' };
      const numberParams: Record<string, string | number> = { count: 5 };
      const mixedParams: Record<string, string | number> = { name: 'John', age: 30 };

      expect(() => {
        t('key1' as any, stringParams);
        t('key2' as any, numberParams);
        t('key3' as any, mixedParams);
      }).not.toThrow();
    });
  });

  describe('Real-world usage scenarios', () => {
    it('should handle common.loading translation', () => {
      mockT.mockReturnValue('Loading...');

      const { t } = useTranslation();
      const result = t('common.loading');

      expect(result).toBe('Loading...');
    });

    it('should handle validation message with min param', () => {
      mockT.mockReturnValue('Minimum 8 characters required');

      const { t } = useTranslation();
      const result = t('validation.min', { min: 8 });

      expect(mockT).toHaveBeenCalledWith('validation.min', { min: 8 });
      expect(result).toBe('Minimum 8 characters required');
    });

    it('should handle inventory success message with product name and quantity', () => {
      mockT.mockReturnValue('5 unit(s) of Aspirin added to cart');

      const { t } = useTranslation();
      const result = t('inventory.addedToCartMessage', {
        quantity: 5,
        productName: 'Aspirin',
      });

      expect(mockT).toHaveBeenCalledWith('inventory.addedToCartMessage', {
        quantity: 5,
        productName: 'Aspirin',
      });
      expect(result).toBe('5 unit(s) of Aspirin added to cart');
    });

    it('should handle cart total items count', () => {
      mockT.mockReturnValue('5 item(s)');

      const { t } = useTranslation();
      const result = t('cart.totalItems', { count: 5 });

      expect(result).toBe('5 item(s)');
    });

    it('should handle version display', () => {
      mockT.mockReturnValue('Version 1.0.0');

      const { t } = useTranslation();
      const result = t('account.appInfo.version', { version: '1.0.0' });

      expect(result).toBe('Version 1.0.0');
    });
  });
});
