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
  // Rich, realistic mock data for demo (structured exactly like real Prisma/Device model — easy to swap later)
  const [devices, setDevices] = useState<Device[]>([
    { id: 'd1', name: 'Truk Armada-07', imei: '867530912345678', provider: 'MOCK', vehiclePlate: 'B 1234 ABC', vehicleType: 'TRUCK', status: 'ONLINE', lastLatitude: -6.2088, lastLongitude: 106.8456, lastSpeed: 48, lastHeading: 270, lastIgnition: true, lastSeenAt: new Date(Date.now() - 1000 * 12), createdAt: new Date('2024-11-01') },
    { id: 'd2', name: 'Mobil Ops #12', imei: '867530912345679', provider: 'MOCK', vehiclePlate: 'B 5678 DEF', vehicleType: 'CAR', status: 'ONLINE', lastLatitude: -6.175, lastLongitude: 106.865, lastSpeed: 62, lastHeading: 180, lastIgnition: true, lastSeenAt: new Date(Date.now() - 1000 * 8), createdAt: new Date('2024-11-05') },
    { id: 'd3', name: 'Motor Kurir-03', imei: '867530912345680', provider: 'MOCK', vehiclePlate: 'B 9012 GHI', vehicleType: 'MOTORCYCLE', status: 'ONLINE', lastLatitude: -6.22, lastLongitude: 106.81, lastSpeed: 31, lastHeading: 90, lastIgnition: true, lastSeenAt: new Date(Date.now() - 1000 * 3), createdAt: new Date('2024-10-20') },
    { id: 'd4', name: 'Van Logistik-09', imei: '867530912345681', provider: 'MOCK', vehiclePlate: 'B 3456 JKL', vehicleType: 'VAN', status: 'IDLE', lastLatitude: -6.19, lastLongitude: 106.83, lastSpeed: 0, lastHeading: 0, lastIgnition: false, lastSeenAt: new Date(Date.now() - 1000 * 60 * 4), createdAt: new Date('2024-11-10') },
    { id: 'd5', name: 'Truk B-15', imei: '867530912345682', provider: 'MOCK', vehiclePlate: 'B 7890 MNO', vehicleType: 'TRUCK', status: 'OFFLINE', lastLatitude: -6.25, lastLongitude: 106.79, lastSpeed: 0, lastHeading: 0, lastIgnition: false, lastSeenAt: new Date(Date.now() - 1000 * 60 * 47), createdAt: new Date('2024-09-15') },
    { id: 'd6', name: 'Mobil #5', imei: '867530912345683', provider: 'MOCK', vehiclePlate: 'B 2345 PQR', vehicleType: 'CAR', status: 'ONLINE', lastLatitude: -6.18, lastLongitude: 106.87, lastSpeed: 55, lastHeading: 45, lastIgnition: true, lastSeenAt: new Date(Date.now() - 1000 * 19), createdAt: new Date('2024-11-12') },
    { id: 'd7', name: 'Truk C-22', imei: '867530912345684', provider: 'MOCK', vehiclePlate: 'B 6789 STU', vehicleType: 'TRUCK', status: 'IDLE', lastLatitude: -6.21, lastLongitude: 106.82, lastSpeed: 0, lastHeading: 0, lastIgnition: false, lastSeenAt: new Date(Date.now() - 1000 * 60 * 11), createdAt: new Date('2024-10-28') },
    { id: 'd8', name: 'Ambulance Support', imei: '867530912345685', provider: 'MOCK', vehiclePlate: 'B 1122 VWX', vehicleType: 'VAN', status: 'ONLINE', lastLatitude: -6.205, lastLongitude: 106.85, lastSpeed: 72, lastHeading: 315, lastIgnition: true, lastSeenAt: new Date(Date.now() - 1000 * 25), createdAt: new Date('2024-11-08') },
    { id: 'd9', name: 'Forklift Yard-01', imei: '867530912345686', provider: 'MOCK', vehiclePlate: null, vehicleType: 'OTHER', status: 'OFFLINE', lastLatitude: -6.23, lastLongitude: 106.80, lastSpeed: 0, lastHeading: 0, lastIgnition: false, lastSeenAt: new Date(Date.now() - 1000 * 60 * 90), createdAt: new Date('2024-08-10') },
    { id: 'd10', name: 'Bus Sekolah-03', imei: '867530912345687', provider: 'MOCK', vehiclePlate: 'B 4455 YZ', vehicleType: 'BUS', status: 'ONLINE', lastLatitude: -6.17, lastLongitude: 106.88, lastSpeed: 42, lastHeading: 135, lastIgnition: true, lastSeenAt: new Date(Date.now() - 1000 * 55), createdAt: new Date('2024-11-15') },
    { id: 'd11', name: 'Pickup Delivery', imei: '867530912345688', provider: 'MOCK', vehiclePlate: 'B 7788 AA', vehicleType: 'CAR', status: 'IDLE', lastLatitude: -6.24, lastLongitude: 106.84, lastSpeed: 0, lastHeading: 0, lastIgnition: false, lastSeenAt: new Date(Date.now() - 1000 * 60 * 18), createdAt: new Date('2024-11-03') },
    { id: 'd12', name: 'Truk Tanker-11', imei: '867530912345689', provider: 'MOCK', vehiclePlate: 'B 9900 BB', vehicleType: 'TRUCK', status: 'ONLINE', lastLatitude: -6.195, lastLongitude: 106.81, lastSpeed: 35, lastHeading: 225, lastIgnition: true, lastSeenAt: new Date(Date.now() - 1000 * 7), createdAt: new Date('2024-10-22') },
  ]);

  const [showCreate, setShowCreate] = useState(false);

  const primaryAction = (
    <div className="flex gap-2">
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
      <NeonButton onClick={() => setShowCreate(true)}>
        <Plus className="h-4 w-4 md:mr-2" />
        <span>Tambah Perangkat</span>
      </NeonButton>
    </div>
  );

  // Demo: actually add to the list (simulates real create + invalidate)
  const handleDemoCreate = (newDevice: Partial<Device>) => {
    const device: Device = {
      id: 'd' + (Date.now()),
      name: newDevice.name || 'Demo Device',
      imei: newDevice.imei || '8675309' + Math.floor(Math.random() * 1000000),
      provider: 'MOCK',
      vehiclePlate: newDevice.vehiclePlate || null,
      vehicleType: newDevice.vehicleType || 'CAR',
      status: 'IDLE',
      lastLatitude: null,
      lastLongitude: null,
      lastSpeed: null,
      lastHeading: null,
      lastIgnition: false,
      lastSeenAt: null,
      createdAt: new Date(),
    };
    setDevices(prev => [device, ...prev]);
    setShowCreate(false);
  };

  const handleDemoDelete = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  return (
    <PageWrapper
      title="Perangkat"
      subtitle="MANAGE GPS TRACKERS • LIVE STATUS"
      actions={primaryAction}
    >
      <AnimatedPresence show={showCreate}>
        <CreateDeviceForm onClose={() => setShowCreate(false)} onCreate={handleDemoCreate} />
      </AnimatedPresence>

      {devices.length > 0 ? (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {devices.map((device) => (
              <MobileDeviceCard key={device.id} device={device} onDelete={handleDemoDelete} />
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
                    <DesktopDeviceRow key={device.id} device={device} onDelete={handleDemoDelete} />
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

// Mobile Card (demo: uses local state delete)
function MobileDeviceCard({ device, onDelete }: { device: Device; onDelete: (id: string) => void }) {
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
          <Button variant="ghost" size="sm" onClick={() => onDelete(device.id)}>
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </Button>
        </div>
      </div>
      <div className="mt-3 text-xs text-zinc-500">
        {device.lastSeenAt ? device.lastSeenAt.toLocaleString('id-ID') : 'Belum pernah terlihat'}
      </div>
    </CyberCard>
  );
}

// Desktop Row (demo: local delete)
function DesktopDeviceRow({ device, onDelete }: { device: Device; onDelete: (id: string) => void }) {
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
        {device.lastSeenAt ? device.lastSeenAt.toLocaleString('id-ID') : '—'}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" className="h-8 border-white/10"><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="sm" className="h-8 border-white/10" onClick={() => onDelete(device.id)}>
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Create Form (demo: calls onCreate to add to local list)
function CreateDeviceForm({ onClose, onCreate }: { onClose: () => void; onCreate: (d: Partial<Device>) => void }) {
  const [form, setForm] = useState({
    name: '',
    imei: '',
    provider: 'MOCK' as const,
    vehiclePlate: '',
    vehicleType: 'CAR' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(form);
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
            <NeonButton type="submit">
              Buat Perangkat (Demo)
            </NeonButton>
          </div>
        </form>
      </CyberCard>
    </SlideUp>
  );
}
