'use client';

import { FadeIn } from '@/components/ui/animation';
import { AnimatedGrid, FloatingParticles } from '@/components/ui/futuristic';
import type { ReactNode } from 'react';

/**
 * Futuristic page wrapper — consistent mission-control shell for all dashboard pages.
 * Includes optional layered background effects.
 */
export function PageWrapper({
  title,
  subtitle,
  actions,
  children,
  showBackground = true,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  showBackground?: boolean;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {showBackground && (
        <>
          <AnimatedGrid />
          <FloatingParticles />
        </>
      )}

      <FadeIn className="relative space-y-5 md:space-y-6">
        {/* Page header — matches polished dashboard/auth style */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
              <span className="font-mono text-lg font-bold tracking-widest text-cyan-400">TF</span>
            </div>
            <div>
              <div className="text-2xl font-semibold tracking-tight text-white md:text-[26px]">{title}</div>
              {subtitle && (
                <div className="text-[10px] text-zinc-500 tracking-[1.5px] -mt-0.5">{subtitle}</div>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {/* Page content */}
        {children}
      </FadeIn>
    </div>
  );
}

/**
 * Primary holographic glass card — use for main content blocks.
 * Matches the style used in dashboard + auth.
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
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-2xl ${className}`}
    >
      {/* Holographic gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,rgba(6,182,212,0.06),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_85%,rgba(139,92,246,0.04),transparent_60%)]" />
      {/* Subtle scanlines */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_3px)]" />

      <div className={`relative h-full ${glow ? 'shadow-[0_0_40px_rgba(6,182,212,0.06)]' : ''}`}>
        {children}
      </div>
    </div>
  );
}

/**
 * Neon stat / metric card (reused pattern from polished dashboard).
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
    cyan: { text: 'text-cyan-400', accent: 'border-cyan-500/20' },
    green: { text: 'text-emerald-400', accent: 'border-emerald-500/20' },
    red: { text: 'text-red-400', accent: 'border-red-500/20' },
    yellow: { text: 'text-yellow-400', accent: 'border-yellow-500/20' },
    purple: { text: 'text-purple-400', accent: 'border-purple-500/20' },
    blue: { text: 'text-blue-400', accent: 'border-blue-500/20' },
  };

  const c = colorMap[color];

  return (
    <CyberCard className="p-4 md:p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-medium tracking-[1.5px] text-zinc-400">{label}</div>
          <div className={`mt-1 font-mono text-3xl font-semibold tracking-tighter md:text-[34px] ${c.text}`}>
            {value}
          </div>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${c.accent} bg-white/5 ${c.text}`}>
          {icon}
        </div>
      </div>
    </CyberCard>
  );
}

/**
 * Small reusable neon primary button (uses global .neon-button styles).
 */
export function NeonButton({
  children,
  onClick,
  disabled,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`neon-button group flex h-9 items-center gap-2 rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 px-4 text-sm font-medium text-white shadow-[0_0_18px_rgba(6,182,212,0.18)] transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
    </button>
  );
}
