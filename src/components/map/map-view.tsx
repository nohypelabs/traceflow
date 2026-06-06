'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { useSocket } from '@/hooks/use-socket';

type LeafletType = typeof import('leaflet');

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
  /** Bump this when parent container size changes (e.g. right sidebar toggle) to trigger invalidateSize */
  resizeKey?: number;
  /** Bump to re-center/fit all current devices (wired to "Center All" button) */
  fitKey?: number;
}

export default function MapView({ devices: initialDevices, resizeKey, fitKey }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const leafletRef = useRef<LeafletType | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [devices, setDevices] = useState(initialDevices);
  const { socket } = useSocket();

  // Helper to (re)draw markers - defined once per render
  const updateMarkers = (L: any, map: any, devs: Device[]) => {
    const markers = markersRef.current;

    // Clear existing markers
    markers.forEach((marker) => marker.remove());
    markers.clear();

    // Add device markers
    devs.forEach((device) => {
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
      map.fitBounds(group.getBounds().pad(0.18));
    }
  };

  // Initialize map (lazy import leaflet to avoid any SSR / module eval of browser globals)
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    import('leaflet').then((Lmod) => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      const L = Lmod.default;
      leafletRef.current = L;

      const map = L.map(mapRef.current).setView([-6.2088, 106.8456], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapInstanceRef.current = map;

      // Force the leaflet container to truly fill (some layouts + dynamic mount leave it partial)
      const container = map.getContainer();
      if (container) {
        container.style.height = '100%';
        container.style.width = '100%';
      }

      // Draw initial markers immediately after map is ready (current devices from this render)
      updateMarkers(L, map, devices);

      // Robust sizing for h-full / flex / dynamic layouts:
      // 1. ResizeObserver keeps map filling its container whenever parent size changes (sidebar, window, etc.)
      if (mapRef.current) {
        const ro = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            try { mapInstanceRef.current.invalidateSize(); } catch {}
          }
        });
        ro.observe(mapRef.current);
        resizeObserverRef.current = ro;
      }

      // 2. Multiple invalidates + rAF to catch late layout (fixes "setengah / half" render)
      requestAnimationFrame(() => {
        try { map.invalidateSize(); } catch {}
      });
      setTimeout(() => {
        try { map.invalidateSize(); } catch {}
      }, 0);
      setTimeout(() => {
        try { map.invalidateSize(); } catch {}
      }, 80);
      setTimeout(() => {
        try { map.invalidateSize(); } catch {}
      }, 200);
    });

    return () => {
      cancelled = true;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      leafletRef.current = null;
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

  // Update markers when devices change (or after map becomes ready via setDevices)
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;
    updateMarkers(L, map, devices);

    // Re-validate size in case container changed (e.g. sidebar, responsive)
    setTimeout(() => {
      try { map.invalidateSize(); } catch {}
    }, 10);
  }, [devices]);

  // Handle explicit resizes from parent (sidebar toggle etc)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setTimeout(() => {
      try { map.invalidateSize(); } catch {}
    }, 30);
  }, [resizeKey]);

  // Re-fit / center on all devices when "Center All" is clicked (or fitKey bumped)
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    const valid = devices.filter((d) => d.lastLatitude != null && d.lastLongitude != null);
    if (valid.length === 0) return;

    if (valid.length === 1) {
      map.setView([valid[0].lastLatitude!, valid[0].lastLongitude!], 13);
      return;
    }

    // Build a temporary feature group just for bounds calculation
    const group = L.featureGroup(
      valid.map((d) => L.marker([d.lastLatitude!, d.lastLongitude!]))
    );
    map.fitBounds(group.getBounds().pad(0.18));

    // Make sure the map knows its current pixel size
    setTimeout(() => {
      try { map.invalidateSize(); } catch {}
    }, 10);
  }, [fitKey]);

  return (
    <div 
      ref={mapRef} 
      className="h-full w-full min-h-[400px]" 
      style={{ height: '100%', width: '100%' }}
    />
  );
}
