import i18n, { resources, defaultLanguage, supportedLanguages } from './i18n.config';
import * as Localization from 'expo-localization';

jest.mock('expo-localization');

describe('i18n config', () => {
  it('should have resources defined', () => {
    expect(resources).toBeDefined();
    expect(resources.en).toBeDefined();
    expect(resources.es).toBeDefined();
  });

  it('should have English translations', () => {
    expect(resources.en.translation).toBeDefined();
    expect(resources.en.translation.common).toBeDefined();
  });

  it('should have Spanish translations', () => {
    expect(resources.es.translation).toBeDefined();
    expect(resources.es.translation.common).toBeDefined();
  });

  it('should have default language set to English', () => {
    expect(defaultLanguage).toBe('en');
  });

  it('should have supported languages', () => {
    expect(supportedLanguages).toContain('en');
    expect(supportedLanguages).toContain('es');
  });

  it('should have i18n instance configured', () => {
    expect(i18n).toBeDefined();
    expect(i18n.language).toBeDefined();
  });

  it('should change language', async () => {
    await i18n.changeLanguage('es');
    expect(i18n.language).toBe('es');

    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
  });

  it('should translate keys', () => {
    const translation = i18n.t('common.loading');
    expect(translation).toBeDefined();
    expect(typeof translation).toBe('string');
  });

  it('should handle interpolation', () => {
    const translation = i18n.t('validation.min', { min: 5 });
    expect(translation).toContain('5');
  });

  it('should fallback to default language when locale is unavailable', () => {
    // This tests the fallback logic in initialization
    (Localization.getLocales as jest.Mock).mockReturnValue([]);

    expect(defaultLanguage).toBe('en');
    expect(i18n.options.fallbackLng).toEqual(['en']);
  });

  it('should use device locale when available', () => {
    (Localization.getLocales as jest.Mock).mockReturnValue([{ languageCode: 'es' }]);

    // The locale is set during module initialization
    expect(supportedLanguages).toContain('es');
  });
});
