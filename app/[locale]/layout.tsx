import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

// Can be imported from a shared config
const locales = ['en', 'tr'];
 
export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();
 
  let messages;
  try {
    messages = (await import(`../../i18n/locales/${locale}.json`)).default;
  } catch (error) {
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
              <div className="relative min-h-screen bg-background">
                <Navbar />
                <main className="relative">{children}</main>
              </div>
              <Toaster />
            </ReactQueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 