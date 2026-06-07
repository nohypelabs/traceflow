import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { ApiProvider } from '@/lib/api-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TraceFlow — GPS Real-Time Tracking',
  description: 'Real-time GPS tracking dashboard with live map, geofencing, trip history, and alerts.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'TraceFlow',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192x192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Theme appearance="inherit" accentColor="blue" radius="medium">
            <SessionProvider>
              <ApiProvider>
                {children}
              </ApiProvider>
            </SessionProvider>
          </Theme>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
