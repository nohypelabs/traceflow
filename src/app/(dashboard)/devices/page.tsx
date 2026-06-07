'use client';

import type { Device } from '@/types';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-provider';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FlaskConical,
  Loader2,
  Plus,
  Radio,
  Send,
  Smartphone,
  Trash2,
  Webhook,
  Wifi,
} from 'lucide-react';
import { SlideUp, AnimatedPresence } from '@/components/ui/animation';
import { DeviceStatusBadge } from '@/components/ui/radix';
import { PageWrapper, CyberCard, NeonButton } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { exportDevicesToCSV } from '@/lib/export';

type IntegrationMethod =
  | 'TRACKER_WEBHOOK'
  | 'API_PUSH'
  | 'PHONE_GPS'
  | 'MOCK';
type GpsProvider = 'TELTONIKA' | 'QUECLINK' | 'CONCOX' | 'MOCK';
type VehicleType = 'CAR' | 'TRUCK' | 'MOTORCYCLE' | 'VAN' | 'BUS' | 'OTHER';

interface CreateDeviceInput {
  name: string;
  imei: string;
  provider: GpsProvider;
  vehiclePlate?: string;
  vehicleType?: VehicleType;
  providerConfig: {
    integrationMode: IntegrationMethod;
    webhookFormat: 'PROVIDER_NATIVE' | 'TRACEFLOW_JSON';
    externalDeviceId: string;
  };
}

interface CreatedIntegration {
  deviceId: string;
  name: string;
  identifier: string;
  provider: GpsProvider;
  method: IntegrationMethod;
}

const inputClass =
  'futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400/50';
const selectClass = `${inputClass} [color-scheme:dark]`;
const optionClass = 'bg-zinc-950 text-white';

export default function DevicesPage() {
  const utils = api.useUtils();
  const [showCreate, setShowCreate] = useState(false);
  const [createdIntegration, setCreatedIntegration] = useState<CreatedIntegration | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const devicesQuery = api.device.list.useQuery();
  const sessionQuery = api.auth.getSession.useQuery();
  const canManage =
    sessionQuery.data?.user.role === 'ADMIN'
    || sessionQuery.data?.user.role === 'MANAGER';

  const createMutation = api.device.create.useMutation({
    onSuccess: async (device, variables) => {
      await utils.device.list.invalidate();
      setCreatedIntegration({
        deviceId: device.id,
        name: device.name,
        identifier: device.imei,
        provider: device.provider,
        method: variables.providerConfig?.integrationMode ?? 'TRACKER_WEBHOOK',
      });
      setShowCreate(false);
    },
  });

  const deleteMutation = api.device.delete.useMutation({
    onSuccess: async () => {
      await utils.device.list.invalidate();
      setDeletingId(null);
    },
    onError: () => setDeletingId(null),
  });

  const devices = devicesQuery.data ?? [];

  const handleDelete = (device: Device) => {
    if (!window.confirm(`Hapus perangkat "${device.name}"? Riwayat lokasi juga akan terhapus.`)) {
      return;
    }

    setDeletingId(device.id);
    deleteMutation.mutate({ id: device.id });
  };

  const primaryAction = (
    <div className="flex gap-2">
      <Link
        href="/phone-tracker"
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 text-sm font-medium text-violet-100 transition hover:bg-violet-500/20"
      >
        <Smartphone className="h-4 w-4" />
        <span className="hidden md:inline">Tes GPS HP</span>
      </Link>
      <Button
        variant="outline"
        size="default"
        onClick={() => exportDevicesToCSV(devices)}
        disabled={devices.length === 0}
        className="border-white/15 bg-white/5 hover:bg-white/10"
      >
        <Download className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">Export CSV</span>
      </Button>
      {canManage && (
        <NeonButton onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 md:mr-2" />
          <span>Tambah Perangkat</span>
        </NeonButton>
      )}
    </div>
  );

  return (
    <PageWrapper
      title="Perangkat"
      subtitle="MANAGE GPS TRACKERS • LIVE STATUS"
      actions={primaryAction}
    >
      {!sessionQuery.isLoading && !canManage && (
        <CyberCard className="mb-4 border-amber-500/20 bg-amber-950/20 p-4 text-sm text-amber-100">
          Akun Viewer dapat melihat perangkat, tetapi penambahan dan penghapusan membutuhkan role Manager atau Admin.
        </CyberCard>
      )}

      <AnimatedPresence show={showCreate}>
        <CreateDeviceForm
          isPending={createMutation.isPending}
          error={createMutation.error?.message}
          onClose={() => {
            createMutation.reset();
            setShowCreate(false);
          }}
          onCreate={(input) => createMutation.mutate(input)}
        />
      </AnimatedPresence>

      {createdIntegration && (
        <IntegrationGuide
          integration={createdIntegration}
          onClose={() => setCreatedIntegration(null)}
        />
      )}

      {devicesQuery.isLoading ? (
        <CyberCard className="flex min-h-48 items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-300" />
        </CyberCard>
      ) : devicesQuery.error ? (
        <CyberCard className="border-red-500/30 bg-red-950/30 p-6 text-red-200">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            Gagal memuat perangkat
          </div>
          <p className="mt-2 text-sm text-red-200/80">{devicesQuery.error.message}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 border-red-400/30"
            onClick={() => devicesQuery.refetch()}
          >
            Coba Lagi
          </Button>
        </CyberCard>
      ) : devices.length > 0 ? (
        <>
          <div className="space-y-3 md:hidden">
            {devices.map((device) => (
              <MobileDeviceCard
                key={device.id}
                device={device}
                canManage={canManage}
                isDeleting={deletingId === device.id}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <CyberCard className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.015] text-left text-xs uppercase tracking-[1.5px] text-zinc-300">
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Nama</th>
                    <th className="px-5 py-3.5">IMEI / Device ID</th>
                    <th className="px-5 py-3.5">Provider</th>
                    <th className="px-5 py-3.5">Kendaraan</th>
                    <th className="px-5 py-3.5">Terakhir Dilihat</th>
                    {canManage && <th className="px-5 py-3.5 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {devices.map((device) => (
                    <DesktopDeviceRow
                      key={device.id}
                      device={device}
                      canManage={canManage}
                      isDeleting={deletingId === device.id}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CyberCard>
        </>
      ) : (
        <CyberCard className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Wifi className="h-8 w-8 text-cyan-300/70" />
          </div>
          <div className="text-lg font-medium">Belum ada perangkat</div>
          <p className="mt-1 text-sm text-zinc-300">
            Tambahkan tracker GPS atau integrasi API pertama untuk mulai monitoring.
          </p>
          {canManage && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-500/20"
            >
              <Plus className="h-4 w-4" /> Tambah Perangkat Pertama
            </button>
          )}
        </CyberCard>
      )}
    </PageWrapper>
  );
}

function MobileDeviceCard({
  device,
  canManage,
  isDeleting,
  onDelete,
}: {
  device: Device;
  canManage: boolean;
  isDeleting: boolean;
  onDelete: (device: Device) => void;
}) {
  return (
    <CyberCard className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <DeviceStatusBadge status={device.status} />
          <div>
            <div className="font-medium">{device.name}</div>
            <div className="font-mono text-xs text-zinc-300">{device.imei}</div>
            <div className="mt-1 text-[10px] tracking-wider text-cyan-300">{device.provider}</div>
            {device.vehiclePlate && (
              <div className="mt-1 inline-block rounded bg-white/5 px-2 py-0.5 text-[10px] text-zinc-300">
                {device.vehiclePlate}
              </div>
            )}
          </div>
        </div>
        {canManage && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            onClick={() => onDelete(device)}
          >
            {isDeleting
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Trash2 className="h-3.5 w-3.5 text-red-400" />}
          </Button>
        )}
      </div>
      <div className="mt-3 text-xs text-zinc-300">
        {device.lastSeenAt ? device.lastSeenAt.toLocaleString('id-ID') : 'Belum pernah mengirim lokasi'}
      </div>
    </CyberCard>
  );
}

function DesktopDeviceRow({
  device,
  canManage,
  isDeleting,
  onDelete,
}: {
  device: Device;
  canManage: boolean;
  isDeleting: boolean;
  onDelete: (device: Device) => void;
}) {
  return (
    <tr className="transition-colors hover:bg-white/5">
      <td className="px-5 py-3.5"><DeviceStatusBadge status={device.status} /></td>
      <td className="px-5 py-3.5 font-medium">{device.name}</td>
      <td className="px-5 py-3.5 font-mono text-xs text-zinc-300">{device.imei}</td>
      <td className="px-5 py-3.5 text-xs text-cyan-300">{device.provider}</td>
      <td className="px-5 py-3.5">
        {device.vehiclePlate ? (
          <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-zinc-200">
            {device.vehiclePlate}
          </span>
        ) : '—'}
      </td>
      <td className="px-5 py-3.5 text-xs text-zinc-300">
        {device.lastSeenAt ? device.lastSeenAt.toLocaleString('id-ID') : '—'}
      </td>
      {canManage && (
        <td className="px-5 py-3.5">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-white/10"
              disabled={isDeleting}
              onClick={() => onDelete(device)}
            >
              {isDeleting
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Trash2 className="h-3.5 w-3.5 text-red-400" />}
            </Button>
          </div>
        </td>
      )}
    </tr>
  );
}

function CreateDeviceForm({
  isPending,
  error,
  onClose,
  onCreate,
}: {
  isPending: boolean;
  error?: string;
  onClose: () => void;
  onCreate: (input: CreateDeviceInput) => void;
}) {
  const [method, setMethod] = useState<IntegrationMethod>('TRACKER_WEBHOOK');
  const [form, setForm] = useState({
    name: '',
    identifier: '',
    provider: 'TELTONIKA' as GpsProvider,
    vehiclePlate: '',
    vehicleType: 'CAR' as VehicleType,
  });

  const selectMethod = (nextMethod: IntegrationMethod) => {
    setMethod(nextMethod);
    setForm((current) => ({
      ...current,
      provider: nextMethod === 'TRACKER_WEBHOOK' ? 'TELTONIKA' : 'MOCK',
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const identifier = form.identifier.trim();

    onCreate({
      name: form.name.trim(),
      imei: identifier,
      provider: method === 'TRACKER_WEBHOOK' ? form.provider : 'MOCK',
      vehiclePlate: form.vehiclePlate.trim() || undefined,
      vehicleType: form.vehicleType,
      providerConfig: {
        integrationMode: method,
        webhookFormat: method === 'TRACKER_WEBHOOK' ? 'PROVIDER_NATIVE' : 'TRACEFLOW_JSON',
        externalDeviceId: identifier,
      },
    });
  };

  const identifierLabel =
    method === 'TRACKER_WEBHOOK'
      ? 'IMEI / DEVICE ID'
      : method === 'PHONE_GPS'
        ? 'DEVICE ID HP'
        : 'API DEVICE ID';

  return (
    <SlideUp>
      <CyberCard className="mb-4 p-6">
        <div className="mb-1 text-lg font-semibold tracking-tight">Tambah Perangkat Baru</div>
        <p className="mb-5 text-sm text-zinc-300">
          Pilih jalur data yang benar-benar akan dipakai perangkat untuk mengirim lokasi.
        </p>

        <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MethodCard
            active={method === 'TRACKER_WEBHOOK'}
            icon={<Radio className="h-5 w-5" />}
            title="GPS Tracker"
            description="Teltonika, Queclink, atau Concox melalui webhook provider."
            onClick={() => selectMethod('TRACKER_WEBHOOK')}
          />
          <MethodCard
            active={method === 'API_PUSH'}
            icon={<Send className="h-5 w-5" />}
            title="API JSON Push"
            description="Aplikasi atau gateway mengirim JSON standar ke TraceFlow."
            onClick={() => selectMethod('API_PUSH')}
          />
          <MethodCard
            active={method === 'PHONE_GPS'}
            icon={<Smartphone className="h-5 w-5" />}
            title="GPS HP"
            description="Gunakan lokasi browser HP sebagai tracker sementara."
            onClick={() => selectMethod('PHONE_GPS')}
          />
          <MethodCard
            active={method === 'MOCK'}
            icon={<FlaskConical className="h-5 w-5" />}
            title="Mock / Testing"
            description="Untuk simulator lokal sebelum perangkat fisik tersedia."
            onClick={() => selectMethod('MOCK')}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="NAMA PERANGKAT">
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className={inputClass}
                placeholder="Tracker Armada 01"
                required
                maxLength={100}
              />
            </Field>

            <Field label={identifierLabel}>
              <input
                type="text"
                value={form.identifier}
                onChange={(event) => setForm({ ...form, identifier: event.target.value })}
                className={`${inputClass} font-mono`}
                placeholder={
                  method === 'TRACKER_WEBHOOK'
                    ? '123456789012345'
                    : method === 'PHONE_GPS'
                      ? 'phone-tracker-01'
                      : 'fleet-gateway-01'
                }
                required
                minLength={3}
                maxLength={100}
              />
            </Field>

            {method === 'TRACKER_WEBHOOK' && (
              <Field label="PROVIDER / FORMAT PAYLOAD">
                <select
                  value={form.provider}
                  onChange={(event) => setForm({ ...form, provider: event.target.value as GpsProvider })}
                  className={selectClass}
                >
                  <option className={optionClass} value="TELTONIKA">Teltonika</option>
                  <option className={optionClass} value="QUECLINK">Queclink</option>
                  <option className={optionClass} value="CONCOX">Concox</option>
                </select>
              </Field>
            )}

            <Field label="PLAT KENDARAAN">
              <input
                type="text"
                value={form.vehiclePlate}
                onChange={(event) => setForm({ ...form, vehiclePlate: event.target.value })}
                className={inputClass}
                placeholder="B 1234 ABC"
                maxLength={30}
              />
            </Field>

            <Field label="JENIS KENDARAAN">
              <select
                value={form.vehicleType}
                onChange={(event) => setForm({ ...form, vehicleType: event.target.value as VehicleType })}
                className={selectClass}
              >
                <option className={optionClass} value="CAR">Mobil</option>
                <option className={optionClass} value="TRUCK">Truk</option>
                <option className={optionClass} value="MOTORCYCLE">Motor</option>
                <option className={optionClass} value="VAN">Van</option>
                <option className={optionClass} value="BUS">Bus</option>
                <option className={optionClass} value="OTHER">Lainnya</option>
              </select>
            </Field>
          </div>

          <MethodNotice method={method} provider={form.provider} />

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="border-white/15"
            >
              Batal
            </Button>
            <NeonButton type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Simpan Perangkat
            </NeonButton>
          </div>
        </form>
      </CyberCard>
    </SlideUp>
  );
}

function MethodCard({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? 'border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.08)]'
          : 'border-white/10 bg-white/[0.025] hover:border-white/25 hover:bg-white/5'
      }`}
    >
      <div className={active ? 'text-cyan-300' : 'text-zinc-200'}>{icon}</div>
      <div className="mt-3 text-sm font-medium text-white">{title}</div>
      <p className="mt-1 text-xs leading-relaxed text-zinc-300">{description}</p>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-300">{label}</label>
      {children}
    </div>
  );
}

function MethodNotice({
  method,
  provider,
}: {
  method: IntegrationMethod;
  provider: GpsProvider;
}) {
  if (method === 'TRACKER_WEBHOOK') {
    return (
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-sm text-cyan-100">
        <div className="flex items-center gap-2 font-medium">
          <Webhook className="h-4 w-4" />
          Provider-native webhook
        </div>
        <p className="mt-1 text-xs leading-relaxed text-cyan-100/80">
          Configure gateway {provider} untuk POST ke <code>/api/gps-webhook</code>.
          Device ID pada payload harus sama persis dengan identifier di atas.
        </p>
      </div>
    );
  }

  if (method === 'PHONE_GPS') {
    return (
      <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-4 text-sm text-violet-100">
        <div className="flex items-center gap-2 font-medium">
          <Smartphone className="h-4 w-4" />
          Browser GPS tracker
        </div>
        <p className="mt-1 text-xs leading-relaxed text-violet-100/80">
          Setelah disimpan, buka halaman GPS HP menggunakan HTTPS, pilih device ini,
          lalu izinkan akses lokasi. Webhook secret tidak dikirim ke browser.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-4 text-sm text-violet-100">
      <div className="flex items-center gap-2 font-medium">
        {method === 'API_PUSH' ? <Send className="h-4 w-4" /> : <FlaskConical className="h-4 w-4" />}
        TraceFlow JSON format
      </div>
      <p className="mt-1 text-xs leading-relaxed text-violet-100/80">
        Kirim JSON dengan field <code>deviceId</code>, <code>lat</code>, <code>lng</code>,
        dan optional <code>speed</code>. Gunakan header provider <code>MOCK</code>.
      </p>
    </div>
  );
}

function IntegrationGuide({
  integration,
  onClose,
}: {
  integration: CreatedIntegration;
  onClose: () => void;
}) {
  if (integration.method === 'PHONE_GPS') {
    return (
      <CyberCard className="mb-4 border-emerald-500/25 bg-emerald-950/20 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-medium text-emerald-200">
              <CheckCircle2 className="h-5 w-5" />
              {integration.name} berhasil disimpan
            </div>
            <p className="mt-1 text-sm text-zinc-200">
              Buka tracker di HP, izinkan lokasi, lalu tekan Mulai Tracking.
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Tutup</Button>
        </div>

        <Link
          href={`/phone-tracker?deviceId=${integration.deviceId}`}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-violet-400/30 bg-violet-500/15 px-4 py-2.5 text-sm font-medium text-violet-100 transition hover:bg-violet-500/25"
        >
          <Smartphone className="h-4 w-4" />
          Buka GPS HP
        </Link>
      </CyberCard>
    );
  }

  const isNativeTracker = integration.method === 'TRACKER_WEBHOOK';
  const sampleBody = isNativeTracker
    ? getProviderPayload(integration.provider, integration.identifier)
    : JSON.stringify(
        {
          deviceId: integration.identifier,
          lat: -6.2088,
          lng: 106.8456,
          speed: 35,
        },
        null,
        2,
      );

  return (
    <CyberCard className="mb-4 border-emerald-500/25 bg-emerald-950/20 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-medium text-emerald-200">
            <CheckCircle2 className="h-5 w-5" />
            {integration.name} berhasil disimpan
          </div>
          <p className="mt-1 text-sm text-zinc-200">
            Registrasi selesai. Data lokasi baru masuk setelah sender mengirim payload berikut.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Tutup</Button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-xs">
          <div className="mb-2 text-[10px] tracking-[1.5px] text-zinc-300">REQUEST</div>
          <div className="space-y-1 font-mono text-zinc-100">
            <div>POST /api/gps-webhook</div>
            <div>Authorization: Bearer &lt;WEBHOOK_SECRET&gt;</div>
            <div>x-gps-provider: {integration.provider}</div>
            <div>Content-Type: application/json</div>
          </div>
        </div>
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/25 p-4 text-xs text-zinc-100">
          {sampleBody}
        </pre>
      </div>
    </CyberCard>
  );
}

function getProviderPayload(provider: GpsProvider, identifier: string): string {
  if (provider === 'TELTONIKA') {
    return JSON.stringify({
      imei: identifier,
      timestamp: Math.floor(Date.now() / 1000),
      latitude: -6.2088,
      longitude: 106.8456,
      speed: 35,
      ignition: 1,
    }, null, 2);
  }

  return JSON.stringify({
    device_id: identifier,
    timestamp: provider === 'QUECLINK'
      ? new Date().toISOString()
      : Math.floor(Date.now() / 1000),
    gps: {
      latitude: -6.2088,
      longitude: 106.8456,
      speed: 35,
    },
    [provider === 'QUECLINK' ? 'io' : 'status']: {
      ignition: true,
    },
  }, null, 2);
}
