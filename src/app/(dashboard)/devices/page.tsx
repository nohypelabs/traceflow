'use client';

import type { Device } from '@/types';

import { useState } from 'react';
import { api } from '@/lib/api-provider';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Wifi, WifiOff, Clock, MoreVertical, Download } from 'lucide-react';
import { FadeIn, SlideUp, AnimatedPresence } from '@/components/ui/animation';
import { DeviceStatusBadge } from '@/components/ui/radix';
import { Card, Flex, Box, Heading, Text, Badge } from '@radix-ui/themes';
import { exportDevicesToCSV } from '@/lib/export';

export default function DevicesPage() {
  const { data: devices, isLoading } = api.device.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <FadeIn className="space-y-4">
      <Flex align="center" justify="between">
        <Heading size="5" className="md:text-2xl">Perangkat</Heading>
        <Flex gap="2">
          <Button 
            variant="outline" 
            size="default"
            onClick={() => devices && exportDevicesToCSV(devices)}
            disabled={!devices || devices.length === 0}
          >
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Export CSV</span>
          </Button>
          <Button onClick={() => setShowCreate(true)} size="default">
            <Plus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Tambah Perangkat</span>
          </Button>
        </Flex>
      </Flex>

      <AnimatedPresence show={showCreate}>
        <CreateDeviceForm onClose={() => setShowCreate(false)} />
      </AnimatedPresence>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      ) : devices && devices.length > 0 ? (
        <>
          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {devices.map((device) => (
              <MobileDeviceCard key={device.id} device={device} />
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-zinc-50 dark:bg-zinc-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500">Nama</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500">IMEI</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500">Kendaraan</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500">Terakhir Dilihat</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-zinc-500">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => (
                    <DesktopDeviceRow key={device.id} device={device} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-8">
          <Flex direction="column" align="center" justify="center" gap="2">
            <Text color="gray">Belum ada perangkat</Text>
            <Text size="1" color="gray">Tambahkan pelacak GPS pertama Anda</Text>
          </Flex>
        </Card>
      )}
    </FadeIn>
  );
}

// Mobile Card Component
function MobileDeviceCard({ device }: { device: Device }) {
  const utils = api.useUtils();
  const deleteMutation = api.device.delete.useMutation({
    onSuccess: () => utils.device.list.invalidate(),
  });

  return (
    <Card className="p-4">
      <Flex align="start" justify="between">
        <Flex align="start" gap="3">
          <DeviceStatusBadge status={device.status} />
          <Box>
            <Text weight="medium">{device.name}</Text>
            <Text size="1" color="gray">{device.imei}</Text>
            {device.vehiclePlate && (
              <Badge variant="soft" size="1" className="mt-1">{device.vehiclePlate}</Badge>
            )}
          </Box>
        </Flex>
        <Flex gap="1">
          <Button variant="ghost" size="sm">
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate({ id: device.id })}
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </Button>
        </Flex>
      </Flex>
      <Text size="1" color="gray" className="mt-2">
        {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString('id-ID') : 'Belum pernah'}
      </Text>
    </Card>
  );
}

// Desktop Table Row Component
function DesktopDeviceRow({ device }: { device: Device }) {
  const utils = api.useUtils();
  const deleteMutation = api.device.delete.useMutation({
    onSuccess: () => utils.device.list.invalidate(),
  });

  return (
    <tr className="border-b last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800">
      <td className="px-4 py-3">
        <DeviceStatusBadge status={device.status} />
      </td>
      <td className="px-4 py-3 font-medium">{device.name}</td>
      <td className="px-4 py-3 text-sm text-zinc-500">{device.imei}</td>
      <td className="px-4 py-3 text-sm">
        {device.vehiclePlate && (
          <Badge variant="soft">{device.vehiclePlate}</Badge>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-500">
        {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString('id-ID') : 'Belum pernah'}
      </td>
      <td className="px-4 py-3 text-right">
        <Flex justify="end" gap="2">
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteMutation.mutate({ id: device.id })}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </Flex>
      </td>
    </tr>
  );
}

// Create Device Form
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
      <Card className="p-4 md:p-6">
        <Heading size="3" className="md:text-lg mb-3">Tambah Perangkat Baru</Heading>
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium md:text-sm">Nama Perangkat</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Pelacak GPS Saya"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium md:text-sm">IMEI</label>
              <input
                type="text"
                value={form.imei}
                onChange={(e) => setForm({ ...form, imei: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="123456789012345"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium md:text-sm">Plat Kendaraan</label>
              <input
                type="text"
                value={form.vehiclePlate}
                onChange={(e) => setForm({ ...form, vehiclePlate: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="B 1234 ABC"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium md:text-sm">Jenis Kendaraan</label>
              <select
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value as any })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
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
          <Flex justify="end" gap="2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Membuat...' : 'Buat Perangkat'}
            </Button>
          </Flex>
        </form>
      </Card>
    </SlideUp>
  );
}
