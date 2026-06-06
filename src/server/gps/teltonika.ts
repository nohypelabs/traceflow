import type { GpsProviderAdapter } from './provider-adapter';
import type { DeviceLocation, ParsedWebhookPayload } from '@/types';

/**
 * Teltonika GPS provider adapter.
 * Supports Teltonika FM series devices.
 * 
 * Webhook payload format:
 * {
 *   "imei": "123456789012345",
 *   "timestamp": 1234567890,
 *   "latitude": -6.2088,
 *   "longitude": 106.8456,
 *   "altitude": 100,
 *   "speed": 60,
 *   "heading": 180,
 *   "satellites": 8,
 *   "ignition": 1,
 *   "din1": 1,
 *   "ain1": 12.5
 * }
 */
export class TeltonikaAdapter implements GpsProviderAdapter {
  async getDeviceLocation(providerDeviceId: string): Promise<DeviceLocation> {
    // Teltonika devices push data via webhook, so this is a fallback
    // In production, you would query the device via TCP/UDP or API
    throw new Error('Teltonika devices use webhook push. Use webhook endpoint instead.');
  }

  async getDeviceHistory(
    providerDeviceId: string,
    from: Date,
    to: Date,
  ): Promise<DeviceLocation[]> {
    // History is stored in database from webhook pushes
    throw new Error('Teltonika history is stored in database from webhook pushes.');
  }

  parseWebhookPayload(raw: unknown): ParsedWebhookPayload {
    const data = raw as Record<string, unknown>;

    // Validate required fields
    const imei = data['imei'] as string;
    if (!imei) {
      throw new Error('Missing IMEI in Teltonika webhook payload');
    }

    const timestamp = data['timestamp'] as number;
    const latitude = data['latitude'] as number;
    const longitude = data['longitude'] as number;

    if (latitude === undefined || longitude === undefined) {
      throw new Error('Missing coordinates in Teltonika webhook payload');
    }

    return {
      provider: 'TELTONIKA',
      deviceId: imei,
      locations: [
        {
          deviceId: imei,
          latitude,
          longitude,
          altitude: (data['altitude'] as number) ?? undefined,
          speed: (data['speed'] as number) ?? undefined,
          heading: (data['heading'] as number) ?? undefined,
          satellites: (data['satellites'] as number) ?? undefined,
          ignition: data['ignition'] === 1 || data['ignition'] === true,
          timestamp: timestamp ? new Date(timestamp * 1000) : new Date(),
        },
      ],
    };
  }
}
