import {createTranslator} from 'next-intl';

export function getTranslations(locale: string) {
  return import(`@/locales/${locale}.json`).then((module) => module.default);
} 