import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  locale: locale,
  messages: (await import(`./i18n/locales/${locale}.json`)).default,
  timeZone: 'Europe/Istanbul'
})); 