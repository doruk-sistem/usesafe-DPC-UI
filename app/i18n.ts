import { getRequestConfig } from 'next-intl/server';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { notFound } from 'next/navigation';

export const locales = ['en', 'tr'];
export const defaultLocale = 'tr';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./i18n/locales/${locale}.json`)).default,
  };
});

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });

export async function getMessages(locale?: string) {
  try {
    const messages = (await import(`./i18n/locales/${locale || defaultLocale}.json`)).default;
    return messages;
  } catch (error) {
    console.error('Error loading messages:', error);
    return {};
  }
} 