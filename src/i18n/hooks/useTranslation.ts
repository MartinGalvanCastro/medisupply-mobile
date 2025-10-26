import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { TranslationKeys } from '../locales';

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<TranslationKeys>;

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  return {
    t: (key: TranslationKey, params?: Record<string, string | number>) => t(key, params),
    i18n,
  };
};
