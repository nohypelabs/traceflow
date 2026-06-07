'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Layers, Maximize2, Crosshair, Target, Sidebar, Search, ChevronDown, Radio, X } from 'lucide-react';
import { api } from '@/lib/api-provider';
import { PageWrapper, CyberCard } from '@/components/ui/page-wrapper';
import { NeonButton } from '@/components/ui/page-wrapper';

const MapView = dynamic(() => import('@/components/map/map-view'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-zinc-400">
      Loading map...
    </div>
  ),
});

function formatLastSeen(lastSeenAt: Date | string | null): string {
  if (!lastSeenAt) return 'Belum ada lokasi';

  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(lastSeenAt).getTime()) / 1000),
  );

  if (elapsedSeconds < 60) return `${elapsedSeconds}s lalu`;
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m lalu`;
  if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)}j lalu`;
  return `${Math.floor(elapsedSeconds / 86400)}h lalu`;
}

export default function MapPage() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [mapResizeKey, setMapResizeKey] = useState(0);
  const [fitKey, setFitKey] = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const devicesQuery = api.device.list.useQuery(undefined, {
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
  const devices = devicesQuery.data ?? [];
  const onlineCount = devices.filter((device) => device.status === 'ONLINE').length;
  const locatedCount = devices.filter(
    (device) => device.lastLatitude != null && device.lastLongitude != null,
  ).length;

  // Filtered & grouped devices for mobile bottom sheet
  const filteredDevices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = q
      ? devices.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            (d.vehiclePlate?.toLowerCase().includes(q) ?? false),
        )
      : devices;

    // Group by status: ONLINE → IDLE → OFFLINE
    const statusOrder: Record<string, number> = { ONLINE: 0, IDLE: 1, OFFLINE: 2 };
    return [...filtered].sort(
      (a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3),
    );
  }, [devices, searchQuery]);

  const toggleSidebar = () => {
    setShowSidebar((v) => !v);
    setMapResizeKey((k) => k + 1);
  };

  const handleCenterAll = () => {
    setFitKey((k) => k + 1);
  };

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceId((prev) => (prev === deviceId ? null : deviceId));
  };

  return (
    <PageWrapper
      title="Peta Live"
      subtitle="REAL-TIME POSITIONING • FLEET TRACKING"
      actions={
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:border-cyan-500/30 hover:bg-white/10 transition">
            <Layers className="h-3.5 w-3.5" /> Layers
          </button>
          <button 
            onClick={handleCenterAll}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:border-cyan-500/30 hover:bg-white/10 transition"
          >
            <Crosshair className="h-3.5 w-3.5" /> Center All
          </button>
          <NeonButton onClick={handleCenterAll}>
            <Target className="h-4 w-4 mr-1.5" /> Focus Live
          </NeonButton>
        </div>
      }
    >
      <div className="flex h-[calc(100vh-13rem)] min-h-[520px] gap-4">
        {/* Map Area */}
        <div className="flex-1 relative h-full">
          <CyberCard glow className="relative h-full overflow-hidden min-h-[520px]">
            {/* Force full height container so Leaflet map + overlays truly fill the card */}
            <div className="relative h-full w-full">
              {/* Real Leaflet + OSM Map */}
              <MapView
                devices={devices}
                resizeKey={mapResizeKey}
                fitKey={fitKey}
                selectedDeviceId={selectedDeviceId}
              />

              {/* Futuristic overlays on top of real map (z-index must exceed Leaflet panes: tile=200, marker=600, popup=700) */}
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-950/80 backdrop-blur px-3 py-1 text-[10px] tracking-[1.5px] text-emerald-400 z-[800]">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE TRACKING
              </div>

              <div className="absolute top-4 right-4 flex gap-3 text-[10px] bg-zinc-950/80 backdrop-blur border border-white/10 rounded-full px-3 py-1 z-[800]">
                <div>{devices.length} <span className="text-zinc-500">devices</span></div>
                <div className="text-emerald-400">{onlineCount} online</div>
                <div>{locatedCount} <span className="text-zinc-500">berlokasi</span></div>
              </div>

              {devicesQuery.error && (
                <div className="absolute bottom-4 left-4 z-[800] rounded-lg border border-red-500/30 bg-red-950/90 px-3 py-2 text-xs text-red-100">
                  Gagal memuat perangkat: {devicesQuery.error.message}
                </div>
              )}

              {/* Selected device indicator */}
              <AnimatePresence>
                {selectedDeviceId && (() => {
                  const selected = devices.find((d) => d.id === selectedDeviceId);
                  if (!selected) return null;
                  return (
                    <motion.div
                      key="selected-indicator"
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="absolute bottom-4 left-4 z-[800] flex items-center gap-2.5 rounded-xl border border-cyan-500/30 bg-zinc-950/90 backdrop-blur px-3.5 py-2"
                      style={{
                        boxShadow: '0 0 20px rgba(6,182,212,0.15), 0 0 40px rgba(6,182,212,0.05)',
                      }}
                    >
                      <motion.div
                        className="h-2 w-2 rounded-full bg-cyan-400"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [1, 0.6, 1],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <div className="text-xs">
                        <span className="text-cyan-300 font-medium">{selected.name}</span>
                        {selected.vehiclePlate && (
                          <span className="text-zinc-500 ml-1.5">{selected.vehiclePlate}</span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedDeviceId(null)}
                        className="ml-1 rounded-full p-0.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10 transition"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Re-open side panel when collapsed (desktop) — offset so it doesn't overlap the stats HUD */}
              {!showSidebar && (
                <button
                  onClick={toggleSidebar}
                  className="absolute top-4 right-[13rem] z-[800] flex items-center gap-1.5 rounded-full border border-white/15 bg-zinc-950/80 backdrop-blur px-2.5 py-1 text-[10px] text-zinc-300 hover:border-cyan-500/40 hover:text-cyan-300 transition"
                  title="Show active devices"
                >
                  <Sidebar className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">DEVICES</span>
                </button>
              )}

              {/* ── Device Dropdown (mobile + desktop when sidebar hidden) ── */}
              <DeviceDropdown
                devices={filteredDevices}
                allDevicesCount={devices.length}
                onlineCount={onlineCount}
                selectedDeviceId={selectedDeviceId}
                isLoading={devicesQuery.isLoading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectDevice={handleSelectDevice}
              />
            </div>
          </CyberCard>
        </div>

        {/* Side panel */}
        {showSidebar && (
          <div className="hidden w-72 lg:block h-full">
            <CyberCard className="h-full p-4 flex flex-col min-h-[520px]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-medium tracking-[2px] text-zinc-400">PERANGKAT AKTIF</div>
                <button onClick={toggleSidebar} className="text-zinc-500 hover:text-zinc-300"><Maximize2 className="h-3.5 w-3.5" /></button>
              </div>

              <div className="flex-1 space-y-2 overflow-auto pr-1 text-sm">
                {devicesQuery.isLoading ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-300">
                    Memuat perangkat...
                  </div>
                ) : devices.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-zinc-300">
                    Belum ada perangkat. Tambahkan GPS HP atau tracker dari halaman Perangkat.
                  </div>
                ) : (
                  devices.map((device) => {
                    const isSelected = device.id === selectedDeviceId;
                    const hasLocation = device.lastLatitude != null && device.lastLongitude != null;

                    return (
                      <motion.button
                        key={device.id}
                        onClick={() => handleSelectDevice(device.id)}
                        disabled={!hasLocation}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: isSelected ? 1.02 : 1,
                        }}
                        whileHover={hasLocation ? { scale: 1.03, y: -1 } : {}}
                        whileTap={hasLocation ? { scale: 0.98 } : {}}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 25,
                          opacity: { duration: 0.2 },
                        }}
                        className={`
                          relative flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors
                          ${isSelected
                            ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                            : 'border-white/10 bg-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5'
                          }
                          ${!hasLocation ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {/* Selection glow bar */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              layoutId="device-selection-glow"
                              className="absolute inset-0 rounded-xl border border-cyan-400/30"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                boxShadow: '0 0 20px rgba(6,182,212,0.2), inset 0 0 20px rgba(6,182,212,0.05)',
                              }}
                            />
                          )}
                        </AnimatePresence>

                        {/* Status dot */}
                        <div className="relative z-10">
                          <div className={`h-2.5 w-2.5 rounded-full ${
                            device.status === 'ONLINE'
                              ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                              : device.status === 'IDLE'
                                ? 'bg-yellow-400'
                                : 'bg-zinc-600'
                          }`} />
                          {isSelected && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-cyan-400"
                              animate={{
                                scale: [1, 2.5, 1],
                                opacity: [0.6, 0, 0.6],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            />
                          )}
                        </div>

                        {/* Device info */}
                        <div className="relative z-10 min-w-0 flex-1">
                          <div className="flex justify-between gap-2">
                            <span className={`truncate font-medium ${isSelected ? 'text-cyan-200' : ''}`}>
                              {device.name}
                            </span>
                            <span className="shrink-0 text-[10px] text-zinc-400 tabular-nums">
                              {formatLastSeen(device.lastSeenAt)}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {device.status === 'ONLINE'
                              ? `${Math.round(device.lastSpeed ?? 0)} km/h • Online`
                              : device.status === 'IDLE'
                                ? 'Idle'
                                : 'Offline'}
                            {device.vehiclePlate ? ` • ${device.vehiclePlate}` : ''}
                          </div>
                        </div>

                        {/* Map pin icon with animation */}
                        <motion.div
                          className="relative z-10"
                          animate={isSelected ? {
                            y: [0, -3, 0],
                          } : {}}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          <MapPin className={`h-4 w-4 ${
                            isSelected
                              ? 'text-cyan-300'
                              : hasLocation
                                ? 'text-cyan-300/60'
                                : 'text-zinc-600'
                          }`} />
                        </motion.div>
                      </motion.button>
                    );
                  })
                )}
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-center text-[10px] tracking-widest text-zinc-500">
                DATA LIVE • REFRESH 5 DETIK
              </div>
            </CyberCard>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

// ── Device Dropdown ──

interface DeviceDropdownProps {
  devices: Array<{
    id: string;
    name: string;
    status: string;
    lastLatitude: number | null;
    lastLongitude: number | null;
    lastSeenAt: Date | string | null;
    lastSpeed: number | null;
    vehiclePlate: string | null;
  }>;
  allDevicesCount: number;
  onlineCount: number;
  selectedDeviceId: string | null;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectDevice: (id: string) => void;
}

function DeviceDropdown({
  devices,
  allDevicesCount,
  onlineCount,
  selectedDeviceId,
  isLoading,
  searchQuery,
  onSearchChange,
  onSelectDevice,
}: DeviceDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        onSearchChange('');
      }
    };

    // Delay to avoid the opening click triggering close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onSearchChange]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      // Small delay so the animation starts first
      const timer = setTimeout(() => searchInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleDeviceTap = (deviceId: string) => {
    onSelectDevice(deviceId);
    setOpen(false);
    onSearchChange('');
  };

  const selectedDevice = selectedDeviceId
    ? devices.find((d) => d.id === selectedDeviceId)
    : null;

  return (
    <div ref={dropdownRef} className="absolute top-14 right-4 z-[900]">
      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`
          flex items-center gap-2 rounded-xl border px-3 py-2 text-xs backdrop-blur transition-colors
          ${open
            ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
            : 'border-white/15 bg-zinc-950/80 text-zinc-300 hover:border-cyan-500/30 hover:text-cyan-300'
          }
        `}
      >
        <Radio className={`h-3.5 w-3.5 ${open ? 'text-cyan-400' : 'text-zinc-500'}`} />
        <span className="font-medium tracking-wide">
          {selectedDevice ? selectedDevice.name : 'DEVICES'}
        </span>
        <span className={`text-[10px] ${open ? 'text-cyan-400/70' : 'text-zinc-500'}`}>
          {onlineCount}/{allDevicesCount}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.div>
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl overflow-hidden"
            style={{
              boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(6,182,212,0.08)',
            }}
          >
            {/* Header with search */}
            <div className="p-3 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Cari nama atau plat..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-8 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-500/40 focus:outline-none transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Device list */}
            <div className="overflow-y-auto p-2" style={{ maxHeight: 'min(50vh, 360px)' }}>
              {isLoading ? (
                <div className="py-6 text-center text-xs text-zinc-500">
                  Memuat perangkat...
                </div>
              ) : devices.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500">
                  {searchQuery ? 'Tidak ditemukan' : 'Belum ada perangkat'}
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.03 } },
                  }}
                  className="space-y-1"
                >
                  {devices.map((device) => {
                    const isSelected = device.id === selectedDeviceId;
                    const hasLocation =
                      device.lastLatitude != null && device.lastLongitude != null;

                    return (
                      <motion.button
                        key={device.id}
                        onClick={() => handleDeviceTap(device.id)}
                        disabled={!hasLocation}
                        variants={{
                          hidden: { opacity: 0, x: -8 },
                          visible: { opacity: 1, x: 0 },
                        }}
                        whileHover={hasLocation ? { x: 2 } : {}}
                        whileTap={hasLocation ? { scale: 0.98 } : {}}
                        transition={{ duration: 0.15 }}
                        className={`
                          flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors
                          ${isSelected
                            ? 'border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                            : 'border-transparent bg-transparent hover:bg-white/5 hover:border-white/10'
                          }
                          ${!hasLocation ? 'opacity-40' : ''}
                        `}
                      >
                        {/* Status dot */}
                        <div className="relative shrink-0">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${
                              device.status === 'ONLINE'
                                ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                                : device.status === 'IDLE'
                                  ? 'bg-yellow-400'
                                  : 'bg-zinc-600'
                            }`}
                          />
                          {isSelected && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-cyan-400"
                              animate={{
                                scale: [1, 2.5, 1],
                                opacity: [0.6, 0, 0.6],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </div>

                        {/* Device info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs truncate ${
                                isSelected ? 'text-cyan-200 font-medium' : 'text-zinc-200'
                              }`}
                            >
                              {device.name}
                            </span>
                            <span className="shrink-0 text-[10px] text-zinc-500 tabular-nums">
                              {formatLastSeen(device.lastSeenAt)}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            {device.status === 'ONLINE'
                              ? `${Math.round(device.lastSpeed ?? 0)} km/h`
                              : device.status === 'IDLE'
                                ? 'Idle'
                                : 'Offline'}
                            {device.vehiclePlate ? ` • ${device.vehiclePlate}` : ''}
                          </div>
                        </div>

                        {/* Map pin */}
                        <MapPin
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isSelected
                              ? 'text-cyan-300'
                              : hasLocation
                                ? 'text-cyan-300/30'
                                : 'text-zinc-700'
                          }`}
                        />
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 px-3 py-2 flex items-center justify-between">
              <span className="text-[10px] text-zinc-600">
                {devices.length} ditampilkan
              </span>
              <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
