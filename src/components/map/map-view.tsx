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
  /** ID of the selected device — map will fly to it and highlight its marker */
  selectedDeviceId?: string | null;
}

export default function MapView({ devices: initialDevices, resizeKey, fitKey, selectedDeviceId }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const leafletRef = useRef<LeafletType | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [devices, setDevices] = useState(initialDevices);
  const { socket } = useSocket();

  // Helper to (re)draw markers - defined once per render
  const updateMarkers = (L: any, map: any, devs: Device[], selectedId?: string | null) => {
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
      const isSelected = device.id === selectedId;

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="position: relative; width: 48px; height: 48px;">
            ${isSelected ? `
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 44px;
              height: 44px;
              border: 2px solid ${color};
              border-radius: 50%;
              opacity: 0.4;
              animation: marker-pulse-ring 1.5s ease-out infinite;
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 36px;
              height: 36px;
              border: 2px solid ${color};
              border-radius: 50%;
              opacity: 0.25;
              animation: marker-pulse-ring 1.5s ease-out infinite 0.4s;
            "></div>
            ` : ''}
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: ${isSelected ? '28px' : '24px'};
              height: ${isSelected ? '28px' : '24px'};
              background: ${color};
              border: 3px solid ${isSelected ? '#ffffff' : 'white'};
              border-radius: 50%;
              box-shadow: ${isSelected
                ? `0 0 12px ${color}, 0 0 24px ${color}40, 0 2px 8px rgba(0,0,0,0.4)`
                : '0 2px 4px rgba(0,0,0,0.3)'
              };
              transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: ${isSelected ? '10px' : '8px'};
              height: ${isSelected ? '10px' : '8px'};
              background: white;
              border-radius: 50%;
              transition: all 0.4s ease;
            "></div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
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

      // Auto-open popup for selected device
      if (isSelected) {
        marker.openPopup();
      }

      markers.set(device.id, marker);
    });

    // Fit bounds if devices exist (only when no device is selected)
    if (markers.size > 0 && !selectedId) {
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
      updateMarkers(L, map, devices, selectedDeviceId);

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
    updateMarkers(L, map, devices, selectedDeviceId);

    // Re-validate size in case container changed (e.g. sidebar, responsive)
    setTimeout(() => {
      try { map.invalidateSize(); } catch {}
    }, 10);
  }, [devices, selectedDeviceId]);

  // Fly to selected device with realistic multi-step traverse animation
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedDeviceId) return;

    const device = devices.find((d) => d.id === selectedDeviceId);
    if (!device?.lastLatitude || !device?.lastLongitude) return;

    const targetLat = device.lastLatitude;
    const targetLng = device.lastLongitude;
    const targetZoom = 15;

    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    const curLat = currentCenter.lat;
    const curLng = currentCenter.lng;

    // Calculate distance (rough degrees) to decide transition style
    const dist = Math.sqrt(
      Math.pow(targetLat - curLat, 2) + Math.pow(targetLng - curLng, 2)
    );

    // Short distance (< ~0.05 degrees ≈ 5km): single smooth fly, no multi-step needed
    if (dist < 0.05) {
      map.flyTo([targetLat, targetLng], targetZoom, {
        duration: 0.8,
        easeLinearity: 0.3,
      });
      return;
    }

    // Long distance: multi-step "traverse" animation
    // Step 1: Zoom out to mid-level, fly toward midpoint between current and target
    // Step 2: Fly to target, zoom in

    const midLat = (curLat + targetLat) / 2;
    const midLng = (curLng + targetLng) / 2;
    const midZoom = Math.max(4, Math.min(currentZoom, 8));

    // Clean up any pending moveend listener
    const cleanup = () => {
      map.off('moveend', onStep1End);
    };

    const onStep1End = () => {
      map.off('moveend', onStep1End);

      // Step 2: From midpoint, fly to actual device and zoom in
      map.flyTo([targetLat, targetLng], targetZoom, {
        duration: 1.4,
        easeLinearity: 0.2,
      });
    };

    // Step 1: Zoom out and pan toward midpoint
    map.once('moveend', onStep1End);
    map.flyTo([midLat, midLng], midZoom, {
      duration: 0.9,
      easeLinearity: 0.25,
    });

    return cleanup;
  }, [selectedDeviceId, devices]);

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
    <>
      <style>{`
        @keyframes marker-pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
      <div
        ref={mapRef}
        className="h-full w-full min-h-[400px]"
        style={{ height: '100%', width: '100%' }}
      />
    </>
  );
}
