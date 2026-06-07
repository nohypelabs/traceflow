import { prisma } from '@/lib/prisma';
import { emitToAll, emitToDevice } from '@/lib/socket';
import type { DeviceLocation } from '@/types';

export interface IngestGpsLocation extends DeviceLocation {
  accuracy?: number;
}

function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const earthRadius = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2)
    + Math.cos(phi1)
      * Math.cos(phi2)
      * Math.sin(deltaLambda / 2)
      * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

function isPointInPolygon(
  lat: number,
  lng: number,
  polygon: [number, number][],
): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersect =
      yi > lng !== yj > lng
      && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

async function checkGeofences(
  deviceId: string,
  latitude: number,
  longitude: number,
): Promise<void> {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: {
      geofenceDevices: {
        include: { geofence: true },
      },
    },
  });

  if (!device) {
    return;
  }

  const lastLocation = await prisma.location.findFirst({
    where: { deviceId },
    orderBy: { recordedAt: 'desc' },
    skip: 1,
  });

  for (const geofenceDevice of device.geofenceDevices) {
    const geofence = geofenceDevice.geofence;
    let isInside = false;

    if (
      geofence.type === 'CIRCLE'
      && geofence.centerLat
      && geofence.centerLng
      && geofence.radius
    ) {
      isInside =
        getDistance(
          latitude,
          longitude,
          geofence.centerLat,
          geofence.centerLng,
        ) <= geofence.radius;
    } else if (geofence.type === 'POLYGON' && geofence.polygon) {
      isInside = isPointInPolygon(
        latitude,
        longitude,
        geofence.polygon as [number, number][],
      );
    }

    if (!lastLocation) {
      continue;
    }

    let wasInside = false;
    if (
      geofence.type === 'CIRCLE'
      && geofence.centerLat
      && geofence.centerLng
      && geofence.radius
    ) {
      wasInside =
        getDistance(
          lastLocation.latitude,
          lastLocation.longitude,
          geofence.centerLat,
          geofence.centerLng,
        ) <= geofence.radius;
    } else if (geofence.type === 'POLYGON' && geofence.polygon) {
      wasInside = isPointInPolygon(
        lastLocation.latitude,
        lastLocation.longitude,
        geofence.polygon as [number, number][],
      );
    }

    if (isInside === wasInside) {
      continue;
    }

    const entered = isInside && !wasInside;
    const type = entered ? 'GEOFENCE_ENTER' : 'GEOFENCE_EXIT';
    const direction = entered ? 'entered' : 'exited';
    const message = `Device ${direction} ${geofence.name}`;

    await prisma.alert.create({
      data: {
        deviceId,
        geofenceId: geofence.id,
        type,
        severity: 'INFO',
        message,
        latitude,
        longitude,
      },
    });

    emitToAll('alert:new', {
      type,
      deviceId,
      geofenceName: geofence.name,
      message,
    });
  }
}

export async function ingestGpsLocation(
  deviceId: string,
  location: IngestGpsLocation,
): Promise<void> {
  await prisma.location.create({
    data: {
      deviceId,
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: location.altitude,
      speed: location.speed,
      heading: location.heading,
      ignition: location.ignition,
      satellites: location.satellites,
      accuracy: location.accuracy,
      recordedAt: location.timestamp,
    },
  });

  await prisma.device.update({
    where: { id: deviceId },
    data: {
      lastLatitude: location.latitude,
      lastLongitude: location.longitude,
      lastSpeed: location.speed ?? null,
      lastHeading: location.heading ?? null,
      lastIgnition: location.ignition ?? null,
      lastSeenAt: new Date(),
      status: 'ONLINE',
    },
  });

  await checkGeofences(deviceId, location.latitude, location.longitude);

  const updateData = {
    deviceId,
    latitude: location.latitude,
    longitude: location.longitude,
    speed: location.speed,
    heading: location.heading,
    ignition: location.ignition,
    timestamp: location.timestamp,
  };

  emitToAll('device:update', updateData);
  emitToDevice(deviceId, 'device:location', updateData);
}
