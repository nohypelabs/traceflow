import type { GpsProviderAdapter } from './provider-adapter';
import type { DeviceLocation, ParsedWebhookPayload } from '@/types';

/**
 * Queclink GPS provider adapter.
 * Supports Queclink GL series devices (GL300, GL500, GL505, etc.)
 * 
 * Webhook payload format (Queclink proprietary protocol):
 * {
 *   "device_id": "123456789012345",
 *   "report_type": "heartbeat",
 *   "timestamp": "2024-01-01T00:00:00Z",
 *   "gps": {
 *     "fix": true,
 *     "latitude": -6.2088,
 *     "longitude": 106.8456,
 *     "altitude": 100,
 *     "speed": 60,
 *     "heading": 180,
 *     "satellites": 8
 *   },
 *   "io": {
 *     "ignition": true,
 *     "power": true,
 *     "battery": 85
 *   }
 * }
 */
export class QueclinkAdapter implements GpsProviderAdapter {
  async getDeviceLocation(providerDeviceId: string): Promise<DeviceLocation> {
    // Queclink devices push data via webhook, so this is a fallback
    throw new Error('Queclink devices use webhook push. Use webhook endpoint instead.');
  }

  async getDeviceHistory(
    providerDeviceId: string,
    from: Date,
    to: Date,
  ): Promise<DeviceLocation[]> {
    // History is stored in database from webhook pushes
    throw new Error('Queclink history is stored in database from webhook pushes.');
  }

  parseWebhookPayload(raw: unknown): ParsedWebhookPayload {
    const data = raw as Record<string, unknown>;

    // Validate required fields
    const deviceId = data['device_id'] as string;
    if (!deviceId) {
      throw new Error('Missing device_id in Queclink webhook payload');
    }

    const gps = data['gps'] as Record<string, unknown>;
    if (!gps) {
      throw new Error('Missing GPS data in Queclink webhook payload');
    }

    const latitude = gps['latitude'] as number;
    const longitude = gps['longitude'] as number;

    if (latitude === undefined || longitude === undefined) {
      throw new Error('Missing coordinates in Queclink webhook payload');
    }

    const io = data['io'] as Record<string, unknown> | undefined;
    const timestamp = data['timestamp'] as string;

    return {
      provider: 'QUECLINK',
      deviceId,
      locations: [
        {
          deviceId,
          latitude,
          longitude,
          altitude: (gps['altitude'] as number) ?? undefined,
          speed: (gps['speed'] as number) ?? undefined,
          heading: (gps['heading'] as number) ?? undefined,
          satellites: (gps['satellites'] as number) ?? undefined,
          ignition: io?.['ignition'] === true,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
        },
      ],
    };
  }
}
