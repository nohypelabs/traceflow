import { prisma } from '@/lib/prisma';
import { getGpsAdapter } from '@/server/gps';
import { NextResponse } from 'next/server';
import { emitToAll, emitToDevice } from '@/lib/socket';

// Haversine formula to calculate distance between two points
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Check if point is inside polygon
function isPointInPolygon(
  lat: number,
  lng: number,
  polygon: [number, number][]
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];

    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Check geofences for a device
async function checkGeofences(deviceId: string, lat: number, lng: number) {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: {
      geofenceDevices: {
        include: { geofence: true },
      },
    },
  });

  if (!device) return;

  // Hoist lastLocation query outside loop
  const lastLocation = await prisma.location.findFirst({
    where: { deviceId },
    orderBy: { recordedAt: 'desc' },
    skip: 1,
  });

  for (const gd of device.geofenceDevices) {
    const geofence = gd.geofence;
    let isInside = false;

    if (geofence.type === 'CIRCLE' && geofence.centerLat && geofence.centerLng && geofence.radius) {
      const distance = getDistance(lat, lng, geofence.centerLat, geofence.centerLng);
      isInside = distance <= geofence.radius;
    } else if (geofence.type === 'POLYGON' && geofence.polygon) {
      const polygon = geofence.polygon as [number, number][];
      isInside = isPointInPolygon(lat, lng, polygon);
    }

    if (lastLocation) {
      let wasInside = false;
      if (geofence.type === 'CIRCLE' && geofence.centerLat && geofence.centerLng && geofence.radius) {
        const distance = getDistance(
          lastLocation.latitude,
          lastLocation.longitude,
          geofence.centerLat,
          geofence.centerLng
        );
        wasInside = distance <= geofence.radius;
      } else if (geofence.type === 'POLYGON' && geofence.polygon) {
        const polygon = geofence.polygon as [number, number][];
        wasInside = isPointInPolygon(lastLocation.latitude, lastLocation.longitude, polygon);
      }

      // Create alert if status changed
      if (isInside && !wasInside) {
        // Entered geofence
        await prisma.alert.create({
          data: {
            deviceId,
            geofenceId: geofence.id,
            type: 'GEOFENCE_ENTER',
            severity: 'INFO',
            message: `Device entered ${geofence.name}`,
            latitude: lat,
            longitude: lng,
          },
        });

        emitToAll('alert:new', {
          type: 'GEOFENCE_ENTER',
          deviceId,
          geofenceName: geofence.name,
          message: `Device entered ${geofence.name}`,
        });
      } else if (!isInside && wasInside) {
        // Exited geofence
        await prisma.alert.create({
          data: {
            deviceId,
            geofenceId: geofence.id,
            type: 'GEOFENCE_EXIT',
            severity: 'INFO',
            message: `Device exited ${geofence.name}`,
            latitude: lat,
            longitude: lng,
          },
        });

        emitToAll('alert:new', {
          type: 'GEOFENCE_EXIT',
          deviceId,
          geofenceName: geofence.name,
          message: `Device exited ${geofence.name}`,
        });
      }
    }
  }
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
    
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const rawBody = await request.json();
    const providerHeader = request.headers.get('x-gps-provider') ?? 'MOCK';

    const adapter = getGpsAdapter(providerHeader as never);
    const payload = adapter.parseWebhookPayload(rawBody);

    // Find device by IMEI or provider device ID
    for (const loc of payload.locations) {
      const device = await prisma.device.findFirst({
        where: {
          imei: loc.deviceId,
          provider: providerHeader as never,
        },
      });

      if (!device) {
        console.warn(`Device not found: ${loc.deviceId}`);
        continue;
      }

      // Save location
      await prisma.location.create({
        data: {
          deviceId: device.id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          altitude: loc.altitude,
          speed: loc.speed,
          heading: loc.heading,
          ignition: loc.ignition,
          satellites: loc.satellites,
          recordedAt: loc.timestamp,
        },
      });

      // Update device last known position
      await prisma.device.update({
        where: { id: device.id },
        data: {
          lastLatitude: loc.latitude,
          lastLongitude: loc.longitude,
          lastSpeed: loc.speed ?? null,
          lastHeading: loc.heading ?? null,
          lastIgnition: loc.ignition ?? null,
          lastSeenAt: new Date(),
          status: 'ONLINE',
        },
      });

      // Check geofences
      await checkGeofences(device.id, loc.latitude, loc.longitude);

      // Emit Socket.IO event for real-time dashboard update
      const updateData = {
        deviceId: device.id,
        latitude: loc.latitude,
        longitude: loc.longitude,
        speed: loc.speed,
        heading: loc.heading,
        ignition: loc.ignition,
        timestamp: loc.timestamp,
      };

      // Emit to all clients
      emitToAll('device:update', updateData);

      // Emit to device-specific room
      emitToDevice(device.id, 'device:location', updateData);
    }

    return NextResponse.json({ success: true, processed: payload.locations.length });
  } catch (error) {
    console.error('GPS webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 },
    );
  }
}
