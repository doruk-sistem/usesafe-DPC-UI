import {getRequestConfig} from 'next-intl/server';

const locales = ['en', 'tr'];

export default getRequestConfig(async ({locale}) => {
  if (!locale || !locales.includes(locale)) {
    locale = 'tr';
  }

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
    timeZone: 'Europe/Istanbul'
  };
}); 