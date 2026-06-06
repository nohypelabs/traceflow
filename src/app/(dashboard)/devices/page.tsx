'use client';

import type { Device } from '@/types';

import { useState } from 'react';
import { api } from '@/lib/api-provider';
import { Plus, Pencil, Trash2, Download, Wifi, WifiOff } from 'lucide-react';
import { FadeIn, SlideUp, AnimatedPresence } from '@/components/ui/animation';
import { DeviceStatusBadge } from '@/components/ui/radix';
import { PageWrapper, CyberCard, NeonButton } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { exportDevicesToCSV } from '@/lib/export';

export default function DevicesPage() {
  const { data: devices, isLoading } = api.device.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);

  const primaryAction = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="default"
        onClick={() => devices && exportDevicesToCSV(devices)}
        disabled={!devices || devices.length === 0}
        className="border-white/15 bg-white/5 hover:bg-white/10"
      >
        <Download className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">Export CSV</span>
      </Button>
      <NeonButton onClick={() => setShowCreate(true)}>
        <Plus className="h-4 w-4 md:mr-2" />
        <span>Tambah Perangkat</span>
      </NeonButton>
    </div>
  );

  return (
    <PageWrapper
      title="Perangkat"
      subtitle="MANAGE GPS TRACKERS • LIVE STATUS"
      actions={primaryAction}
    >
      <AnimatedPresence show={showCreate}>
        <CreateDeviceForm onClose={() => setShowCreate(false)} />
      </AnimatedPresence>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-zinc-950/70" />
          ))}
        </div>
      ) : devices && devices.length > 0 ? (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {devices.map((device) => (
              <MobileDeviceCard key={device.id} device={device} />
            ))}
          </div>

          {/* Desktop Table — futuristic styled */}
          <CyberCard className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.015] text-left text-xs uppercase tracking-[1.5px] text-zinc-400">
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Nama</th>
                    <th className="px-5 py-3.5">IMEI</th>
                    <th className="px-5 py-3.5">Kendaraan</th>
                    <th className="px-5 py-3.5">Terakhir Dilihat</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {devices.map((device) => (
                    <DesktopDeviceRow key={device.id} device={device} />
                  ))}
                </tbody>
              </table>
            </div>
          </CyberCard>
        </>
      ) : (
        <CyberCard className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Wifi className="h-8 w-8 text-cyan-400/60" />
          </div>
          <div className="text-lg font-medium">Belum ada perangkat</div>
          <p className="mt-1 text-sm text-zinc-500">Tambahkan pelacak GPS pertama Anda untuk mulai monitoring</p>
          <button onClick={() => setShowCreate(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-500/20">
            <Plus className="h-4 w-4" /> Tambah Perangkat Pertama
          </button>
        </CyberCard>
      )}
    </PageWrapper>
  );
}

// Mobile Card
function MobileDeviceCard({ device }: { device: Device }) {
  const utils = api.useUtils();
  const deleteMutation = api.device.delete.useMutation({
    onSuccess: () => utils.device.list.invalidate(),
  });

  return (
    <CyberCard className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <DeviceStatusBadge status={device.status} />
          <div>
            <div className="font-medium">{device.name}</div>
            <div className="font-mono text-xs text-zinc-500">{device.imei}</div>
            {device.vehiclePlate && (
              <div className="mt-1 inline-block rounded bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400">{device.vehiclePlate}</div>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: device.id })}>
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </Button>
        </div>
      </div>
      <div className="mt-3 text-xs text-zinc-500">
        {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString('id-ID') : 'Belum pernah terlihat'}
      </div>
    </CyberCard>
  );
}

// Desktop Row
function DesktopDeviceRow({ device }: { device: Device }) {
  const utils = api.useUtils();
  const deleteMutation = api.device.delete.useMutation({
    onSuccess: () => utils.device.list.invalidate(),
  });

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-5 py-3.5"><DeviceStatusBadge status={device.status} /></td>
      <td className="px-5 py-3.5 font-medium">{device.name}</td>
      <td className="px-5 py-3.5 font-mono text-xs text-zinc-400">{device.imei}</td>
      <td className="px-5 py-3.5">
        {device.vehiclePlate ? (
          <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-zinc-300">{device.vehiclePlate}</span>
        ) : '—'}
      </td>
      <td className="px-5 py-3.5 text-xs text-zinc-500">
        {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString('id-ID') : '—'}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" className="h-8 border-white/10"><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="sm" className="h-8 border-white/10" onClick={() => deleteMutation.mutate({ id: device.id })}>
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Create Form
function CreateDeviceForm({ onClose }: { onClose: () => void }) {
  const utils = api.useUtils();
  const createMutation = api.device.create.useMutation({
    onSuccess: () => {
      utils.device.list.invalidate();
      onClose();
    },
  });

  const [form, setForm] = useState({
    name: '',
    imei: '',
    provider: 'MOCK' as const,
    vehiclePlate: '',
    vehicleType: 'CAR' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <SlideUp>
      <CyberCard className="p-6">
        <div className="mb-5 text-lg font-semibold tracking-tight">Tambah Perangkat Baru</div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">NAMA PERANGKAT</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm"
                placeholder="Pelacak GPS Saya"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">IMEI</label>
              <input
                type="text"
                value={form.imei}
                onChange={(e) => setForm({ ...form, imei: e.target.value })}
                className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm font-mono"
                placeholder="123456789012345"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">PLAT KENDARAAN</label>
              <input
                type="text"
                value={form.vehiclePlate}
                onChange={(e) => setForm({ ...form, vehiclePlate: e.target.value })}
                className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm"
                placeholder="B 1234 ABC"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">JENIS KENDARAAN</label>
              <select
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value as any })}
                className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm"
              >
                <option value="CAR">Mobil</option>
                <option value="TRUCK">Truk</option>
                <option value="MOTORCYCLE">Motor</option>
                <option value="VAN">Van</option>
                <option value="BUS">Bus</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-white/15">Batal</Button>
            <NeonButton type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Membuat...' : 'Buat Perangkat'}
            </NeonButton>
          </div>
        </form>
      </CyberCard>
    </SlideUp>
  );
}
