import {createTranslator} from 'next-intl';

export function getTranslations(locale: string) {
  return import(`./i18n/locales/${locale}.json`).then((module) => module.default);
} 