import type { GpsProviderAdapter } from './provider-adapter';
import type { DeviceLocation, ParsedWebhookPayload } from '@/types';

/**
 * Concox GPS provider adapter.
 * Supports Concox JM-VL01, JM-VL02, JM-VL03 series devices.
 * 
 * Webhook payload format (Concox proprietary protocol):
 * {
 *   "device_id": "123456789012345",
 *   "type": "location",
 *   "timestamp": 1234567890,
 *   "gps": {
 *     "valid": true,
 *     "latitude": -6.2088,
 *     "longitude": 106.8456,
 *     "altitude": 100,
 *     "speed": 60,
 *     "heading": 180,
 *     "satellites": 8
 *   },
 *   "status": {
 *   },
 *     "ignition": true,
 *     "power": true,
 *     "battery": 85,
 *     "sos": false
 *   }
 * }
 */
export class ConcoxAdapter implements GpsProviderAdapter {
  async getDeviceLocation(providerDeviceId: string): Promise<DeviceLocation> {
    // Concox devices push data via webhook, so this is a fallback
    throw new Error('Concox devices use webhook push. Use webhook endpoint instead.');
  }

  async getDeviceHistory(
    providerDeviceId: string,
    from: Date,
    to: Date,
  ): Promise<DeviceLocation[]> {
    // History is stored in database from webhook pushes
    throw new Error('Concox history is stored in database from webhook pushes.');
  }

  parseWebhookPayload(raw: unknown): ParsedWebhookPayload {
    const data = raw as Record<string, unknown>;

    // Validate required fields
    const deviceId = data['device_id'] as string;
    if (!deviceId) {
      throw new Error('Missing device_id in Concox webhook payload');
    }

    const gps = data['gps'] as Record<string, unknown>;
    if (!gps) {
      throw new Error('Missing GPS data in Concox webhook payload');
    }

    const latitude = gps['latitude'] as number;
    const longitude = gps['longitude'] as number;

    if (latitude === undefined || longitude === undefined) {
      throw new Error('Missing coordinates in Concox webhook payload');
    }

    const status = data['status'] as Record<string, unknown> | undefined;
    const timestamp = data['timestamp'] as number;

    return {
      provider: 'CONCOX',
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
          ignition: status?.['ignition'] === true,
          timestamp: timestamp ? new Date(timestamp * 1000) : new Date(),
        },
      ],
    };
  }
}
