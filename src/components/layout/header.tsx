'use client';

import { signOut, useSession } from 'next-auth/react';
import { Bell, LogOut, User, Wifi, WifiOff, Activity, Menu } from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import { ThemeToggle } from './theme-toggle';

interface HeaderProps {
  onToggleMobile?: () => void;
}

export function Header({ onToggleMobile }: HeaderProps) {
  const { data: session } = useSession();
  const { isConnected } = useSocket();

  return (
    <header className="relative flex h-14 items-center justify-between border-b border-white/[0.06] dark:border-white/[0.06] border-zinc-200 bg-zinc-950/60 dark:bg-zinc-950/60 bg-white/80 backdrop-blur-lg px-6">
      {/* Subtle gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        {onToggleMobile && (
          <button
            onClick={onToggleMobile}
            className="md:hidden -ml-2 rounded-lg p-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Connection status indicator */}
        <div className="flex items-center gap-2 rounded-full bg-white/[0.03] dark:bg-white/[0.03] bg-zinc-100 border border-white/[0.06] dark:border-white/[0.06] border-zinc-200 px-3 py-1">
          {isConnected ? (
            <>
              <div className="relative">
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <div className="absolute -inset-1 bg-emerald-500/20 rounded-full animate-ping opacity-30" />
              </div>
              <span className="text-xs text-emerald-400 font-medium">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-zinc-600" />
              <span className="text-xs text-zinc-600">Offline</span>
            </>
          )}
        </div>

        <div className="hidden sm:block">
          <p className="text-xs text-zinc-600">GPS Real-Time Tracking System</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Activity pulse */}
        <div className="hidden md:flex items-center gap-2 rounded-full bg-white/[0.03] dark:bg-white/[0.03] bg-zinc-100 border border-white/[0.06] dark:border-white/[0.06] border-zinc-200 px-3 py-1">
          <Activity className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
          <span className="text-xs text-zinc-500">Monitoring</span>
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center"
            style={{ boxShadow: '0 0 10px rgba(6, 182, 212, 0.15)' }}
          >
            <User className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-zinc-200">{session?.user?.name ?? 'User'}</p>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{session?.user?.role ?? 'VIEWER'}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="rounded-lg p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
