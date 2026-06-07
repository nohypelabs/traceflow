'use client';

import { useState } from 'react';
import { api } from '@/lib/api-provider';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, AnimatedPresence } from '@/components/ui/animation';
import { PageWrapper, CyberCard, NeonButton } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';

export default function GeofencesPage() {
  // Rich realistic mock geofences (matches real Geofence type — easy to replace with API later)
  const [geofences, setGeofences] = useState([
    { id: 'g1', name: 'Gudang Utara', description: 'Zona penyimpanan utama', type: 'CIRCLE', centerLat: -6.2088, centerLng: 106.8456, radius: 500, color: '#3b82f6', createdAt: new Date('2024-10-01') },
    { id: 'g2', name: 'Rute A - Tol', description: 'Koridor pengiriman cepat', type: 'POLYGON', centerLat: null, centerLng: null, radius: null, color: '#10b981', createdAt: new Date('2024-10-05') },
    { id: 'g3', name: 'Area JKT Selatan', description: 'Wilayah operasional selatan', type: 'CIRCLE', centerLat: -6.25, centerLng: 106.81, radius: 1200, color: '#8b5cf6', createdAt: new Date('2024-10-12') },
    { id: 'g4', name: 'Pool Maintenance', description: 'Bengkel dan parkir kendaraan', type: 'CIRCLE', centerLat: -6.19, centerLng: 106.83, radius: 300, color: '#f59e0b', createdAt: new Date('2024-10-20') },
    { id: 'g5', name: 'Client Site - BSD', description: 'Lokasi klien utama', type: 'POLYGON', centerLat: null, centerLng: null, radius: null, color: '#ef4444', createdAt: new Date('2024-11-01') },
    { id: 'g6', name: 'Depot Bahan Bakar', description: 'Area pengisian bahan bakar', type: 'CIRCLE', centerLat: -6.22, centerLng: 106.79, radius: 400, color: '#06b6d4', createdAt: new Date('2024-11-08') },
  ]);

  const [showCreate, setShowCreate] = useState(false);

  const handleDemoCreate = (newG: any) => {
    const g = {
      id: 'g' + Date.now(),
      ...newG,
      createdAt: new Date(),
    };
    setGeofences(prev => [g, ...prev]);
    setShowCreate(false);
  };

  const handleDemoDelete = (id: string) => {
    setGeofences(prev => prev.filter(g => g.id !== id));
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
      <AnimatedPresence show={showCreate}>
        <CreateGeofenceForm onClose={() => setShowCreate(false)} onCreate={handleDemoCreate} />
      </AnimatedPresence>

      <CyberCard>
        {geofences.length > 0 ? (
          <div className="divide-y divide-white/5">
            <StaggerContainer>
              {geofences.map((geofence: any) => (
                <StaggerItem key={geofence.id}>
                  <GeofenceRow geofence={geofence} onDelete={handleDemoDelete} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <MapPin className="mb-3 h-10 w-10 text-zinc-600" />
            <div className="text-sm text-zinc-400">Belum ada geofence</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 text-zinc-400 mt-1">Buat zona untuk menerima peringatan masuk/keluar</p>
          </div>
        )}
      </CyberCard>
    </PageWrapper>
  );
}

function GeofenceRow({ geofence, onDelete }: { geofence: any; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/5 transition">
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 rounded-full border border-white/20" style={{ backgroundColor: geofence.color || '#3b82f6' }} />
        <div>
          <div className="font-medium">{geofence.name}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500 text-zinc-400">
            {geofence.type === 'CIRCLE' ? `Lingkaran • ${geofence.radius}m radius` : 'Poligon'}
          </div>
          {geofence.description && <div className="text-xs text-zinc-500 dark:text-zinc-500 text-zinc-400 mt-0.5">{geofence.description}</div>}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="border-white/10"><Pencil className="h-3.5 w-3.5" /></Button>
        <Button variant="outline" size="sm" className="border-white/10" onClick={() => onDelete(geofence.id)}>
          <Trash2 className="h-3.5 w-3.5 text-red-400" />
        </Button>
      </div>
    </div>
  );
}

function CreateGeofenceForm({ onClose, onCreate }: { onClose: () => void; onCreate: (g: any) => void }) {
  const [form, setForm] = useState({
    name: '', description: '', type: 'CIRCLE' as const,
    centerLat: -6.2088, centerLng: 106.8456, radius: 500, color: '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(form);
  };

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
            <NeonButton type="submit">
              Buat Geofence (Demo)
            </NeonButton>
          </div>
        </form>
      </CyberCard>
    </SlideUp>
  );
}
