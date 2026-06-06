'use client';

import { signOut, useSession } from 'next-auth/react';
import { Bell, LogOut, User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export function Header({ onMenuClick, isMobile }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4 dark:bg-zinc-950 md:px-6">
      <div className="flex items-center gap-3">
        {isMobile && onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h2 className="text-sm font-medium text-zinc-500">
          Pelacakan GPS Real-Time
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{session?.user?.name ?? 'Pengguna'}</p>
            <p className="text-xs text-zinc-500">{session?.user?.role ?? 'PEMERHATI'}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title="Keluar"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
