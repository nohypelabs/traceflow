'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-provider';
import { Button } from '@/components/ui/button';
import { User, Building, Save, Loader2, MessageCircle, Globe } from 'lucide-react';
import { FadeIn, SlideUp } from '@/components/ui/animation';
import { Card, Flex, Box, Heading, Text, Tabs, Separator } from '@radix-ui/themes';
import { WhatsAppSettings } from '@/components/ui/whatsapp-settings';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

type Tab = 'profile' | 'organization' | 'whatsapp' | 'language';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  return (
    <FadeIn className="space-y-4">
      <Heading size="6">Pengaturan</Heading>

      <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)}>
        <Tabs.List>
          <Tabs.Trigger value="profile">
            <Flex align="center" gap="2">
              <User className="h-4 w-4" />
              Profil
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="organization">
            <Flex align="center" gap="2">
              <Building className="h-4 w-4" />
              Organisasi
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="whatsapp">
            <Flex align="center" gap="2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="language">
            <Flex align="center" gap="2">
              <Globe className="h-4 w-4" />
              Bahasa
            </Flex>
          </Tabs.Trigger>
        </Tabs.List>

        <Box pt="4">
          <Tabs.Content value="profile">
            <ProfileSettings />
          </Tabs.Content>
          <Tabs.Content value="organization">
            <OrganizationSettings />
          </Tabs.Content>
          <Tabs.Content value="whatsapp">
            <WhatsAppSettingsTab />
          </Tabs.Content>
          <Tabs.Content value="language">
            <LanguageSwitcher />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </FadeIn>
  );
}

function ProfileSettings() {
  const { data: session } = api.auth.getSession.useQuery();
  const utils = api.useUtils();

  const [form, setForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
      }));
    }
  }, [session]);

  const updateProfileMutation = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      setSuccess('Profil berhasil diperbarui');
      setError('');
      utils.auth.getSession.invalidate();
    },
    onError: (err) => {
      setError(err.message);
      setSuccess('');
    },
  });

  const changePasswordMutation = api.auth.changePassword.useMutation({
    onSuccess: () => {
      setSuccess('Kata sandi berhasil diubah');
      setError('');
      setForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    },
    onError: (err) => {
      setError(err.message);
      setSuccess('');
    },
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      name: form.name,
      email: form.email,
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Kata sandi baru tidak cocok');
      return;
    }

    if (form.newPassword.length < 8) {
      setError('Kata sandi harus minimal 8 karakter');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  };

  return (
    <Flex direction="column" gap="6">
      {/* Profile Form */}
      <SlideUp delay={0.1}>
        <Card className="p-6">
          <Heading size="4" mb="4">Informasi Profil</Heading>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Nama</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Nama Anda"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="email@anda.com"
                />
              </div>
            </div>
            <Flex justify="end">
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Simpan Perubahan
              </Button>
            </Flex>
          </form>
        </Card>
      </SlideUp>

      {/* Password Form */}
      <SlideUp delay={0.2}>
        <Card className="p-6">
          <Heading size="4" mb="4">Ubah Kata Sandi</Heading>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Kata Sandi Saat Ini</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Kata Sandi Baru</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  required
                  minLength={8}
                />
              </div>
            </div>
            <Flex justify="end">
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Ubah Kata Sandi
              </Button>
            </Flex>
          </form>
        </Card>
      </SlideUp>

      {/* Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <Text color="red">{error}</Text>
        </Card>
      )}
      {success && (
        <Card className="border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <Text color="green">{success}</Text>
        </Card>
      )}
    </Flex>
  );
}

function OrganizationSettings() {
  const { data: session } = api.auth.getSession.useQuery();
  const { data: organization, isLoading } = api.organization.getById.useQuery(
    { id: session?.user?.organizationId ?? '' },
    { enabled: !!session?.user?.organizationId }
  );

  const utils = api.useUtils();
  const [form, setForm] = useState({
    name: '',
    slug: '',
    logo: '',
  });

  useEffect(() => {
    if (organization) {
      setForm({
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo ?? '',
      });
    }
  }, [organization]);

  const updateMutation = api.organization.update.useMutation({
    onSuccess: () => {
      utils.organization.getById.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.organizationId) return;

    updateMutation.mutate({
      id: session.user.organizationId,
      ...form,
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </Card>
    );
  }

  if (!organization) {
    return (
      <Card className="p-6">
        <Text color="gray">Tidak ada organisasi ditemukan</Text>
      </Card>
    );
  }

  return (
    <SlideUp>
      <Card className="p-6">
        <Heading size="4" mb="4">Pengaturan Organisasi</Heading>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nama Organisasi</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full rounded-lg border px-3 py-2"
              required
            />
            <Text size="1" color="gray" mt="1">
              Digunakan di URL: /org/{form.slug}
            </Text>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">URL Logo</label>
            <input
              type="url"
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="https://contoh.com/logo.png"
            />
          </div>
          <Flex justify="end">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Simpan Perubahan
            </Button>
          </Flex>
        </form>
      </Card>
    </SlideUp>
  );
}

function WhatsAppSettingsTab() {
  // Default WhatsApp config - in production, load from database
  const defaultConfig = {
    enabled: false,
    provider: 'fonnte',
    apiKey: '',
    phoneNumber: '',
    notifyOnDeviceOnline: true,
    notifyOnDeviceOffline: true,
    notifyOnGeofence: true,
    notifyOnSpeeding: true,
    notifyOnSOS: true,
    dailyReport: false,
    dailyReportTime: '08:00',
  };

  const [config, setConfig] = useState(defaultConfig);

  const handleSave = async (newConfig: any) => {
    // In production, save to database via API
    setConfig(newConfig);
    alert('Pengaturan WhatsApp berhasil disimpan!');
  };

  return <WhatsAppSettings config={config} onSave={handleSave} />;
}
