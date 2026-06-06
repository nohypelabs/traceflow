'use client';

import { useState } from 'react';
import { api } from '@/lib/api-provider';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, AnimatedPresence } from '@/components/ui/animation';
import { Card, Flex, Box, Heading, Text, Badge } from '@radix-ui/themes';

export default function GeofencesPage() {
  const { data: geofences, isLoading } = api.geofence.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <FadeIn className="space-y-4">
      <Flex align="center" justify="between">
        <Heading size="6">Geofence</Heading>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Geofence
        </Button>
      </Flex>

      <AnimatedPresence show={showCreate}>
        <CreateGeofenceForm onClose={() => setShowCreate(false)} />
      </AnimatedPresence>

      <Card>
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              ))}
            </div>
          </div>
        ) : geofences && geofences.length > 0 ? (
          <div className="divide-y">
            <StaggerContainer>
              {geofences.map((geofence) => (
                <StaggerItem key={geofence.id}>
                  <GeofenceRow geofence={geofence} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        ) : (
          <Flex direction="column" align="center" justify="center" className="h-64">
            <MapPin className="h-12 w-12 text-zinc-400" />
            <Text color="gray" mt="2">Belum ada geofence</Text>
            <Text size="1" color="gray">Buat zona untuk memantau masuk/keluar perangkat</Text>
          </Flex>
        )}
      </Card>
    </FadeIn>
  );
}

function GeofenceRow({ geofence }: { geofence: any }) {
  const utils = api.useUtils();
  const deleteMutation = api.geofence.delete.useMutation({
    onSuccess: () => utils.geofence.list.invalidate(),
  });

  return (
    <Flex align="center" justify="between" p="4" className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
      <Flex align="center" gap="4">
        <div
          className="h-10 w-10 rounded-full"
          style={{ backgroundColor: geofence.color || '#3b82f6' }}
        />
        <Box>
          <Text weight="medium">{geofence.name}</Text>
          <Text size="1" color="gray">
            {geofence.type === 'CIRCLE'
              ? `Lingkaran: ${geofence.radius}m radius`
              : 'Zona poligon'}
          </Text>
          {geofence.description && (
            <Text size="1" color="gray">{geofence.description}</Text>
          )}
        </Box>
      </Flex>
      <Flex gap="2">
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => deleteMutation.mutate({ id: geofence.id })}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </Flex>
    </Flex>
  );
}

function CreateGeofenceForm({ onClose }: { onClose: () => void }) {
  const utils = api.useUtils();
  const createMutation = api.geofence.create.useMutation({
    onSuccess: () => {
      utils.geofence.list.invalidate();
      onClose();
    },
  });

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'CIRCLE' as const,
    centerLat: -6.2088,
    centerLng: 106.8456,
    radius: 500,
    color: '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <SlideUp>
      <Card className="p-6">
        <Heading size="4" mb="4">Buat Geofence</Heading>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Nama</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Zona Kantor"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tipe</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="CIRCLE">Lingkaran</option>
                <option value="POLYGON">Poligon</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Lintang Pusat</label>
              <input
                type="number"
                step="any"
                value={form.centerLat}
                onChange={(e) => setForm({ ...form, centerLat: parseFloat(e.target.value) })}
                className="w-full rounded-lg border px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Bujur Pusat</label>
              <input
                type="number"
                step="any"
                value={form.centerLng}
                onChange={(e) => setForm({ ...form, centerLng: parseFloat(e.target.value) })}
                className="w-full rounded-lg border px-3 py-2"
                required
              />
            </div>
            {form.type === 'CIRCLE' && (
              <div>
                <label className="mb-1 block text-sm font-medium">Radius (meter)</label>
                <input
                  type="number"
                  value={form.radius}
                  onChange={(e) => setForm({ ...form, radius: parseInt(e.target.value) })}
                  className="w-full rounded-lg border px-3 py-2"
                  min="100"
                  max="10000"
                  required
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium">Warna</label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-10 w-full rounded-lg border"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border px-3 py-2"
              rows={2}
              placeholder="Deskripsi opsional"
            />
          </div>
          <Flex justify="end" gap="2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Membuat...' : 'Buat Geofence'}
            </Button>
          </Flex>
        </form>
      </Card>
    </SlideUp>
  );
}
