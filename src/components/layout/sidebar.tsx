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
  Crown,
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

const superAdminItems = [
  { href: '/roles', label: 'Kelola Role', icon: Crown },
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
        'relative flex h-screen flex-col transition-all duration-300',
        'border-r border-zinc-200 dark:border-white/[0.06]',
        'bg-white/90 dark:bg-zinc-950/80 backdrop-blur-xl',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.03] opacity-[0.01]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59,130,246,0.15) 2px, rgba(59,130,246,0.15) 4px)',
        }}
      />

      {/* Logo */}
      <div className="relative z-10 flex h-14 items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-black/20 px-4">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/10">
              <MapPin className="h-4.5 w-4.5 text-cyan-400 transition-all group-hover:text-cyan-300" />
            </div>
            <span className="font-mono text-[15px] font-semibold tracking-[3px] text-zinc-900 dark:text-white">TRACEFLOW</span>
          </Link>
        ) : (
          <Link href="/" className="mx-auto group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/10">
              <MapPin className="h-4 w-4 text-cyan-400" />
            </div>
          </Link>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/5 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex-1 space-y-1 p-2 overflow-y-auto">
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
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-cyan-300'
                  : 'text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200',
                collapsed && 'justify-center px-2',
              )}
              title={collapsed ? item.label : undefined}
            >
              {/* Active background glow */}
              {isActive && (
                <div className="absolute inset-0 rounded-lg bg-cyan-500/10 border border-cyan-500/20" style={{
                  boxShadow: 'inset 0 0 20px rgba(6, 182, 212, 0.1), 0 0 15px rgba(6, 182, 212, 0.05)',
                }} />
              )}

              <item.icon className={cn(
                'relative z-10 h-4 w-4 shrink-0 transition-colors',
                isActive ? 'text-cyan-400' : 'group-hover:text-zinc-300',
              )} />
              {!collapsed && (
                <span className="relative z-10">{item.label}</span>
              )}

              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full bg-cyan-400 dark:shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              )}
            </Link>
          );
        })}

        {/* Super Admin section */}
        {session?.user?.role === 'SUPER_ADMIN' && (
          <>
            <div className="my-2 border-t border-zinc-200 dark:border-white/[0.06]" />
            {superAdminItems.map((item) => {
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-yellow-300'
                      : 'text-yellow-600/70 dark:text-yellow-500/60 hover:text-yellow-600 dark:hover:text-yellow-400',
                    collapsed && 'justify-center px-2',
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-lg bg-yellow-500/10 border border-yellow-500/20" />
                  )}
                  <item.icon className={cn(
                    'relative z-10 h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-yellow-400' : 'group-hover:text-yellow-500',
                  )} />
                  {!collapsed && (
                    <span className="relative z-10">{item.label}</span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full bg-yellow-400" />
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Collapse/Expand */}
      {onToggle && (
        <div className="relative z-10 hidden md:flex justify-center border-t border-zinc-200 dark:border-white/[0.06] p-2">
          <button
            onClick={onToggle}
            className="flex items-center justify-center rounded-lg p-2 text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-colors"
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
      <div className="relative z-10 border-t border-zinc-200 dark:border-white/[0.06] p-4">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0"
            style={{ boxShadow: '0 0 12px rgba(6, 182, 212, 0.3)' }}
          >
            <span className="text-sm font-medium text-white">
              {(session?.user?.name ?? 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{session?.user?.name ?? 'User'}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-600 truncate">{session?.user?.email ?? ''}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
