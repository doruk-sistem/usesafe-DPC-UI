import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from 'next/headers';
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from 'next-intl';

import ReactQueryProvider from "@/components/providers/react-query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UseSafe - Digital Product Certification",
  description: "Secure and sustainable product certification for the digital age",
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    title: 'UseSafe',
    capable: true,
    statusBarStyle: 'default',
  },
  other: {
    'msapplication-TileColor': '#ffffff',
    'theme-color': '#ffffff',
  },
};

// Can be imported from a shared config
const locales = ['en', 'tr'];

export function generateStaticParams() {
  return [{ locale: 'tr' }, { locale: 'en' }];
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = headersList.get('x-next-locale') || 'tr';
  
  // Validate that the incoming locale is valid
  if (!locales.includes(locale as string)) notFound();
  
  let messages;
  try {
    messages = (await import(`./i18n/locales/${locale}.json`)).default;
  } catch (error) {
    console.error('Failed to load messages:', error);
    notFound();
  }
 
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta httpEquiv="Permissions-Policy" content="camera=*" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ReactQueryProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </ReactQueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}