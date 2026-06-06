'use client';

import { useState } from 'react';
import { api } from '@/lib/api-provider';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, AnimatedPresence } from '@/components/ui/animation';
import { PageWrapper, CyberCard, NeonButton } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';

export default function GeofencesPage() {
  const { data: geofences, isLoading } = api.geofence.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);

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
      <AnimatedPresence show={showCreate}>
        <CreateGeofenceForm onClose={() => setShowCreate(false)} />
      </AnimatedPresence>

      <CyberCard>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : geofences && geofences.length > 0 ? (
          <div className="divide-y divide-white/5">
            <StaggerContainer>
              {geofences.map((geofence: any) => (
                <StaggerItem key={geofence.id}>
                  <GeofenceRow geofence={geofence} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <MapPin className="mb-3 h-10 w-10 text-zinc-600" />
            <div className="text-sm text-zinc-400">Belum ada geofence</div>
            <p className="text-xs text-zinc-500 mt-1">Buat zona untuk menerima peringatan masuk/keluar</p>
          </div>
        )}
      </CyberCard>
    </PageWrapper>
  );
}

function GeofenceRow({ geofence }: { geofence: any }) {
  const utils = api.useUtils();
  const deleteMutation = api.geofence.delete.useMutation({
    onSuccess: () => utils.geofence.list.invalidate(),
  });

  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/5 transition">
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 rounded-full border border-white/20" style={{ backgroundColor: geofence.color || '#3b82f6' }} />
        <div>
          <div className="font-medium">{geofence.name}</div>
          <div className="text-xs text-zinc-500">
            {geofence.type === 'CIRCLE' ? `Lingkaran • ${geofence.radius}m radius` : 'Poligon'}
          </div>
          {geofence.description && <div className="text-xs text-zinc-500 mt-0.5">{geofence.description}</div>}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="border-white/10"><Pencil className="h-3.5 w-3.5" /></Button>
        <Button variant="outline" size="sm" className="border-white/10" onClick={() => deleteMutation.mutate({ id: geofence.id })}>
          <Trash2 className="h-3.5 w-3.5 text-red-400" />
        </Button>
      </div>
    </div>
  );
}

function CreateGeofenceForm({ onClose }: { onClose: () => void }) {
  const utils = api.useUtils();
  const createMutation = api.geofence.create.useMutation({
    onSuccess: () => { utils.geofence.list.invalidate(); onClose(); },
  });

  const [form, setForm] = useState({
    name: '', description: '', type: 'CIRCLE' as const,
    centerLat: -6.2088, centerLng: 106.8456, radius: 500, color: '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); createMutation.mutate(form); };

  return (
    <SlideUp>
      <CyberCard className="p-6">
        <div className="mb-5 text-lg font-semibold tracking-tight">Buat Geofence Baru</div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">NAMA ZONA</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm" placeholder="Zona Kantor" required />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">TIPE</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm">
                <option value="CIRCLE">Lingkaran</option>
                <option value="POLYGON">Poligon</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">LINTANG PUSAT</label>
              <input type="number" step="any" value={form.centerLat} onChange={(e) => setForm({ ...form, centerLat: parseFloat(e.target.value) })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm font-mono" required />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">BUJUR PUSAT</label>
              <input type="number" step="any" value={form.centerLng} onChange={(e) => setForm({ ...form, centerLng: parseFloat(e.target.value) })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm font-mono" required />
            </div>
            {form.type === 'CIRCLE' && (
              <div>
                <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">RADIUS (meter)</label>
                <input type="number" value={form.radius} onChange={(e) => setForm({ ...form, radius: parseInt(e.target.value) })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm" min="50" max="20000" required />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">WARNA</label>
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-full rounded-xl border border-white/10 bg-zinc-950/60 p-1" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">DESKRIPSI (opsional)</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm" rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-white/15">Batal</Button>
            <NeonButton type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Membuat...' : 'Buat Geofence'}
            </NeonButton>
          </div>
        </form>
      </CyberCard>
    </SlideUp>
  );
}
