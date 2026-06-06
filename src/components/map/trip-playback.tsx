'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  speed?: number | null;
  heading?: number | null;
  recordedAt: Date | string;
}

interface TripPlaybackMapProps {
  locations: Location[];
  progress: number;
  onProgressChange: (progress: number) => void;
}

export default function TripPlaybackMap({
  locations,
  progress,
  onProgressChange,
}: TripPlaybackMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

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

  // Draw route when locations change
  useEffect(() => {
    if (!mapInstanceRef.current || !locations.length) return;

    const map = mapInstanceRef.current;

    // Remove existing route and marker
    if (routeRef.current) {
      routeRef.current.remove();
    }
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create route polyline
    const latlngs = locations.map((loc) => [loc.latitude, loc.longitude] as L.LatLngExpression);
    routeRef.current = L.polyline(latlngs, {
      color: '#3b82f6',
      weight: 3,
      opacity: 0.7,
    }).addTo(map);

    // Fit bounds
    map.fitBounds(routeRef.current.getBounds().pad(0.1));

    // Add start marker
    const startIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: #22c55e;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    L.marker(latlngs[0] as L.LatLngExpression, { icon: startIcon })
      .addTo(map)
      .bindPopup('Start');

    // Add end marker
    const endIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: #ef4444;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    L.marker(latlngs[latlngs.length - 1] as L.LatLngExpression, { icon: endIcon })
      .addTo(map)
      .bindPopup('End');
  }, [locations]);

  // Update playback marker when progress changes
  useEffect(() => {
    if (!mapInstanceRef.current || !locations.length) return;

    const map = mapInstanceRef.current;
    const index = Math.min(
      Math.floor((progress / 100) * locations.length),
      locations.length - 1
    );
    const location = locations[index];

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create playback marker
    const playbackIcon = L.divIcon({
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
            background: #8b5cf6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
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

    markerRef.current = L.marker([location.latitude, location.longitude], {
      icon: playbackIcon,
    })
      .addTo(map)
      .bindPopup(
        `<div>
          <strong>Time: ${new Date(location.recordedAt).toLocaleTimeString()}</strong>
          ${location.speed ? `<br/>Speed: ${Math.round(location.speed)} km/h` : ''}
        </div>`
      )
      .openPopup();

    // Pan to marker
    map.panTo([location.latitude, location.longitude]);
  }, [progress, locations]);

  return <div ref={mapRef} className="h-full w-full" />;
}
