'use client';

import { useState } from 'react';
import { MapPin, Layers, Maximize2, Crosshair, Target } from 'lucide-react';
import { PageWrapper, CyberCard } from '@/components/ui/page-wrapper';
import { NeonButton } from '@/components/ui/page-wrapper';

export default function MapPage() {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <PageWrapper
      title="Peta Live"
      subtitle="REAL-TIME POSITIONING • FLEET TRACKING"
      actions={
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:border-cyan-500/30 hover:bg-white/10 transition">
            <Layers className="h-3.5 w-3.5" /> Layers
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:border-cyan-500/30 hover:bg-white/10 transition">
            <Crosshair className="h-3.5 w-3.5" /> Center All
          </button>
          <NeonButton onClick={() => {}}>
            <Target className="h-4 w-4 mr-1.5" /> Focus Live
          </NeonButton>
        </div>
      }
    >
      <div className="flex h-[calc(100vh-11rem)] gap-4">
        {/* Map Area */}
        <div className="flex-1">
          <CyberCard glow className="relative h-full overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(6,182,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.06) 1px, transparent 1px)`,
              backgroundSize: '42px 42px',
            }} />

            {/* Center HUD */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="h-28 w-28 rounded-full border border-cyan-500/30 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full border border-cyan-500/40 flex items-center justify-center">
                    <MapPin className="h-7 w-7 text-cyan-400/60" />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-ping" />
              </div>
            </div>

            {/* Live badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-950/80 backdrop-blur px-3 py-1 text-[10px] tracking-[1.5px] text-emerald-400">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE TRACKING
            </div>

            {/* Mock live stats strip for demo */}
            <div className="absolute top-4 right-4 flex gap-3 text-[10px] bg-zinc-950/80 backdrop-blur border border-white/10 rounded-full px-3 py-1">
              <div>28 <span className="text-zinc-500">devices</span></div>
              <div className="text-emerald-400">21 online</div>
              <div>253.7 <span className="text-zinc-500">km today</span></div>
            </div>

            {/* Placeholder notice */}
            <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-[10px] text-zinc-500 backdrop-blur">
              LEAFLET MAP — INTEGRASI AKTIF DI KOMPONEN map-view.tsx
            </div>

            {/* Future: real <MapView /> component goes here */}
          </CyberCard>
        </div>

        {/* Side panel */}
        {showSidebar && (
          <div className="hidden w-72 lg:block">
            <CyberCard className="h-full p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-medium tracking-[2px] text-zinc-400">PERANGKAT AKTIF</div>
                <button onClick={() => setShowSidebar(false)} className="text-zinc-500 hover:text-zinc-300"><Maximize2 className="h-3.5 w-3.5" /></button>
              </div>

              <div className="flex-1 space-y-2 overflow-auto pr-1 text-sm">
                {[
                  { name: 'Truk Armada-07', speed: '48', status: 'Online', last: '12s ago' },
                  { name: 'Mobil Ops #12', speed: '62', status: 'Online', last: '8s ago' },
                  { name: 'Motor Kurir-03', speed: '31', status: 'Online', last: '3s ago' },
                  { name: 'Van Logistik-09', speed: '0', status: 'Idle', last: '4m ago' },
                  { name: 'Truk B-15', speed: '0', status: 'Offline', last: '47m ago' },
                  { name: 'Mobil #5', speed: '55', status: 'Online', last: '19s ago' },
                  { name: 'Truk C-22', speed: '0', status: 'Idle', last: '11m ago' },
                ].map((dev, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition cursor-pointer">
                    <div className={`h-2.5 w-2.5 rounded-full ${dev.status === 'Online' ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : dev.status === 'Idle' ? 'bg-yellow-400' : 'bg-zinc-600'}`} />
                    <div className="flex-1 truncate">
                      <div className="flex justify-between">
                        <span>{dev.name}</span>
                        <span className="text-[10px] text-zinc-500 tabular-nums">{dev.last}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {dev.status === 'Online' ? `${dev.speed} km/h • ${dev.status}` : dev.status}
                      </div>
                    </div>
                    <MapPin className="h-4 w-4 text-cyan-400/50" />
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-center text-[10px] tracking-widest text-zinc-500">
                DATA REAL-TIME VIA SOCKET
              </div>
            </CyberCard>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
