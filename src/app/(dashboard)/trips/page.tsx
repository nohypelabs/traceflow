'use client';

import { useState } from 'react';
import { api } from '@/lib/api-provider';
import { Play, Clock, MapPin, Gauge, RotateCcw, Download, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '@/components/ui/animation';
import { PageWrapper, CyberCard, NeonButton } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { exportTripsToCSV } from '@/lib/export';

const TripPlaybackMap = dynamic(() => import('@/components/map/trip-playback'), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-zinc-500">Memuat peta playback...</div>,
});

type TripItem = {
  id: string;
  distance: number | null;
  duration: number | null;
  maxSpeed: number | null;
  averageSpeed: number | null;
  startedAt: Date;
  endedAt: Date | null;
  startAddress: string | null;
  endAddress: string | null;
  device: { name: string; vehiclePlate: string | null };
};

export default function TripsPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const devicesQuery = api.device.list.useQuery();
  const devices = devicesQuery.data ?? [];

  const tripsQuery = api.trip.list.useQuery({
    deviceId: selectedDeviceId || undefined,
    from: new Date(dateRange.from),
    to: new Date(dateRange.to + 'T23:59:59'),
    limit: 50,
  });

  const trips: TripItem[] = (tripsQuery.data ?? []) as TripItem[];

  const handleExport = () => {
    if (trips.length === 0) return;
    exportTripsToCSV(trips);
  };

  const actions = (
    <Button
      variant="outline"
      size="default"
      onClick={handleExport}
      disabled={trips.length === 0}
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
              value={selectedDeviceId}
              onChange={(e) => { setSelectedDeviceId(e.target.value); setSelectedTrip(null); }}
              className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:border-cyan-500/40 focus:outline-none transition"
            >
              <option value="">Semua Perangkat</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">DARI</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:border-cyan-500/40 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">SAMPAI</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:border-cyan-500/40 focus:outline-none transition"
            />
          </div>
        </div>
      </CyberCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Trip List */}
        <SlideUp delay={0.1}>
          <CyberCard>
            <div className="border-b border-white/10 p-4 text-sm font-medium tracking-wider text-zinc-400">
              PERJALANAN
              {!tripsQuery.isLoading && (
                <span className="ml-2 text-xs text-zinc-600">({trips.length} trip)</span>
              )}
            </div>
            <div className="max-h-[58vh] overflow-y-auto">
              {tripsQuery.isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
                </div>
              ) : trips.length > 0 ? (
                <div className="divide-y divide-white/5">
                  <StaggerContainer>
                    {trips.map((trip) => (
                      <StaggerItem key={trip.id}>
                        <TripRow
                          trip={trip}
                          isSelected={selectedTrip?.id === trip.id}
                          onClick={() => setSelectedTrip(trip)}
                        />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center text-center text-zinc-500">
                  <Clock className="mb-2 h-8 w-8" />
                  <div className="text-sm">
                    {selectedDeviceId ? 'Tidak ada perjalanan untuk perangkat ini' : 'Belum ada perjalanan tercatat'}
                  </div>
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

function TripRow({ trip, isSelected, onClick }: { trip: TripItem; isSelected: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} className={`cursor-pointer p-4 transition hover:bg-white/5 ${isSelected ? 'bg-cyan-500/10' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{trip.device?.name ?? 'Perangkat'}</div>
          <div className="text-xs text-zinc-400">{new Date(trip.startedAt).toLocaleString('id-ID')}</div>
        </div>
        <div className="text-right text-sm">
          <div className="font-medium tabular-nums">{trip.distance ? `${(trip.distance / 1000).toFixed(1)} km` : '—'}</div>
          <div className="text-xs text-zinc-400">{trip.duration ? `${Math.round(trip.duration / 60)} mnt` : '—'}</div>
        </div>
      </div>
      {trip.startAddress && <div className="mt-1 text-xs text-zinc-500 line-clamp-1">{trip.startAddress}</div>}
    </div>
  );
}

function TripPlayback({ trip }: { trip: TripItem }) {
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

      {/* Playback controls */}
      <div className="border-b border-white/10 bg-zinc-950/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="border-white/10 flex-shrink-0 h-8 w-8 p-0 flex items-center justify-center"
          >
            {isPlaying ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="flex-1 flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="flex-1 accent-cyan-400"
            />
            <span className="w-12 text-right text-xs tabular-nums text-zinc-400 font-mono">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {locations && locations.length > 0 ? (
          <TripPlaybackMap locations={locations} progress={progress} onProgressChange={setProgress} />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-500">Tidak ada data lokasi</div>
        )}
      </div>
    </div>
  );
}
