'use client';

import { useEffect, useState } from 'react';
import { useSocket } from './use-socket';

interface DeviceLocationUpdate {
  deviceId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  ignition?: boolean;
  timestamp: string;
}

interface UseDeviceLocationReturn {
  locations: Map<string, DeviceLocationUpdate>;
  isConnected: boolean;
}

export function useDeviceLocation(): UseDeviceLocationReturn {
  const { socket, isConnected } = useSocket();
  const [locations, setLocations] = useState<Map<string, DeviceLocationUpdate>>(
    new Map(),
  );

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data: DeviceLocationUpdate) => {
      setLocations((prev) => {
        const next = new Map(prev);
        next.set(data.deviceId, data);
        return next;
      });
    };

    socket.on('device:update', handleUpdate);

    return () => {
      socket.off('device:update', handleUpdate);
    };
  }, [socket]);

  return { locations, isConnected };
}
