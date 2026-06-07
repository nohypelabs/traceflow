'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-provider';
import { User, Building, Save, Loader2, MessageCircle, Globe } from 'lucide-react';
import { FadeIn, SlideUp } from '@/components/ui/animation';
import { PageWrapper, CyberCard } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { WhatsAppSettings } from '@/components/ui/whatsapp-settings';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

type Tab = 'profile' | 'organization' | 'whatsapp' | 'language';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'profile', label: 'Profil', icon: User },
    { key: 'organization', label: 'Organisasi', icon: Building },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { key: 'language', label: 'Bahasa', icon: Globe },
  ];

  return (
    <PageWrapper title="Pengaturan" subtitle="SYSTEM CONFIG • ACCOUNT & INTEGRATIONS">
      <div className="flex gap-2 border-b border-white/10 pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${active ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'organization' && <OrganizationSettings />}
        {activeTab === 'whatsapp' && <WhatsAppSettingsTab />}
        {activeTab === 'language' && <LanguageSwitcher />}
      </div>
    </PageWrapper>
  );
}

function ProfileSettings() {
  const utils = api.useUtils();
  // Demo mock current user data (realistic, matches real User type)
  const mockSession = {
    user: {
      name: 'Budi Santoso',
      email: 'budi.santoso@perusahaan.com',
      role: 'MANAGER',
    }
  };

  const [form, setForm] = useState({ name: 'Budi Santoso', email: 'budi.santoso@perusahaan.com', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState(''); const [success, setSuccess] = useState('');

  const updateProfileMutation = api.auth.updateProfile.useMutation({
    onSuccess: () => { setSuccess('Profil berhasil diperbarui'); setError(''); utils.auth.getSession.invalidate(); },
    onError: (e) => { setError(e.message); setSuccess(''); },
  });

  const changePasswordMutation = api.auth.changePassword.useMutation({
    onSuccess: () => { setSuccess('Kata sandi berhasil diubah'); setError(''); setForm((p) => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' })); },
    onError: (e) => { setError(e.message); setSuccess(''); },
  });

  return (
    <div className="space-y-4">
      <CyberCard className="p-6">
        <div className="mb-5 text-lg font-semibold tracking-tight">Informasi Profil</div>
        <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate({ name: form.name, email: form.email }); }} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">NAMA</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm" /></div>
            <div><label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">EMAIL</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm" /></div>
          </div>
          <div className="flex justify-end"><Button type="submit" disabled={updateProfileMutation.isPending}>{updateProfileMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Simpan Perubahan</Button></div>
        </form>
      </CyberCard>

      <CyberCard className="p-6">
        <div className="mb-5 text-lg font-semibold tracking-tight">Ubah Kata Sandi</div>
        <form onSubmit={(e) => {
          e.preventDefault(); setError('');
          if (form.newPassword !== form.confirmPassword) { setError('Kata sandi baru tidak cocok'); return; }
          if (form.newPassword.length < 8) { setError('Minimal 8 karakter'); return; }
          changePasswordMutation.mutate({ currentPassword: form.currentPassword, newPassword: form.newPassword });
        }} className="space-y-4">
          <div><label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">KATA SANDI SAAT INI</label><input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm" required /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">KATA SANDI BARU</label><input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm" minLength={8} required /></div>
            <div><label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">KONFIRMASI</label><input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm" minLength={8} required /></div>
          </div>
          <div className="flex justify-end"><Button type="submit" disabled={changePasswordMutation.isPending}>{changePasswordMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Ubah Kata Sandi</Button></div>
        </form>
      </CyberCard>

      {error && <CyberCard className="border-red-500/30 bg-red-950/30 p-4 text-red-300">{error}</CyberCard>}
      {success && <CyberCard className="border-emerald-500/30 bg-emerald-950/30 p-4 text-emerald-300">{success}</CyberCard>}
    </div>
  );
}

function OrganizationSettings() {
  // Demo mock organization (matches real Organization type)
  const mockOrg = {
    id: 'org1',
    name: 'PT Logistik Prima Indonesia',
    slug: 'logistik-prima',
    logo: 'https://via.placeholder.com/120x40/0a0f1e/67e8f9?text=LOGISTIK',
  };

  const [form, setForm] = useState({ name: mockOrg.name, slug: mockOrg.slug, logo: mockOrg.logo || '' });
  const [isLoading] = useState(false);

  // Demo update (simulates real mutation)
  const handleDemoUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Demo: Pengaturan Organisasi berhasil disimpan! (Data mock akan tersimpan di implementasi nyata)');
  };

  return (
    <CyberCard className="p-6">
      <div className="mb-5 text-lg font-semibold tracking-tight">Pengaturan Organisasi</div>
      <form onSubmit={handleDemoUpdate} className="space-y-4">
        <div><label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">NAMA ORGANISASI</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm" required /></div>
        <div><label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">SLUG</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm font-mono" required /><div className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">URL: /org/{form.slug}</div></div>
        <div><label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">LOGO URL</label><input type="url" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className="futuristic-input w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-sm" /></div>
        <div className="flex justify-end"><Button type="submit">Simpan (Demo)</Button></div>
      </form>
    </CyberCard>
  );
}

function WhatsAppSettingsTab() {
  const defaultConfig = { enabled: false, provider: 'fonnte', apiKey: '', phoneNumber: '', notifyOnDeviceOnline: true, notifyOnDeviceOffline: true, notifyOnGeofence: true, notifyOnSpeeding: true, notifyOnSOS: true, dailyReport: false, dailyReportTime: '08:00' };
  const [config, setConfig] = useState(defaultConfig);
  const handleSave = (newConfig: any) => { setConfig(newConfig); alert('Pengaturan WhatsApp berhasil disimpan!'); };
  return <WhatsAppSettings config={config} onSave={handleSave} />;
}
