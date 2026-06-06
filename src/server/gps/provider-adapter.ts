import type { DeviceLocation, ParsedWebhookPayload } from '@/types';

/**
 * Abstract interface that every GPS provider must implement.
 * Add new providers by creating a new file and registering it in the factory.
 */
export interface GpsProviderAdapter {
  getDeviceLocation(providerDeviceId: string): Promise<DeviceLocation>;
  getDeviceHistory(
    providerDeviceId: string,
    from: Date,
    to: Date,
  ): Promise<DeviceLocation[]>;
  parseWebhookPayload(raw: unknown): ParsedWebhookPayload;
}

export type GpsProviderType = 'TELTONIKA' | 'QUECLINK' | 'CONCOX' | 'MOCK';
