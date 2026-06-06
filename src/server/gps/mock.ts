import type { GpsProviderAdapter } from './provider-adapter';
import type { DeviceLocation, ParsedWebhookPayload } from '@/types';

/**
 * Mock GPS provider for development.
 * Returns simulated positions around Jakarta.
 */
export class MockGpsProvider implements GpsProviderAdapter {
  async getDeviceLocation(_providerDeviceId: string): Promise<DeviceLocation> {
    return {
      deviceId: _providerDeviceId,
      latitude: -6.2088 + (Math.random() - 0.5) * 0.02,
      longitude: 106.8456 + (Math.random() - 0.5) * 0.02,
      speed: Math.random() * 80,
      heading: Math.random() * 360,
      ignition: Math.random() > 0.3,
      timestamp: new Date(),
    };
  }

  async getDeviceHistory(
    providerDeviceId: string,
    from: Date,
    to: Date,
  ): Promise<DeviceLocation[]> {
    const locations: DeviceLocation[] = [];
    const duration = to.getTime() - from.getTime();
    const points = Math.min(Math.floor(duration / 30000), 100); // 1 point per 30s

    for (let i = 0; i < points; i++) {
      const t = new Date(from.getTime() + (duration * i) / points);
      locations.push({
        deviceId: providerDeviceId,
        latitude: -6.2088 + Math.sin(i * 0.1) * 0.01,
        longitude: 106.8456 + Math.cos(i * 0.1) * 0.01,
        speed: 20 + Math.random() * 40,
        heading: (i * 15) % 360,
        ignition: true,
        timestamp: t,
      });
    }

    return locations;
  }

  parseWebhookPayload(raw: unknown): ParsedWebhookPayload {
    const data = raw as Record<string, unknown>;
    return {
      provider: 'MOCK',
      deviceId: (data['deviceId'] as string) ?? 'mock-device',
      locations: [
        {
          deviceId: (data['deviceId'] as string) ?? 'mock-device',
          latitude: (data['lat'] as number) ?? -6.2088,
          longitude: (data['lng'] as number) ?? 106.8456,
          speed: (data['speed'] as number) ?? 0,
          timestamp: new Date(),
        },
      ],
    };
  }
}
