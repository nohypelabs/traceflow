'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Check,
  X,
  ChevronDown,
  Users,
  Circle,
  Hexagon,
  AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api-provider';
import { PageWrapper, CyberCard, NeonButton } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { StaggerContainer, StaggerItem } from '@/components/ui/animation';

// ── Types ──

interface GeofenceDevice {
  id: string;
  device: {
    id: string;
    name: string;
    vehiclePlate: string | null;
    status: string;
  };
}

interface Geofence {
  id: string;
  name: string;
  description: string | null;
  type: 'CIRCLE' | 'POLYGON';
  centerLat: number | null;
  centerLng: number | null;
  radius: number | null;
  color: string;
  geofenceDevices: GeofenceDevice[];
  createdAt: Date;
}

// ── Main Page ──

export default function GeofencesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const utils = api.useUtils();
  const geofencesQuery = api.geofence.list.useQuery();
  const devicesQuery = api.device.list.useQuery();

  const geofences = (geofencesQuery.data ?? []) as Geofence[];
  const devices = devicesQuery.data ?? [];

  const deleteMutation = api.geofence.delete.useMutation({
    onSuccess: () => {
      utils.geofence.list.invalidate();
      setDeleteConfirm(null);
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  return (
    <PageWrapper
      title="Geofence"
      subtitle="MONITORED ZONES • ENTER / EXIT ALERTS"
      actions={
        <NeonButton onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Geofence
        </NeonButton>
      }
    >
      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <GeofenceForm
            devices={devices}
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              utils.geofence.list.invalidate();
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Form */}
      <AnimatePresence>
        {editingId && (
          <GeofenceForm
            geofence={geofences.find((g) => g.id === editingId)}
            devices={devices}
            onClose={() => setEditingId(null)}
            onCreated={() => {
              setEditingId(null);
              utils.geofence.list.invalidate();
            }}
          />
        )}
      </AnimatePresence>

      {/* Geofence List */}
      <CyberCard>
        {geofencesQuery.isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-sm text-zinc-400">Memuat geofence...</div>
          </div>
        ) : geofences.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <MapPin className="mb-3 h-10 w-10 text-zinc-600" />
            <div className="text-sm text-zinc-400">Belum ada geofence</div>
            <p className="text-xs text-zinc-500 mt-1">
              Buat zona untuk menerima peringatan masuk/keluar
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <StaggerContainer>
              {geofences.map((geofence) => (
                <StaggerItem key={geofence.id}>
                  <GeofenceRow
                    geofence={geofence}
                    onEdit={() => setEditingId(geofence.id)}
                    onDelete={() => setDeleteConfirm(geofence.id)}
                    isDeleting={deleteConfirm === geofence.id}
                    onConfirmDelete={() => handleDelete(geofence.id)}
                    onCancelDelete={() => setDeleteConfirm(null)}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}
      </CyberCard>
    </PageWrapper>
  );
}

// ── Geofence Row ──

function GeofenceRow({
  geofence,
  onEdit,
  onDelete,
  isDeleting,
  onConfirmDelete,
  onCancelDelete,
}: {
  geofence: Geofence;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const deviceCount = geofence.geofenceDevices.length;
  const assignedDevices = geofence.geofenceDevices.map((gd) => gd.device);

  return (
    <motion.div
      layout
      className="flex items-center justify-between p-4 hover:bg-white/5 transition"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Color swatch */}
        <div
          className="h-9 w-9 shrink-0 rounded-full border border-white/20 flex items-center justify-center"
          style={{ backgroundColor: geofence.color || '#3b82f6' }}
        >
          {geofence.type === 'CIRCLE' ? (
            <Circle className="h-4 w-4 text-white/70" />
          ) : (
            <Hexagon className="h-4 w-4 text-white/70" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{geofence.name}</span>
            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border border-white/10 text-zinc-500">
              {geofence.type === 'CIRCLE' ? `${geofence.radius}m` : 'Poligon'}
            </span>
          </div>

          {geofence.description && (
            <div className="text-xs text-zinc-500 truncate mt-0.5">
              {geofence.description}
            </div>
          )}

          {/* Assigned devices */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {deviceCount === 0 ? (
              <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                <Users className="h-3 w-3" /> Semua perangkat
              </span>
            ) : (
              assignedDevices.slice(0, 3).map((device) => (
                <span
                  key={device.id}
                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-zinc-400"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      device.status === 'ONLINE'
                        ? 'bg-emerald-400'
                        : device.status === 'IDLE'
                          ? 'bg-yellow-400'
                          : 'bg-zinc-600'
                    }`}
                  />
                  {device.name}
                </span>
              ))
            )}
            {deviceCount > 3 && (
              <span className="text-[10px] text-zinc-500">
                +{deviceCount - 3} lagi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 ml-4">
        <AnimatePresence mode="wait">
          {isDeleting ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5"
            >
              <span className="text-[10px] text-red-400 mr-1">Hapus?</span>
              <button
                onClick={onConfirmDelete}
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onCancelDelete}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:bg-white/10 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-2"
            >
              <button
                onClick={onEdit}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:border-cyan-500/30 hover:text-cyan-300 transition"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:border-red-500/30 hover:text-red-400 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Geofence Form (Create & Edit) ──

function GeofenceForm({
  geofence,
  devices,
  onClose,
  onCreated,
}: {
  geofence?: Geofence;
  devices: Array<{
    id: string;
    name: string;
    vehiclePlate: string | null;
    status: string;
  }>;
  onClose: () => void;
  onCreated: () => void;
}) {
  const isEdit = !!geofence;
  const [form, setForm] = useState({
    name: geofence?.name ?? '',
    description: geofence?.description ?? '',
    type: (geofence?.type ?? 'CIRCLE') as 'CIRCLE' | 'POLYGON',
    centerLat: geofence?.centerLat ?? -6.2088,
    centerLng: geofence?.centerLng ?? 106.8456,
    radius: geofence?.radius ?? 500,
    color: geofence?.color ?? '#3b82f6',
  });
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>(
    geofence?.geofenceDevices.map((gd) => gd.device.id) ?? [],
  );
  const [showDevicePicker, setShowDevicePicker] = useState(false);

  const utils = api.useUtils();

  const createMutation = api.geofence.create.useMutation({
    onSuccess: onCreated,
  });

  const updateMutation = api.geofence.update.useMutation({
    onSuccess: onCreated,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit) {
      updateMutation.mutate({
        id: geofence!.id,
        name: form.name,
        description: form.description || undefined,
        color: form.color,
        deviceIds: selectedDeviceIds,
      });
    } else {
      createMutation.mutate({
        name: form.name,
        description: form.description || undefined,
        type: form.type,
        centerLat: form.centerLat,
        centerLng: form.centerLng,
        radius: form.type === 'CIRCLE' ? form.radius : undefined,
        color: form.color,
        deviceIds: selectedDeviceIds.length > 0 ? selectedDeviceIds : undefined,
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const toggleDevice = (deviceId: string) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId],
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="mb-5 overflow-hidden"
    >
      <CyberCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="text-lg font-semibold tracking-tight">
            {isEdit ? 'Edit Geofence' : 'Buat Geofence Baru'}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">
                NAMA ZONA
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:border-cyan-500/40 focus:outline-none transition"
                placeholder="Zona Kantor"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">
                TIPE
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as 'CIRCLE' | 'POLYGON' })
                }
                disabled={isEdit}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm focus:border-cyan-500/40 focus:outline-none transition disabled:opacity-50"
              >
                <option value="CIRCLE">Lingkaran</option>
                <option value="POLYGON">Poligon</option>
              </select>
            </div>

            {/* Center Lat */}
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">
                LINTANG PUSAT
              </label>
              <input
                type="number"
                step="any"
                value={form.centerLat}
                onChange={(e) =>
                  setForm({ ...form, centerLat: parseFloat(e.target.value) })
                }
                disabled={isEdit}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm font-mono focus:border-cyan-500/40 focus:outline-none transition disabled:opacity-50"
                required
              />
            </div>

            {/* Center Lng */}
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">
                BUJUR PUSAT
              </label>
              <input
                type="number"
                step="any"
                value={form.centerLng}
                onChange={(e) =>
                  setForm({ ...form, centerLng: parseFloat(e.target.value) })
                }
                disabled={isEdit}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm font-mono focus:border-cyan-500/40 focus:outline-none transition disabled:opacity-50"
                required
              />
            </div>

            {/* Radius (CIRCLE only) */}
            {form.type === 'CIRCLE' && (
              <div>
                <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">
                  RADIUS (meter)
                </label>
                <input
                  type="number"
                  value={form.radius}
                  onChange={(e) =>
                    setForm({ ...form, radius: parseInt(e.target.value) })
                  }
                  disabled={isEdit}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm focus:border-cyan-500/40 focus:outline-none transition disabled:opacity-50"
                  min="50"
                  max="20000"
                  required
                />
              </div>
            )}

            {/* Color */}
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">
                WARNA
              </label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-10 w-full rounded-xl border border-white/10 bg-zinc-950/60 p-1 cursor-pointer"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">
              DESKRIPSI (opsional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm focus:border-cyan-500/40 focus:outline-none transition resize-none"
              rows={2}
            />
          </div>

          {/* Device Assignment */}
          <div>
            <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">
              ASSIGN KE PERANGKAT
            </label>
            <p className="text-[11px] text-zinc-500 mb-2">
              {selectedDeviceIds.length === 0
                ? 'Tidak ada perangkat dipilih — geofence berlaku untuk semua perangkat'
                : `${selectedDeviceIds.length} perangkat dipilih`}
            </p>

            {/* Selected devices chips */}
            {selectedDeviceIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedDeviceIds.map((id) => {
                  const device = devices.find((d) => d.id === id);
                  if (!device) return null;
                  return (
                    <motion.span
                      key={id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                    >
                      {device.name}
                      <button
                        type="button"
                        onClick={() => toggleDevice(id)}
                        className="ml-0.5 hover:text-white transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  );
                })}
              </div>
            )}

            {/* Device picker dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDevicePicker(!showDevicePicker)}
                className="w-full flex items-center justify-between rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-900 dark:text-white text-left hover:border-cyan-500/30 transition"
              >
                <span className="text-zinc-400">
                  Pilih perangkat...
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-500 transition-transform ${
                    showDevicePicker ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {showDevicePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/95 backdrop-blur shadow-xl origin-top"
                  >
                    {devices.length === 0 ? (
                      <div className="p-3 text-xs text-zinc-500 text-center">
                        Belum ada perangkat
                      </div>
                    ) : (
                      devices.map((device) => {
                        const isSelected = selectedDeviceIds.includes(device.id);
                        return (
                          <button
                            key={device.id}
                            type="button"
                            onClick={() => toggleDevice(device.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-white/5 transition ${
                              isSelected ? 'bg-cyan-500/10' : ''
                            }`}
                          >
                            <div
                              className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition ${
                                isSelected
                                  ? 'border-cyan-500 bg-cyan-500'
                                  : 'border-white/20 bg-transparent'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span
                              className={`h-2 w-2 rounded-full ${
                                device.status === 'ONLINE'
                                  ? 'bg-emerald-400'
                                  : device.status === 'IDLE'
                                    ? 'bg-yellow-400'
                                    : 'bg-zinc-600'
                              }`}
                            />
                            <span className="truncate">{device.name}</span>
                            {device.vehiclePlate && (
                              <span className="shrink-0 text-[10px] text-zinc-500 ml-auto">
                                {device.vehiclePlate}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Geometry warning for edit */}
          {isEdit && (
            <div className="flex items-start gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-yellow-200/70">
                Geometri (posisi, radius, tipe) tidak dapat diubah setelah dibuat. Hapus dan buat ulang jika perlu mengubah geometri.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/15"
            >
              Batal
            </Button>
            <NeonButton type="submit" disabled={isLoading}>
              {isLoading
                ? 'Menyimpan...'
                : isEdit
                  ? 'Simpan Perubahan'
                  : 'Buat Geofence'}
            </NeonButton>
          </div>

          {/* Error */}
          {(createMutation.error || updateMutation.error) && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/50 px-3 py-2 text-xs text-red-300">
              {createMutation.error?.message || updateMutation.error?.message}
            </div>
          )}
        </form>
      </CyberCard>
    </motion.div>
  );
}
