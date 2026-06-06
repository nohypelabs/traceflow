'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Loader2, MessageCircle, Send } from 'lucide-react';
import { Card, Flex, Box, Heading, Text, Switch } from '@radix-ui/themes';
import { sendWhatsApp, formatPhoneNumber, WhatsAppTemplates } from '@/lib/whatsapp';

interface WhatsAppSettingsProps {
  config: {
    enabled: boolean;
    provider: string;
    apiKey: string;
    phoneNumber: string;
    notifyOnDeviceOnline: boolean;
    notifyOnDeviceOffline: boolean;
    notifyOnGeofence: boolean;
    notifyOnSpeeding: boolean;
    notifyOnSOS: boolean;
    dailyReport: boolean;
    dailyReportTime: string;
  };
  onSave: (config: any) => void;
}

export function WhatsAppSettings({ config: initialConfig, onSave }: WhatsAppSettingsProps) {
  const [config, setConfig] = useState(initialConfig);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    await onSave(config);
    setLoading(false);
  };

  const handleTest = async () => {
    setLoading(true);
    setTestResult(null);

    const success = await sendWhatsApp(
      {
        provider: config.provider as any,
        apiKey: config.apiKey,
      },
      {
        to: formatPhoneNumber(config.phoneNumber),
        message: '🔔 *Test Notifikasi TraceFlow*\n\nIni adalah pesan test dari sistem TraceFlow.',
      }
    );

    setTestResult(success ? 'Pesan test berhasil dikirim!' : 'Gagal mengirim pesan test.');
    setLoading(false);
  };

  return (
    <Card className="p-6">
      <Flex align="center" gap="2" mb="4">
        <MessageCircle className="h-5 w-5 text-green-500" />
        <Heading size="4">Notifikasi WhatsApp</Heading>
      </Flex>

      <div className="space-y-4">
        {/* Enable/Disable */}
        <Flex align="center" justify="between">
          <Box>
            <Text weight="medium">Aktifkan Notifikasi</Text>
            <Text size="1" color="gray">Terima notifikasi via WhatsApp</Text>
          </Box>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
          />
        </Flex>

        {config.enabled && (
          <>
            {/* Provider Selection */}
            <div>
              <label className="mb-1 block text-sm font-medium">Provider WhatsApp</label>
              <select
                value={config.provider}
                onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="fonnte">Fonnte (Indonesia)</option>
                <option value="twilio">Twilio</option>
                <option value="whatsapp-web">WhatsApp Web</option>
              </select>
            </div>

            {/* API Key */}
            <div>
              <label className="mb-1 block text-sm font-medium">API Key</label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Masukkan API key"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-1 block text-sm font-medium">Nomor WhatsApp Tujuan</label>
              <input
                type="text"
                value={config.phoneNumber}
                onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="08xxxxxxxxxx"
              />
              <Text size="1" color="gray" mt="1">
                Format: 08xxxxxxxxxx atau +62xxxxxxxxxx
              </Text>
            </div>

            {/* Notification Types */}
            <Box className="border-t pt-4">
              <Text weight="medium" mb="3">Jenis Notifikasi</Text>
              <div className="space-y-3">
                <Flex align="center" justify="between">
                  <Text size="2">Perangkat Online</Text>
                  <Switch
                    checked={config.notifyOnDeviceOnline}
                    onCheckedChange={(checked) => setConfig({ ...config, notifyOnDeviceOnline: checked })}
                  />
                </Flex>
                <Flex align="center" justify="between">
                  <Text size="2">Perangkat Offline</Text>
                  <Switch
                    checked={config.notifyOnDeviceOffline}
                    onCheckedChange={(checked) => setConfig({ ...config, notifyOnDeviceOffline: checked })}
                  />
                </Flex>
                <Flex align="center" justify="between">
                  <Text size="2">Geofence (Masuk/Keluar)</Text>
                  <Switch
                    checked={config.notifyOnGeofence}
                    onCheckedChange={(checked) => setConfig({ ...config, notifyOnGeofence: checked })}
                  />
                </Flex>
                <Flex align="center" justify="between">
                  <Text size="2">Kecepatan Berlebih</Text>
                  <Switch
                    checked={config.notifyOnSpeeding}
                    onCheckedChange={(checked) => setConfig({ ...config, notifyOnSpeeding: checked })}
                  />
                </Flex>
                <Flex align="center" justify="between">
                  <Text size="2">SOS</Text>
                  <Switch
                    checked={config.notifyOnSOS}
                    onCheckedChange={(checked) => setConfig({ ...config, notifyOnSOS: checked })}
                  />
                </Flex>
              </div>
            </Box>

            {/* Daily Report */}
            <Box className="border-t pt-4">
              <Flex align="center" justify="between" mb="3">
                <Box>
                  <Text weight="medium">Laporan Harian</Text>
                  <Text size="1" color="gray">Kirim laporan harian via WhatsApp</Text>
                </Box>
                <Switch
                  checked={config.dailyReport}
                  onCheckedChange={(checked) => setConfig({ ...config, dailyReport: checked })}
                />
              </Flex>
              {config.dailyReport && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Waktu Kirim Laporan</label>
                  <input
                    type="time"
                    value={config.dailyReportTime}
                    onChange={(e) => setConfig({ ...config, dailyReportTime: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>
              )}
            </Box>

            {/* Test Button */}
            <Flex gap="2" className="border-t pt-4">
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={loading || !config.apiKey || !config.phoneNumber}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Test Kirim
              </Button>
              {testResult && (
                <Text size="2" color={testResult.includes('berhasil') ? 'green' : 'red'}>
                  {testResult}
                </Text>
              )}
            </Flex>
          </>
        )}

        {/* Save Button */}
        <Flex justify="end" className="border-t pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Simpan Pengaturan
          </Button>
        </Flex>
      </div>
    </Card>
  );
}
