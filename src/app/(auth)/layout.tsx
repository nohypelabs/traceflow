'use client';

import { MapPin } from 'lucide-react';
import { GpsNetworkBackground } from '@/components/ui/gps-network-bg';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070f] text-white">
      {/* Full-bleed animated GPS network background (same as dashboard) */}
      <GpsNetworkBackground />

      {/* Top branding / system status bar */}
      <div className="relative z-20 flex items-center justify-between border-b border-white/10 bg-black/30 px-6 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
            <MapPin className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="font-mono text-[15px] font-semibold tracking-[3px] text-white">TRACEFLOW</div>
            <div className="text-[9px] text-cyan-400/70 -mt-0.5 tracking-[2px]">GPS TRACKING</div>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.015] px-3 py-1 text-[10px] uppercase tracking-[2.5px] text-emerald-400/90 sm:flex">
          <div className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
          SECURE • LIVE NETWORK
        </div>
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex min-h-[calc(100vh-110px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </div>

      {/* Bottom system footer */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/30 py-2.5 backdrop-blur-xl">
        <p className="text-center font-mono text-[9px] tracking-[3px] text-zinc-500">
          REAL-TIME POSITIONING SYSTEM • v2.4.1 • ENCRYPTED
        </p>
      </div>
    </div>
  );
}
