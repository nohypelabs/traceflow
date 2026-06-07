'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const STATUS_BAR_COLORS = {
  dark: {
    themeColor: '#0B1020',
    appleStatusBar: 'black-translucent',
  },
  light: {
    themeColor: '#ffffff',
    appleStatusBar: 'default',
  },
} as const;

/**
 * Watches theme changes and syncs the mobile status bar color.
 * Updates <meta name="theme-color"> and apple-mobile-web-app-status-bar-style.
 */
function StatusBarSync() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const active = resolvedTheme ?? theme;
    const colors = active === 'dark' ? STATUS_BAR_COLORS.dark : STATUS_BAR_COLORS.light;

    // theme-color — controls Android Chrome + PWA status bar
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', colors.themeColor);

    // apple-mobile-web-app-status-bar-style — iOS PWA
    let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleMeta) {
      appleMeta = document.createElement('meta');
      appleMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      document.head.appendChild(appleMeta);
    }
    appleMeta.setAttribute('content', colors.appleStatusBar);
  }, [theme, resolvedTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch — render children only after mount
  if (!mounted) {
    return (
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    );
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <StatusBarSync />
      {children}
    </NextThemesProvider>
  );
}
