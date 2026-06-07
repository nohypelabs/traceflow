import { prisma } from '@/lib/prisma';
import { getGpsAdapter } from '@/server/gps';
import { ingestGpsLocation } from '@/server/gps/ingest';
import { NextResponse } from 'next/server';

const GPS_PROVIDERS = ['TELTONIKA', 'QUECLINK', 'CONCOX', 'MOCK'] as const;
type GpsProvider = (typeof GPS_PROVIDERS)[number];

function isGpsProvider(value: string): value is GpsProvider {
  return GPS_PROVIDERS.includes(value as GpsProvider);
}

/**
 * Webhook receiver for GPS provider push notifications.
 * Each provider sends location updates here.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Webhook authentication
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (process.env.NODE_ENV === 'production' && !webhookSecret) {
      console.error('WEBHOOK_SECRET is required in production');
      return NextResponse.json(
        { error: 'Webhook is not configured' },
        { status: 503 },
      );
    }

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rawBody = await request.json();
    const providerHeader = (request.headers.get('x-gps-provider') ?? 'MOCK').toUpperCase();

    if (!isGpsProvider(providerHeader)) {
      return NextResponse.json(
        { error: `Unsupported GPS provider: ${providerHeader}` },
        { status: 400 },
      );
    }

    const adapter = getGpsAdapter(providerHeader);
    const payload = adapter.parseWebhookPayload(rawBody);
    let processed = 0;
    let skipped = 0;

    // Find device by IMEI or provider device ID
    for (const loc of payload.locations) {
      const device = await prisma.device.findFirst({
        where: {
          imei: loc.deviceId,
          provider: providerHeader,
        },
      });

      if (!device) {
        console.warn(`Device not found: ${loc.deviceId}`);
        skipped += 1;
        continue;
      }

      await ingestGpsLocation(device.id, loc);
      processed += 1;
    }

    return NextResponse.json({ success: true, processed, skipped });
  } catch (error) {
    console.error('GPS webhook error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.startsWith('Missing ')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 },
    );
  }
}
