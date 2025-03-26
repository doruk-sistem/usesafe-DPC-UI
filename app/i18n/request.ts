import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => ({
  locale,
  messages: (await import(`./locales/${locale}.json`)).default,
  timeZone: 'Europe/Istanbul'
})); 