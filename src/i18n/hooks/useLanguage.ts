import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '../config';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback(
    async (language: SupportedLanguage) => {
      await i18n.changeLanguage(language);
    },
    [i18n]
  );

  return {
    currentLanguage: i18n.language as SupportedLanguage,
    changeLanguage,
  };
};
