'use client';

import { PageWrapper, CyberCard } from '@/components/ui/page-wrapper';
import { MapPin, Layers, Maximize2, Crosshair } from 'lucide-react';
import { useState } from 'react';

export default function MapPage() {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <PageWrapper
      title="Peta Live"
      subtitle="Real-time device tracking"
      actions={
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/20 transition-all">
            <Layers className="h-3.5 w-3.5" />
            Layers
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/20 transition-all">
            <Crosshair className="h-3.5 w-3.5" />
            Center
          </button>
        </div>
      }
    >
      <div className="flex gap-4 h-[calc(100vh-12rem)]">
        {/* Map container */}
        <div className="flex-1 relative">
          <CyberCard glow className="h-full overflow-hidden">
            {/* Map placeholder with futuristic overlay */}
            <div className="relative h-full bg-zinc-900 flex items-center justify-center">
              {/* Grid overlay */}
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }} />

              {/* Center crosshair */}
              <div className="relative">
                <div className="h-24 w-24 rounded-full border border-cyan-500/20 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full border border-cyan-500/30 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-cyan-500/40" />
                  </div>
                </div>
                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-ping" />
              </div>

              {/* Status badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-cyan-500/20 bg-zinc-950/80 backdrop-blur-sm px-3 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-medium text-emerald-400 tracking-wider">LIVE TRACKING</span>
              </div>

              {/* Map will be loaded here — Phase 2 */}
              <div className="absolute bottom-4 left-4 rounded-lg border border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm px-3 py-2">
                <p className="text-[10px] text-zinc-600 tracking-wider">
                  LEAFLET MAP — PHASE 2 INTEGRATION
                </p>
              </div>
            </div>
          </CyberCard>
        </div>

        {/* Device sidebar */}
        {showSidebar && (
          <div className="hidden lg:block w-72">
            <CyberCard className="h-full p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-[2px]">Perangkat</h3>
                <button onClick={() => setShowSidebar(false)} className="text-zinc-600 hover:text-zinc-400 transition">
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Placeholder device list */}
              <div className="space-y-2">
                {['Truk A', 'Mobil #5', 'Motor 12'].map((name, i) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 hover:border-cyan-500/20 hover:bg-cyan-500/[0.03] transition-all cursor-pointer"
                  >
                    <div className={`h-2 w-2 rounded-full ${i < 2 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-zinc-600'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300 truncate">{name}</p>
                      <p className="text-[10px] text-zinc-600">
                        {i < 2 ? `${12 + i * 8} km/h • Online` : 'Offline'}
                      </p>
                    </div>
                    <MapPin className="h-3.5 w-3.5 text-zinc-700" />
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 text-center">
                <p className="text-[10px] text-zinc-700 tracking-wider">DEVICE LIST — DATA FROM API</p>
              </div>
            </CyberCard>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
