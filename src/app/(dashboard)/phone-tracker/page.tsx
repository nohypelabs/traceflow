'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gauge,
  Loader2,
  MapPin,
  Radio,
  Smartphone,
  Square,
  Target,
} from 'lucide-react';
import { api } from '@/lib/api-provider';
import { Button } from '@/components/ui/button';
import { CyberCard, NeonButton, PageWrapper } from '@/components/ui/page-wrapper';

interface PhonePosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speedKph: number | null;
  heading: number | null;
  recordedAt: Date;
}

const selectClass =
  'futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none [color-scheme:dark] focus:border-violet-400/50';

export default function PhoneTrackerPage() {
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-violet-200" />
        </div>
      )}
    >
      <PhoneTrackerContent />
    </Suspense>
  );
}

function PhoneTrackerContent() {
  const searchParams = useSearchParams();
  const requestedDeviceId = searchParams.get('deviceId') ?? '';
  const [deviceSelection, setDeviceSelection] = useState(requestedDeviceId);
  const [isTracking, setIsTracking] = useState(false);
  const [position, setPosition] = useState<PhonePosition | null>(null);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [sentCount, setSentCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastSentAtRef = useRef(0);
  const sendingRef = useRef(false);

  const devicesQuery = api.device.list.useQuery();
  const pushMutation = api.location.pushFromPhone.useMutation();
  const compatibleDevices = useMemo(
    () => (devicesQuery.data ?? []).filter((device) => device.provider === 'MOCK'),
    [devicesQuery.data],
  );
  const selectedDeviceId =
    compatibleDevices.some((device) => device.id === deviceSelection)
      ? deviceSelection
      : compatibleDevices[0]?.id ?? '';

  useEffect(
    () => () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    },
    [],
  );

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsTracking(false);
  };

  const startTracking = () => {
    if (!selectedDeviceId) {
      setError('Pilih device GPS HP terlebih dahulu.');
      return;
    }

    if (!('geolocation' in navigator)) {
      setError('Browser HP ini tidak mendukung GPS browser.');
      return;
    }

    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setError('GPS browser hanya aktif melalui HTTPS atau localhost.');
      return;
    }

    setError(null);
    setSentCount(0);
    lastSentAtRef.current = 0;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (browserPosition) => {
        const coords = browserPosition.coords;
        const nextPosition: PhonePosition = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          altitude: coords.altitude,
          speedKph: coords.speed === null ? null : coords.speed * 3.6,
          heading: coords.heading,
          recordedAt: new Date(browserPosition.timestamp),
        };

        setPosition(nextPosition);

        const now = Date.now();
        if (sendingRef.current || now - lastSentAtRef.current < 5000) {
          return;
        }

        sendingRef.current = true;
        try {
          await pushMutation.mutateAsync({
            deviceId: selectedDeviceId,
            latitude: nextPosition.latitude,
            longitude: nextPosition.longitude,
            altitude: nextPosition.altitude,
            accuracy: nextPosition.accuracy,
            speed: nextPosition.speedKph,
            heading: nextPosition.heading,
            recordedAt: nextPosition.recordedAt,
          });

          const sentAt = new Date();
          lastSentAtRef.current = sentAt.getTime();
          setLastSentAt(sentAt);
          setSentCount((count) => count + 1);
          setError(null);
        } catch (sendError) {
          setError(
            sendError instanceof Error
              ? sendError.message
              : 'Gagal mengirim lokasi ke TraceFlow.',
          );
        } finally {
          sendingRef.current = false;
        }
      },
      (geolocationError) => {
        const message =
          geolocationError.code === geolocationError.PERMISSION_DENIED
            ? 'Izin lokasi ditolak. Aktifkan Location Permission untuk browser.'
            : geolocationError.code === geolocationError.POSITION_UNAVAILABLE
              ? 'Lokasi belum tersedia. Pastikan GPS HP aktif.'
              : 'GPS timeout. Coba pindah ke area terbuka lalu mulai lagi.';

        setError(message);

        if (geolocationError.code === geolocationError.PERMISSION_DENIED) {
          stopTracking();
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 20000,
      },
    );

    setIsTracking(true);
  };

  return (
    <PageWrapper
      title="GPS HP"
      subtitle="SMARTPHONE LOCATION • TEMPORARY TRACKER"
      actions={(
        <Link
          href="/devices"
          className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-zinc-100 transition hover:bg-white/10"
        >
          Kembali ke Perangkat
        </Link>
      )}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <CyberCard className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10">
                <Smartphone className="h-5 w-5 text-violet-200" />
              </div>
              <div>
                <h2 className="font-medium text-white">Jadikan HP sebagai GPS tracker</h2>
                <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                  Pilih device, izinkan akses lokasi, lalu biarkan halaman tetap terbuka.
                  Lokasi dikirim ke pipeline TraceFlow setiap maksimal 5 detik.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-[10px] tracking-[1.5px] text-zinc-300">
                DEVICE GPS HP / MOCK
              </label>
              <select
                value={selectedDeviceId}
                disabled={isTracking || devicesQuery.isLoading}
                onChange={(event) => setDeviceSelection(event.target.value)}
                className={selectClass}
              >
                {compatibleDevices.length === 0 && (
                  <option className="bg-zinc-950 text-white" value="">
                    Belum ada device GPS HP
                  </option>
                )}
                {compatibleDevices.map((device) => (
                  <option
                    key={device.id}
                    className="bg-zinc-950 text-white"
                    value={device.id}
                  >
                    {device.name} ({device.imei})
                  </option>
                ))}
              </select>
            </div>

            {compatibleDevices.length === 0 && !devicesQuery.isLoading && (
              <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-950/25 p-4 text-sm text-amber-100">
                Buat perangkat baru dengan metode <strong>GPS HP</strong> terlebih dahulu.
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              {isTracking ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={stopTracking}
                  className="border-red-400/30 bg-red-500/10 text-red-100 hover:bg-red-500/20"
                >
                  <Square className="h-4 w-4" />
                  Stop Tracking
                </Button>
              ) : (
                <NeonButton
                  type="button"
                  disabled={!selectedDeviceId || devicesQuery.isLoading}
                  onClick={startTracking}
                >
                  <Radio className="h-4 w-4" />
                  Mulai Tracking
                </NeonButton>
              )}

              <div className="flex items-center gap-2 text-xs text-zinc-300">
                {pushMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isTracking ? 'GPS aktif, halaman harus tetap terbuka' : 'GPS belum aktif'}
              </div>
            </div>
          </CyberCard>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={<MapPin className="h-4 w-4" />}
              label="Latitude"
              value={position ? position.latitude.toFixed(6) : '—'}
            />
            <MetricCard
              icon={<MapPin className="h-4 w-4" />}
              label="Longitude"
              value={position ? position.longitude.toFixed(6) : '—'}
            />
            <MetricCard
              icon={<Target className="h-4 w-4" />}
              label="Akurasi"
              value={position ? `±${Math.round(position.accuracy)} m` : '—'}
            />
            <MetricCard
              icon={<Gauge className="h-4 w-4" />}
              label="Kecepatan"
              value={
                position?.speedKph === null || position?.speedKph === undefined
                  ? '—'
                  : `${position.speedKph.toFixed(1)} km/h`
              }
            />
          </div>
        </div>

        <div className="space-y-5">
          <CyberCard className="p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              {isTracking
                ? <Radio className="h-4 w-4 animate-pulse text-emerald-300" />
                : <Smartphone className="h-4 w-4 text-zinc-300" />}
              Status Pengiriman
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <StatusRow
                label="Tracker"
                value={isTracking ? 'Aktif' : 'Berhenti'}
                active={isTracking}
              />
              <StatusRow label="Titik terkirim" value={String(sentCount)} />
              <StatusRow
                label="Terakhir kirim"
                value={lastSentAt ? lastSentAt.toLocaleTimeString('id-ID') : 'Belum ada'}
              />
              <StatusRow
                label="Server"
                value={pushMutation.error ? 'Gagal' : sentCount > 0 ? 'Terhubung' : 'Menunggu'}
                active={sentCount > 0 && !pushMutation.error}
              />
            </div>
          </CyberCard>

          <CyberCard className="border-cyan-500/20 bg-cyan-950/15 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-cyan-100">
              <CheckCircle2 className="h-4 w-4" />
              Cara tes
            </div>
            <ol className="mt-3 space-y-2 text-xs leading-relaxed text-cyan-50/80">
              <li>1. Buka deployment HTTPS TraceFlow dari HP.</li>
              <li>2. Login menggunakan akun dashboard.</li>
              <li>3. Pilih device GPS HP dan tekan Mulai Tracking.</li>
              <li>4. Izinkan lokasi presisi, lalu cek halaman Peta Live.</li>
            </ol>
          </CyberCard>

          <CyberCard className="border-amber-500/20 bg-amber-950/15 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-100">
              <Clock3 className="h-4 w-4" />
              Batas browser
            </div>
            <p className="mt-2 text-xs leading-relaxed text-amber-50/75">
              Browser HP dapat menghentikan GPS saat layar terkunci, tab ditutup, atau mode hemat
              baterai aktif. Ini cocok untuk testing, bukan pengganti tracker background permanen.
            </p>
          </CyberCard>
        </div>
      </div>
    </PageWrapper>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <CyberCard className="p-4">
      <div className="flex items-center gap-2 text-xs text-zinc-300">
        <span className="text-violet-200">{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-mono text-lg text-white">{value}</div>
    </CyberCard>
  );
}

function StatusRow({
  label,
  value,
  active = false,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="text-zinc-300">{label}</span>
      <span className={active ? 'text-emerald-300' : 'text-zinc-100'}>{value}</span>
    </div>
  );
}
