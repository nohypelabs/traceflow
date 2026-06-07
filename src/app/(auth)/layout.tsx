'use client';

import { MapPin, Sun, Moon } from 'lucide-react';
import { GpsNetworkBackground } from '@/components/ui/gps-network-bg';
import { useTheme } from 'next-themes';

const CLIENT_NAME = 'Mas Adwan';

function AuthThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="rounded-lg p-2 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070f] dark:bg-[#05070f] bg-white text-white dark:text-white text-zinc-900 flex flex-col">
      {/* Full-bleed animated GPS network background (same as dashboard) */}
      <GpsNetworkBackground />

      {/* Top branding / system status bar */}
      <div className="relative z-20 flex items-center justify-between border-b border-white/10 dark:border-white/10 border-zinc-200 bg-black/30 dark:bg-black/30 bg-white/80 px-6 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
            <MapPin className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="font-mono text-[15px] font-semibold tracking-[3px] text-white dark:text-white text-zinc-900">TRACEFLOW</div>
            <div className="text-[9px] text-cyan-400/70 -mt-0.5 tracking-[2px]">GPS TRACKING</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 dark:border-white/10 border-zinc-200 bg-white/[0.015] dark:bg-white/[0.015] bg-zinc-100 px-3 py-1 text-[10px] uppercase tracking-[2.5px] text-emerald-400/90 sm:flex">
            <div className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
            SECURE • LIVE NETWORK
          </div>
          <AuthThemeToggle />
        </div>
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </div>

      {/* Dashboard-style Footer */}
      <footer className="relative z-20 border-t border-white/[0.04] dark:border-white/[0.04] border-zinc-200 bg-zinc-950/60 dark:bg-zinc-950/60 bg-zinc-50/80 backdrop-blur-sm px-6 py-3">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />

        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          {/* Left — client + dev branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500/60" style={{ boxShadow: '0 0 6px rgba(6,182,212,0.4)' }} />
              <span className="font-mono text-[11px] font-semibold tracking-[3px] text-zinc-400">
                NOHYPE
              </span>
            </div>
            <div className="h-3 w-px bg-white/[0.06]" />
            <span className="text-[10px] text-zinc-500 tracking-wider">
              Built for <span className="text-zinc-300">{CLIENT_NAME}</span>
            </span>
          </div>

          {/* Center — system status */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-[2px] text-zinc-700">
              <div className="h-1 w-1 rounded-full bg-emerald-500/50 animate-pulse" />
              SYSTEM OPERATIONAL
            </div>
            <div className="h-3 w-px bg-white/[0.04]" />
            <span className="text-[9px] font-mono tracking-[2px] text-zinc-700">
              TRACEFLOW v1.0.0
            </span>
          </div>

          {/* Right — copyright */}
          <div className="text-[10px] text-zinc-700 tracking-wider">
            © 2026 <span className="text-zinc-500">NoHype</span> — All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
