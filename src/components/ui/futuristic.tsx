'use client';

import { useEffect, useRef } from 'react';

// Animated grid background
export function AnimatedGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Grid lines */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'gridMove 20s linear infinite',
      }} />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
    </div>
  );
}

// Neon glow effect
export function NeonGlow({ children, color = 'blue' }: { children: React.ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    blue: 'shadow-blue-500/50',
    purple: 'shadow-purple-500/50',
    cyan: 'shadow-cyan-500/50',
    green: 'shadow-green-500/50',
    red: 'shadow-red-500/50',
  };

  return (
    <div className={`relative ${colorMap[color] || colorMap.blue}`}>
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

// Animated border
export function AnimatedBorder({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-x" />
      <div className="relative bg-zinc-900 rounded-lg">
        {children}
      </div>
    </div>
  );
}

// Floating particles
export function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-blue-500/30 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

// Glitch text effect
export function GlitchText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 text-blue-500 animate-glitch-1" aria-hidden="true">
        {children}
      </span>
      <span className="absolute inset-0 text-purple-500 animate-glitch-2" aria-hidden="true">
        {children}
      </span>
    </div>
  );
}

// Holographic card
export function HolographicCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-[1px] ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 animate-holographic" />
      <div className="relative rounded-xl bg-zinc-900/90 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}

// Pulse ring
export function PulseRing({ color = 'blue' }: { color?: string }) {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
  };

  return (
    <div className="relative">
      <div className={`absolute inset-0 rounded-full border-2 ${colorMap[color]} animate-ping`} />
      <div className={`absolute inset-0 rounded-full border-2 ${colorMap[color]} animate-ping delay-75`} />
      <div className={`absolute inset-0 rounded-full border-2 ${colorMap[color]} animate-ping delay-150`} />
    </div>
  );
}
