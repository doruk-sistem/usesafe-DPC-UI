import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Navbar } from "@/components/layout/navbar";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

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
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
          <ReactQueryProvider>
            <div className="relative min-h-screen bg-background">
              <Navbar />
              <main className="relative">{children}</main>
            </div>
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
