'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Monitor,
  Map,
  Shield,
  Clock,
  Bell,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Monitor },
  { href: '/map', label: 'Peta Live', icon: Map },
  { href: '/devices', label: 'Perangkat', icon: MapPin },
  { href: '/geofences', label: 'Geofence', icon: Shield },
  { href: '/trips', label: 'Perjalanan', icon: Clock },
  { href: '/alerts', label: 'Peringatan', icon: Bell },
  { href: '/reports', label: 'Laporan', icon: FileText },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export function Sidebar({ collapsed = false, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-white dark:bg-zinc-950 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold">TraceFlow</span>
          </Link>
        ) : (
          <Link href="/" className="mx-auto">
            <MapPin className="h-6 w-6 text-blue-600" />
          </Link>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
                collapsed && 'justify-center px-2',
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse/Expand Button - Center Bottom */}
      {onToggle && (
        <div className="hidden md:flex justify-center border-t p-2">
          <button
            onClick={onToggle}
            className="flex items-center justify-center rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      {/* User info */}
      <div className="border-t p-4">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-white">
              {(session?.user?.name ?? 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name ?? 'User'}</p>
              <p className="text-xs text-zinc-500 truncate">{session?.user?.email ?? ''}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
