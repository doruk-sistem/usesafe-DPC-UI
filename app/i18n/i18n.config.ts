import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale = 'tr' }) => {
  const messages = (await import(`./locales/${locale}.json`)).default;
  return {
    locale,
    messages,
    timeZone: 'Europe/Istanbul'
  };
}); 