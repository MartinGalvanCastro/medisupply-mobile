import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, LANGUAGES } from '../config';

/**
 * Hook for managing language settings
 */
export const useLanguage = () => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language as Language;

  const changeLanguage = useCallback(
    async (language: Language) => {
      await i18n.changeLanguage(language);
    },
    [i18n]
  );

  const availableLanguages = Object.entries(LANGUAGES).map(([code, info]) => ({
    code: code as Language,
    ...info,
  }));

  return {
    currentLanguage,
    changeLanguage,
    availableLanguages,
    languages: LANGUAGES,
  };
};
