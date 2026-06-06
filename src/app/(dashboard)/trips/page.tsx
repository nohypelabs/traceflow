'use client';

import { useState } from 'react';
import { api } from '@/lib/api-provider';
import { Play, Clock, MapPin, Gauge, RotateCcw, Download } from 'lucide-react';
import dynamic from 'next/dynamic';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '@/components/ui/animation';
import { PageWrapper, CyberCard, NeonButton } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import type { TripWithDevice } from '@/types';
import { exportTripsToCSV } from '@/lib/export';

const TripPlaybackMap = dynamic(() => import('@/components/map/trip-playback'), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-zinc-500">Memuat peta playback...</div>,
});

export default function TripsPage() {
  const { data: devices } = api.device.list.useQuery();
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedTrip, setSelectedTrip] = useState<TripWithDevice | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const { data: trips, isLoading } = api.trip.list.useQuery(
    { deviceId: selectedDevice, from: new Date(dateRange.from), to: new Date(dateRange.to) },
    { enabled: !!selectedDevice }
  );

  const actions = (
    <Button
      variant="outline"
      size="default"
      onClick={() => trips && exportTripsToCSV(trips)}
      disabled={!trips || trips.length === 0}
      className="border-white/15 bg-white/5"
    >
      <Download className="h-4 w-4 md:mr-2" />
      <span className="hidden md:inline">Export CSV</span>
    </Button>
  );

  return (
    <PageWrapper title="Riwayat Perjalanan" subtitle="TRIP HISTORY • PLAYBACK & ANALYSIS" actions={actions}>
      {/* Filters */}
      <CyberCard className="p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">PERANGKAT</label>
            <select
              value={selectedDevice}
              onChange={(e) => { setSelectedDevice(e.target.value); setSelectedTrip(null); }}
              className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm"
            >
              <option value="">Pilih perangkat</option>
              {devices?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">DARI</label>
            <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">SAMPAI</label>
            <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm" />
          </div>
        </div>
      </CyberCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Trip List */}
        <SlideUp delay={0.1}>
          <CyberCard>
            <div className="border-b border-white/10 p-4 text-sm font-medium tracking-wider text-zinc-400">PERJALANAN</div>
            <div className="max-h-[58vh] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
              ) : trips && trips.length > 0 ? (
                <div className="divide-y divide-white/5">
                  <StaggerContainer>
                    {trips.map((trip) => (
                      <StaggerItem key={trip.id}>
                        <TripRow trip={trip} isSelected={selectedTrip?.id === trip.id} onClick={() => setSelectedTrip(trip)} />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center text-center text-zinc-500">
                  <Clock className="mb-2 h-8 w-8" />
                  {selectedDevice ? 'Tidak ada perjalanan di rentang ini' : 'Pilih perangkat untuk melihat riwayat'}
                </div>
              )}
            </div>
          </CyberCard>
        </SlideUp>

        {/* Playback */}
        <SlideUp delay={0.2}>
          <CyberCard className="flex h-full flex-col">
            <div className="border-b border-white/10 p-4 text-sm font-medium tracking-wider text-zinc-400">PUTAR ULANG</div>
            {selectedTrip ? (
              <TripPlayback trip={selectedTrip} />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center text-zinc-500">
                <Play className="mb-2 h-9 w-9" />
                Pilih perjalanan untuk memutar ulang rute di peta
              </div>
            )}
          </CyberCard>
        </SlideUp>
      </div>
    </PageWrapper>
  );
}

function TripRow({ trip, isSelected, onClick }: any) {
  return (
    <div onClick={onClick} className={`cursor-pointer p-4 transition hover:bg-white/5 ${isSelected ? 'bg-cyan-500/10' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{trip.device?.name ?? 'Perangkat'}</div>
          <div className="text-xs text-zinc-500">{new Date(trip.startedAt).toLocaleString('id-ID')}</div>
        </div>
        <div className="text-right text-sm">
          <div className="font-medium tabular-nums">{trip.distance ? `${(trip.distance / 1000).toFixed(1)} km` : '—'}</div>
          <div className="text-xs text-zinc-500">{trip.duration ? `${Math.round(trip.duration / 60)} mnt` : '—'}</div>
        </div>
      </div>
      {trip.startAddress && <div className="mt-1 text-xs text-zinc-500 line-clamp-1">{trip.startAddress}</div>}
    </div>
  );
}

function TripPlayback({ trip }: { trip: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const { data: locations } = api.location.getByTrip.useQuery({ tripId: trip.id }, { enabled: !!trip.id });

  const stats = {
    distance: trip.distance ? (trip.distance / 1000).toFixed(1) : '0',
    duration: trip.duration ? Math.round(trip.duration / 60) : 0,
    maxSpeed: trip.maxSpeed ? Math.round(trip.maxSpeed) : 0,
    avgSpeed: trip.averageSpeed ? Math.round(trip.averageSpeed) : 0,
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Stats row */}
      <div className="grid grid-cols-4 border-b border-white/10 p-4 text-center text-xs">
        <div><div className="font-mono text-xl font-semibold text-cyan-400">{stats.distance}</div><div className="text-zinc-500">km</div></div>
        <div><div className="font-mono text-xl font-semibold text-cyan-400">{stats.duration}</div><div className="text-zinc-500">mnt</div></div>
        <div><div className="font-mono text-xl font-semibold text-cyan-400">{stats.maxSpeed}</div><div className="text-zinc-500">max km/j</div></div>
        <div><div className="font-mono text-xl font-semibold text-cyan-400">{stats.avgSpeed}</div><div className="text-zinc-500">rata² km/j</div></div>
      </div>

      <div className="flex-1">
        {locations && locations.length > 0 ? (
          <TripPlaybackMap locations={locations} progress={progress} onProgressChange={setProgress} />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-500">Tidak ada data lokasi</div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)} className="border-white/10">
            {isPlaying ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(parseInt(e.target.value))} className="flex-1 accent-cyan-400" />
          <span className="w-10 text-right text-xs tabular-nums text-zinc-400">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
