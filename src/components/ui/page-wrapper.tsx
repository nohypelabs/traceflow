'use client';

import { FadeIn } from '@/components/ui/animation';
import type { ReactNode } from 'react';

/**
 * Futuristic page wrapper with consistent styling.
 * All dashboard sub-pages use this.
 */
export function PageWrapper({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <FadeIn className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-xs text-zinc-600 tracking-wider uppercase">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Page content */}
      {children}
    </FadeIn>
  );
}

/**
 * Futuristic card container — glassmorphism with subtle border glow.
 */
export function CyberCard({
  children,
  className = '',
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900/60 backdrop-blur-sm ${className}`}
      style={glow ? { boxShadow: '0 0 30px rgba(6, 182, 212, 0.04)' } : undefined}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * Neon stat card for dashboard metrics.
 */
export function NeonStat({
  label,
  value,
  icon,
  color = 'cyan',
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: 'cyan' | 'green' | 'red' | 'yellow' | 'purple' | 'blue';
}) {
  const colorMap = {
    cyan: { text: 'text-cyan-400', glow: 'rgba(6, 182, 212, 0.15)', border: 'border-cyan-500/20' },
    green: { text: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.15)', border: 'border-emerald-500/20' },
    red: { text: 'text-red-400', glow: 'rgba(239, 68, 68, 0.15)', border: 'border-red-500/20' },
    yellow: { text: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.15)', border: 'border-amber-500/20' },
    purple: { text: 'text-purple-400', glow: 'rgba(139, 92, 246, 0.15)', border: 'border-purple-500/20' },
    blue: { text: 'text-blue-400', glow: 'rgba(59, 130, 246, 0.15)', border: 'border-blue-500/20' },
  };

  const c = colorMap[color];

  return (
    <CyberCard glow className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-[2px]">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${c.text}`}
            style={{ textShadow: `0 0 20px ${c.glow}` }}
          >
            {value}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${c.border} bg-white/[0.02] ${c.text}`}>
          {icon}
        </div>
      </div>
    </CyberCard>
  );
}
