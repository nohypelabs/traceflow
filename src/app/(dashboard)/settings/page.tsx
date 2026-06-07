'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-provider';
import { User, Building, Save, Loader2, MessageCircle, Globe } from 'lucide-react';
import { FadeIn, SlideUp } from '@/components/ui/animation';
import { PageWrapper, CyberCard } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { WhatsAppSettings } from '@/components/ui/whatsapp-settings';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ProfilePhoto } from '@/components/ui/profile-photo';
import { ROLE_HIERARCHY } from '@/lib/roles';

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
  const { data: profile, isLoading: profileLoading } = api.profile.getProfile.useQuery();

  const [form, setForm] = useState({ name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync form with profile data
  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name ?? '' });
    }
  }, [profile]);

  const updateProfileMutation = api.profile.updateProfile.useMutation({
    onSuccess: () => {
      setSuccess('Profil berhasil diperbarui');
      setError('');
      utils.profile.getProfile.invalidate();
    },
    onError: (e) => {
      setError(e.message);
      setSuccess('');
    },
  });

  const changePasswordMutation = api.auth.changePassword.useMutation({
    onSuccess: () => {
      setSuccess('Kata sandi berhasil diubah');
      setError('');
      setForm((p) => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' }));
    },
    onError: (e) => {
      setError(e.message);
      setSuccess('');
    },
  });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    USER: 'User',
    VIEWER: 'Viewer',
  };

  return (
    <div className="space-y-4">
      {/* Profile Card with Photo */}
      <CyberCard className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Photo */}
          <div className="flex-shrink-0">
            <ProfilePhoto
              currentUrl={profile?.image}
              userName={profile?.name}
              onUploaded={() => utils.profile.getProfile.invalidate()}
              onDeleted={() => utils.profile.getProfile.invalidate()}
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="text-lg font-semibold tracking-tight">{profile?.name ?? 'Tanpa Nama'}</div>
              <div className="text-sm text-zinc-500 font-mono">{profile?.email}</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-medium text-cyan-400 uppercase tracking-wider">
                  {roleLabel[profile?.role ?? ''] ?? profile?.role}
                </span>
                <span className="text-[10px] text-zinc-400">
                  Level {ROLE_HIERARCHY[profile?.role ?? ''] ?? 0}
                </span>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate({ name: form.name }); }} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">NAMA</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="futuristic-input w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-900 dark:text-white"
                  minLength={2}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">EMAIL</label>
                <input
                  type="email"
                  value={profile?.email ?? ''}
                  disabled
                  className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900/40 px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
                />
                <p className="mt-1 text-[10px] text-zinc-400">Email tidak bisa diubah</p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CyberCard>

      {/* Password Card */}
      <CyberCard className="p-6">
        <div className="mb-5 text-lg font-semibold tracking-tight">Ubah Kata Sandi</div>
        <form onSubmit={(e) => {
          e.preventDefault(); setError('');
          if (passwords.newPassword !== passwords.confirmPassword) { setError('Kata sandi baru tidak cocok'); return; }
          if (passwords.newPassword.length < 8) { setError('Minimal 8 karakter'); return; }
          changePasswordMutation.mutate({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
        }} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">KATA SANDI SAAT INI</label>
            <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="futuristic-input w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-900 dark:text-white" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">KATA SANDI BARU</label>
              <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="futuristic-input w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-900 dark:text-white" minLength={8} required />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] tracking-[1.5px] text-zinc-400">KONFIRMASI</label>
              <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="futuristic-input w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-900 dark:text-white" minLength={8} required />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Ubah Kata Sandi
            </Button>
          </div>
        </form>
      </CyberCard>

      {error && <CyberCard className="border-red-500/30 bg-red-950/30 dark:bg-red-950/30 bg-red-50 p-4 text-red-600 dark:text-red-300">{error}</CyberCard>}
      {success && <CyberCard className="border-emerald-500/30 bg-emerald-950/30 dark:bg-emerald-950/30 bg-emerald-50 p-4 text-emerald-600 dark:text-emerald-300">{success}</CyberCard>}
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
