import React, { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';
import { I18nProviderProps } from './types';

/**
 * I18n Provider wrapper
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize i18n
    console.log('i18n initialized with language:', i18n.language);
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
