'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Layers, Maximize2, Crosshair, Target, Sidebar } from 'lucide-react';
import { api } from '@/lib/api-provider';
import { PageWrapper, CyberCard } from '@/components/ui/page-wrapper';
import { NeonButton } from '@/components/ui/page-wrapper';

const MapView = dynamic(() => import('@/components/map/map-view'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-zinc-400">
      Loading map...
    </div>
  ),
});

function formatLastSeen(lastSeenAt: Date | string | null): string {
  if (!lastSeenAt) return 'Belum ada lokasi';

  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(lastSeenAt).getTime()) / 1000),
  );

  if (elapsedSeconds < 60) return `${elapsedSeconds}s lalu`;
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m lalu`;
  if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)}j lalu`;
  return `${Math.floor(elapsedSeconds / 86400)}h lalu`;
}

export default function MapPage() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [mapResizeKey, setMapResizeKey] = useState(0);
  const [fitKey, setFitKey] = useState(0);
  const devicesQuery = api.device.list.useQuery(undefined, {
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
  const devices = devicesQuery.data ?? [];
  const onlineCount = devices.filter((device) => device.status === 'ONLINE').length;
  const locatedCount = devices.filter(
    (device) => device.lastLatitude != null && device.lastLongitude != null,
  ).length;

  const toggleSidebar = () => {
    setShowSidebar((v) => !v);
    setMapResizeKey((k) => k + 1);
  };

  const handleCenterAll = () => {
    setFitKey((k) => k + 1);
  };

  return (
    <PageWrapper
      title="Peta Live"
      subtitle="REAL-TIME POSITIONING • FLEET TRACKING"
      actions={
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:border-cyan-500/30 hover:bg-white/10 transition">
            <Layers className="h-3.5 w-3.5" /> Layers
          </button>
          <button 
            onClick={handleCenterAll}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:border-cyan-500/30 hover:bg-white/10 transition"
          >
            <Crosshair className="h-3.5 w-3.5" /> Center All
          </button>
          <NeonButton onClick={handleCenterAll}>
            <Target className="h-4 w-4 mr-1.5" /> Focus Live
          </NeonButton>
        </div>
      }
    >
      <div className="flex h-[calc(100vh-13rem)] min-h-[520px] gap-4">
        {/* Map Area */}
        <div className="flex-1 relative h-full">
          <CyberCard glow className="relative h-full overflow-hidden min-h-[520px]">
            {/* Force full height container so Leaflet map + overlays truly fill the card */}
            <div className="relative h-full w-full">
              {/* Real Leaflet + OSM Map */}
              <MapView
                devices={devices}
                resizeKey={mapResizeKey}
                fitKey={fitKey}
              />

              {/* Futuristic overlays on top of real map (tetap pertahankan vibe cyber) */}
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-950/80 backdrop-blur px-3 py-1 text-[10px] tracking-[1.5px] text-emerald-400 z-10">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE TRACKING
              </div>

              <div className="absolute top-4 right-4 flex gap-3 text-[10px] bg-zinc-950/80 backdrop-blur border border-white/10 rounded-full px-3 py-1 z-10">
                <div>{devices.length} <span className="text-zinc-500">devices</span></div>
                <div className="text-emerald-400">{onlineCount} online</div>
                <div>{locatedCount} <span className="text-zinc-500">berlokasi</span></div>
              </div>

              {devicesQuery.error && (
                <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-red-500/30 bg-red-950/90 px-3 py-2 text-xs text-red-100">
                  Gagal memuat perangkat: {devicesQuery.error.message}
                </div>
              )}

              {/* Re-open side panel when collapsed (desktop) — offset so it doesn't overlap the stats HUD */}
              {!showSidebar && (
                <button
                  onClick={toggleSidebar}
                  className="absolute top-4 right-[13rem] z-20 flex items-center gap-1.5 rounded-full border border-white/15 bg-zinc-950/80 backdrop-blur px-2.5 py-1 text-[10px] text-zinc-300 hover:border-cyan-500/40 hover:text-cyan-300 transition"
                  title="Show active devices"
                >
                  <Sidebar className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">DEVICES</span>
                </button>
              )}
            </div>
          </CyberCard>
        </div>

        {/* Side panel */}
        {showSidebar && (
          <div className="hidden w-72 lg:block h-full">
            <CyberCard className="h-full p-4 flex flex-col min-h-[520px]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-medium tracking-[2px] text-zinc-400">PERANGKAT AKTIF</div>
                <button onClick={toggleSidebar} className="text-zinc-500 hover:text-zinc-300"><Maximize2 className="h-3.5 w-3.5" /></button>
              </div>

              <div className="flex-1 space-y-2 overflow-auto pr-1 text-sm">
                {devicesQuery.isLoading ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-300">
                    Memuat perangkat...
                  </div>
                ) : devices.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-zinc-300">
                    Belum ada perangkat. Tambahkan GPS HP atau tracker dari halaman Perangkat.
                  </div>
                ) : (
                  devices.map((device) => (
                    <div key={device.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition">
                      <div className={`h-2.5 w-2.5 rounded-full ${
                        device.status === 'ONLINE'
                          ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                          : device.status === 'IDLE'
                            ? 'bg-yellow-400'
                            : 'bg-zinc-600'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2">
                          <span className="truncate">{device.name}</span>
                          <span className="shrink-0 text-[10px] text-zinc-400 tabular-nums">
                            {formatLastSeen(device.lastSeenAt)}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {device.status === 'ONLINE'
                            ? `${Math.round(device.lastSpeed ?? 0)} km/h • Online`
                            : device.status === 'IDLE'
                              ? 'Idle'
                              : 'Offline'}
                          {device.vehiclePlate ? ` • ${device.vehiclePlate}` : ''}
                        </div>
                      </div>
                      <MapPin className={`h-4 w-4 ${
                        device.lastLatitude != null && device.lastLongitude != null
                          ? 'text-cyan-300'
                          : 'text-zinc-600'
                      }`} />
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-center text-[10px] tracking-widest text-zinc-500">
                DATA LIVE • REFRESH 5 DETIK
              </div>
            </CyberCard>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
