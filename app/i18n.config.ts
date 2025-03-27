import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale = 'tr' }) => {
  const messages = (await import(`./i18n/locales/${locale}.json`)).default;
  return {
    locale,
    messages,
    timeZone: 'Europe/Istanbul'
  };
}); 