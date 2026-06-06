'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSocket } from '@/hooks/use-socket';

interface Device {
  id: string;
  name: string;
  status: string;
  lastLatitude: number | null;
  lastLongitude: number | null;
  vehiclePlate: string | null;
}

interface MapViewProps {
  devices: Device[];
}

export default function MapView({ devices: initialDevices }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [devices, setDevices] = useState(initialDevices);
  const { socket } = useSocket();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([-6.2088, 106.8456], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update devices when props change
  useEffect(() => {
    setDevices(initialDevices);
  }, [initialDevices]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleDeviceUpdate = (data: any) => {
      setDevices((prev) =>
        prev.map((device) =>
          device.id === data.deviceId
            ? {
                ...device,
                lastLatitude: data.latitude,
                lastLongitude: data.longitude,
                status: 'ONLINE',
              }
            : device
        )
      );
    };

    socket.on('device:update', handleDeviceUpdate);

    return () => {
      socket.off('device:update', handleDeviceUpdate);
    };
  }, [socket]);

  // Update markers when devices change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const markers = markersRef.current;

    // Clear existing markers
    markers.forEach((marker) => marker.remove());
    markers.clear();

    // Add device markers
    devices.forEach((device) => {
      if (!device.lastLatitude || !device.lastLongitude) return;

      const statusColors: Record<string, string> = {
        ONLINE: '#22c55e',
        OFFLINE: '#a1a1aa',
        IDLE: '#eab308',
      };

      const color = statusColors[device.status] ?? '#a1a1aa';

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="position: relative; width: 32px; height: 32px;">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 24px;
              height: 24px;
              background: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              transition: all 0.3s ease;
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([device.lastLatitude, device.lastLongitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 150px;">
            <strong>${device.name}</strong>
            ${device.vehiclePlate ? `<br/><span style="color: #666;">${device.vehiclePlate}</span>` : ''}
            <br/><span style="color: ${color};">${device.status}</span>
          </div>
        `);

      markers.set(device.id, marker);
    });

    // Fit bounds if devices exist
    if (markers.size > 0) {
      const group = L.featureGroup(Array.from(markers.values()));
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [devices]);

  return <div ref={mapRef} className="h-full w-full" />;
}
