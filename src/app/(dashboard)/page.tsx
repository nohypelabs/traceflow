'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-provider';
import {
  MapPin, Activity, Bell, Truck, Wifi, WifiOff, Clock, AlertTriangle, Zap,
  Target, TrendingUp, Shield
} from 'lucide-react';
import Link from 'next/link';
import { useSocket } from '@/hooks/use-socket';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '@/components/ui/animation';
import { QueryError } from '@/components/ui/error-boundary';
import { 
  AnimatedGrid, FloatingParticles, AnimatedBorder, NeonGlow 
} from '@/components/ui/futuristic';
import { CyberCard } from '@/components/ui/page-wrapper';
import type { DashboardStats, AlertWithDevice } from '@/types';

const severityAccent: Record<string, string> = {
  CRITICAL: 'border-red-500/60 bg-red-500/10 text-red-400',
  WARNING: 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400',
  INFO: 'border-cyan-500/60 bg-cyan-500/10 text-cyan-400',
};

const severityIconColor: Record<string, string> = {
  CRITICAL: 'text-red-400',
  WARNING: 'text-yellow-400',
  INFO: 'text-cyan-400',
};

export default function DashboardPage() {
  const { data: stats, isLoading, error: statsError, refetch: refetchStats } = api.dashboard.getStats.useQuery();
  const { data: recentAlerts, error: alertsError, refetch: refetchAlerts } = api.dashboard.getRecentAlerts.useQuery();
  const { socket, isConnected } = useSocket();
  const [realtimeAlerts, setRealtimeAlerts] = useState<AlertWithDevice[]>([]);
  const [onlineDevices, setOnlineDevices] = useState<Set<string>>(new Set());

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleDeviceUpdate = (data: { deviceId: string }) => {
      setOnlineDevices((prev) => {
        const next = new Set(prev);
        next.add(data.deviceId);
        return next;
      });
    };

    const handleNewAlert = (alert: AlertWithDevice) => {
      setRealtimeAlerts((prev) => [alert, ...prev.slice(0, 4)]);
    };

    socket.on('device:update', handleDeviceUpdate);
    socket.on('alert:new', handleNewAlert);

    return () => {
      socket.off('device:update', handleDeviceUpdate);
      socket.off('alert:new', handleNewAlert);
    };
  }, [socket]);

  const onlineCount = onlineDevices.size || (stats?.onlineDevices ?? 0);

  // Demo values for attractive presentation (rich mock data)
  const demoTotalDevices = 28;
  const demoOnline = 21;
  const demoIdle = 5;
  const demoOffline = 2;
  const demoTodayTrips = 47;

  // Handle errors
  if (statsError) {
    return (
      <div className="relative min-h-screen">
        <AnimatedGrid />
        <FloatingParticles />
        <QueryError error={statsError} retry={refetchStats} />
      </div>
    );
  }

  if (alertsError) {
    return (
      <div className="relative min-h-screen">
        <AnimatedGrid />
        <FloatingParticles />
        <QueryError error={alertsError} retry={refetchAlerts} />
      </div>
    );
  }

  const allAlerts = [...realtimeAlerts, ...(recentAlerts ?? [])].slice(0, 5);

  // Rich mock data for demo (makes dashboard look alive and impressive)
  const demoRecentAlerts = [
    { id: 'a1', device: { name: 'Truk Armada-07' }, message: 'Memasuki geofence Gudang Utara', severity: 'INFO', triggeredAt: new Date(Date.now() - 1000 * 60 * 2) },
    { id: 'a2', device: { name: 'Mobil Ops #12' }, message: 'Kecepatan melebihi batas 80 km/h', severity: 'WARNING', triggeredAt: new Date(Date.now() - 1000 * 60 * 7) },
    { id: 'a3', device: { name: 'Motor Kurir-03' }, message: 'Keluar dari geofence Rute A', severity: 'INFO', triggeredAt: new Date(Date.now() - 1000 * 60 * 14) },
    { id: 'a4', device: { name: 'Van Logistik-09' }, message: 'SOS button ditekan', severity: 'CRITICAL', triggeredAt: new Date(Date.now() - 1000 * 60 * 19) },
    { id: 'a5', device: { name: 'Truk B-15' }, message: 'Memasuki geofence Pool Maintenance', severity: 'INFO', triggeredAt: new Date(Date.now() - 1000 * 60 * 28) },
    { id: 'a6', device: { name: 'Mobil Operasional #5' }, message: 'Kecepatan melebihi batas 80 km/h', severity: 'WARNING', triggeredAt: new Date(Date.now() - 1000 * 60 * 35) },
  ];

  // Loading state with futuristic skeleton
  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <AnimatedGrid />
        <FloatingParticles />
        <div className="relative space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/5 animate-pulse" />
              <div className="h-7 w-40 rounded bg-white/5 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-28 rounded-xl bg-white/5 animate-pulse" />
              <div className="h-9 w-24 rounded-xl bg-white/5 animate-pulse" />
            </div>
          </div>

          {/* 8 Stat cards skeleton (two rows) */}
          <div className="space-y-4">
            <div className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl border border-white/10 dark:border-white/10 border-zinc-200 bg-zinc-950/70 dark:bg-zinc-950/70 bg-white/80 p-5 md:p-6">
                  <div className="flex justify-between mb-3">
                    <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-4 bg-white/10 rounded animate-pulse" />
                  </div>
                  <div className="h-7 w-14 bg-white/10 rounded animate-pulse mb-2" />
                  <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl border border-white/10 dark:border-white/10 border-zinc-200 bg-zinc-950/70 dark:bg-zinc-950/70 bg-white/80 p-5 md:p-6">
                  <div className="flex justify-between mb-3">
                    <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-4 bg-white/10 rounded animate-pulse" />
                  </div>
                  <div className="h-7 w-14 bg-white/10 rounded animate-pulse mb-2" />
                  <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom panels skeleton */}
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <div className="rounded-2xl border border-white/10 dark:border-white/10 border-zinc-200 bg-zinc-950/70 dark:bg-zinc-950/70 bg-white/80 h-72 animate-pulse" />
            <div className="rounded-2xl border border-white/10 dark:border-white/10 border-zinc-200 bg-zinc-950/70 dark:bg-zinc-950/70 bg-white/80 h-72 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Layered background effects (on top of layout canvas) */}
      <AnimatedGrid />
      <FloatingParticles />
      
      <FadeIn className="relative space-y-5 md:space-y-6">
        {/* Futuristic Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
              <Target className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-semibold tracking-tight text-white dark:text-white text-zinc-900 md:text-[28px]">Dashboard</div>
                <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/10 dark:border-white/10 border-zinc-200 bg-white/[0.02] dark:bg-white/[0.02] bg-zinc-100 px-2.5 py-0.5 text-[10px] uppercase tracking-[2px] text-emerald-400/90">
                  <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                  {isConnected ? 'LIVE' : 'OFFLINE'}
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-500 text-zinc-400 tracking-[1.5px] -mt-0.5">REAL-TIME FLEET OVERVIEW</div>
            </div>
          </div>

          {/* Action Buttons — matching auth neon style */}
          <div className="flex gap-2 md:gap-3">
            <Link href="/map">
              <NeonGlow color="blue">
                <button className="neon-button group flex h-9 items-center gap-2 rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 px-4 text-sm font-medium text-white shadow-[0_0_18px_rgba(6,182,212,0.2)] transition active:scale-[0.985]">
                  <MapPin className="h-4 w-4" />
                  <span>Peta Live</span>
                </button>
              </NeonGlow>
            </Link>
            <Link href="/alerts">
              <button className="flex h-9 items-center gap-2 rounded-xl border border-white/15 dark:border-white/15 border-zinc-200 bg-white/5 dark:bg-white/5 bg-zinc-100 px-4 text-sm font-medium text-zinc-200 dark:text-zinc-200 text-zinc-700 transition hover:bg-white/10 dark:hover:bg-white/10 hover:bg-zinc-200 hover:text-white dark:hover:text-white hover:text-zinc-900 active:scale-[0.985]">
                <Bell className="h-4 w-4" />
                <span>Peringatan</span>
                <span className="ml-0.5 rounded-full bg-red-500/90 px-1.5 py-px text-[10px] font-mono tabular-nums text-white">
                  3
                </span>
              </button>
            </Link>
          </div>
        </div>

        {/* Row 1 — Main Stats (now with rich mock data for demo) */}
        <StaggerContainer className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
          {/* Total Perangkat */}
          <StaggerItem>
            <AnimatedBorder>
              <div className="p-5 md:p-6 min-h-[155px]">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[10px] font-medium tracking-[1.5px] text-zinc-400 dark:text-zinc-400 text-zinc-500">TOTAL PERANGKAT</div>
                  <MapPin className="h-4 w-4 text-blue-400" />
                </div>
                <div className="font-mono text-3xl font-semibold tracking-tighter text-white dark:text-white text-zinc-900 md:text-[36px]">
                  28
                </div>
                <div className="mt-2 h-8 flex items-center">
                  <div className="flex gap-2 text-[10px]">
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400">21 online</span>
                    <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-yellow-400">5 idle</span>
                    <span className="rounded bg-zinc-500/10 px-1.5 py-0.5 text-zinc-400">2 off</span>
                  </div>
                </div>
                <div className="mt-1 text-xs text-emerald-400/80">+3 minggu ini</div>
              </div>
            </AnimatedBorder>
          </StaggerItem>

          {/* Live / Online */}
          <StaggerItem>
            <AnimatedBorder>
              <div className="p-5 md:p-6 min-h-[155px]">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[10px] font-medium tracking-[1.5px] text-zinc-400 dark:text-zinc-400 text-zinc-500">LIVE / ONLINE</div>
                  <Wifi className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="font-mono text-3xl font-semibold tracking-tighter text-emerald-400 md:text-[36px]">
                  21
                  <span className="text-base text-zinc-500 ml-1">/ 28</span>
                </div>
                <div className="mt-2 h-8 flex items-center">
                  <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full w-[75%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                  </div>
                </div>
                <div className="mt-1 text-xs text-emerald-400/80">75% aktif • 3 idle</div>
              </div>
            </AnimatedBorder>
          </StaggerItem>

          {/* Offline */}
          <StaggerItem>
            <AnimatedBorder>
              <div className="p-5 md:p-6 min-h-[155px]">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[10px] font-medium tracking-[1.5px] text-zinc-400 dark:text-zinc-400 text-zinc-500">OFFLINE</div>
                  <WifiOff className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="font-mono text-3xl font-semibold tracking-tighter text-zinc-400 dark:text-zinc-400 text-zinc-500 md:text-[36px]">
                  2
                </div>
                <div className="mt-2 h-8 flex items-center">
                  <div className="flex gap-1 text-[10px]">
                    {['TRK-07', 'MTR-12'].map((id, i) => (
                      <span key={i} className="rounded bg-zinc-500/10 px-1.5 py-0.5 text-zinc-400">{id}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500 text-zinc-400">Terakhir: 47 menit lalu</div>
              </div>
            </AnimatedBorder>
          </StaggerItem>

          {/* Perjalanan Hari Ini */}
          <StaggerItem>
            <AnimatedBorder>
              <div className="p-5 md:p-6 min-h-[155px]">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[10px] font-medium tracking-[1.5px] text-zinc-400 dark:text-zinc-400 text-zinc-500">PERJALANAN HARI INI</div>
                  <TrendingUp className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="font-mono text-3xl font-semibold tracking-tighter text-yellow-400 md:text-[36px]">
                  47
                </div>
                {/* Mini sparkline */}
                <div className="mt-2 h-8 flex items-end">
                  <div className="flex items-end gap-[3px] w-full h-6">
                    {[4, 6, 5, 8, 7, 9, 11, 10, 8, 12, 9, 7, 10].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-yellow-500/30" style={{ height: `${(h / 12) * 100}%` }} />
                    ))}
                  </div>
                </div>
                <div className="mt-1 text-xs text-emerald-400/80">↑ 8 trip vs kemarin</div>
              </div>
            </AnimatedBorder>
          </StaggerItem>
        </StaggerContainer>

        {/* Row 2 — Demo Mock Stats (jarak, kecepatan, utilization, geofence) */}
        <StaggerContainer className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
          {/* Jarak tempuh hari ini */}
          <StaggerItem>
            <AnimatedBorder>
              <div className="p-5 md:p-6 min-h-[155px]">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[10px] font-medium tracking-[1.5px] text-zinc-400 dark:text-zinc-400 text-zinc-500">JARAK HARI INI</div>
                  <Zap className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="font-mono text-3xl font-semibold tracking-tighter text-cyan-400 md:text-[36px]"
                  style={{ textShadow: '0 0 20px rgba(6,182,212,0.2)' }}
                >
                  253.7
                  <span className="text-base text-zinc-500 ml-1">km</span>
                </div>
                {/* Mini sparkline - consistent visual height */}
                <div className="mt-2 h-8 flex items-end">
                  <div className="flex items-end gap-[3px] w-full h-6">
                    {[3, 5, 4, 6, 8, 10, 9, 7, 6, 8, 11, 10, 8].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-cyan-500/30" style={{ height: `${(h / 11) * 100}%` }} />
                    ))}
                  </div>
                </div>
                <div className="mt-1 text-xs text-emerald-400/80">↑ 12% vs kemarin</div>
              </div>
            </AnimatedBorder>
          </StaggerItem>

          {/* Kecepatan rata-rata */}
          <StaggerItem>
            <AnimatedBorder>
              <div className="p-5 md:p-6 min-h-[155px]">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[10px] font-medium tracking-[1.5px] text-zinc-400 dark:text-zinc-400 text-zinc-500">KECEPATAN AVG</div>
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </div>
                <div className="font-mono text-3xl font-semibold tracking-tighter text-purple-400 md:text-[36px]"
                  style={{ textShadow: '0 0 20px rgba(139,92,246,0.2)' }}
                >
                  38
                  <span className="text-base text-zinc-500 ml-1">km/h</span>
                </div>
                {/* Speed gauge bar - consistent visual height */}
                <div className="mt-2 h-8 flex items-center">
                  <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" style={{ width: '48%' }} />
                  </div>
                </div>
                <div className="mt-1 text-xs text-zinc-500">Max: 82 km/h</div>
              </div>
            </AnimatedBorder>
          </StaggerItem>

          {/* Fleet utilization */}
          <StaggerItem>
            <AnimatedBorder>
              <div className="p-5 md:p-6 min-h-[155px]">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[10px] font-medium tracking-[1.5px] text-zinc-400 dark:text-zinc-400 text-zinc-500">UTILISASI FLEET</div>
                  <Activity className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="font-mono text-3xl font-semibold tracking-tighter text-emerald-400 md:text-[36px]"
                  style={{ textShadow: '0 0 20px rgba(16,185,129,0.2)' }}
                >
                  67
                  <span className="text-base text-zinc-500 ml-1">%</span>
                </div>
                {/* Progress dots - consistent visual height */}
                <div className="mt-2 h-8 flex items-center">
                  <div className="flex gap-1 w-full">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className={`h-2 flex-1 rounded-sm ${i < 8 ? 'bg-emerald-500/40' : 'bg-white/[0.06]'}`} />
                    ))}
                  </div>
                </div>
                <div className="mt-1 text-xs text-zinc-500">8 dari 12 aktif</div>
              </div>
            </AnimatedBorder>
          </StaggerItem>

          {/* Geofence aktif */}
          <StaggerItem>
            <AnimatedBorder>
              <div className="p-5 md:p-6 min-h-[155px]">
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="text-[10px] font-medium tracking-[1.5px] text-zinc-400 dark:text-zinc-400 text-zinc-500">GEOFENCE AKTIF</div>
                  <Shield className="h-4 w-4 text-amber-400" />
                </div>
                <div className="font-mono text-3xl font-semibold tracking-tighter text-amber-400 md:text-[36px]"
                  style={{ textShadow: '0 0 20px rgba(245,158,11,0.2)' }}
                >
                  5
                  <span className="text-base text-zinc-500 ml-1">zona</span>
                </div>
                {/* Geofence hex indicators - consistent visual height + wrap for mobile */}
                <div className="mt-2 h-8 flex items-center">
                  <div className="flex flex-wrap gap-1 w-full">
                    {['Gudang', 'Rute A', 'Area JKT', 'Pool', 'Client'].map((name, i) => (
                      <div key={i} className="flex h-6 items-center justify-center rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5">
                        <span className="text-[8px] text-amber-400/80 truncate max-w-[48px]">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-1 text-xs text-zinc-500">3 perangkat terlacak</div>
              </div>
            </AnimatedBorder>
          </StaggerItem>
        </StaggerContainer>

        {/* Bottom panels - equal height cards */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-6 items-stretch">
          {/* Fleet Status — terminal style */}
          <SlideUp delay={0.25}>
            <CyberCard className="h-full">
              <div className="p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-400" />
                    <div>
                      <div className="text-base font-semibold tracking-tight">Status Armada</div>
                      <div className="text-[10px] text-zinc-500 -mt-0.5 tracking-[1px]">FLEET HEALTH</div>
                    </div>
                  </div>
                  <div className="font-mono text-xs text-zinc-400 tabular-nums">
                    {demoTotalDevices} TOTAL
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="group flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 transition hover:border-emerald-500/40">
                    <div className="flex items-center gap-2.5">
                      <Activity className="h-4 w-4 text-emerald-400" />
                      <div className="text-sm font-medium text-emerald-300">Online</div>
                    </div>
                    <div className="font-mono text-2xl font-semibold tabular-nums text-emerald-400">
                      {demoOnline}
                    </div>
                  </div>

                  <div className="group flex items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 transition hover:border-yellow-500/40">
                    <div className="flex items-center gap-2.5">
                      <Truck className="h-4 w-4 text-yellow-400" />
                      <div className="text-sm font-medium text-yellow-300">Idle</div>
                    </div>
                    <div className="font-mono text-2xl font-semibold tabular-nums text-yellow-400">
                      {demoIdle}
                    </div>
                  </div>

                  <div className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20">
                    <div className="flex items-center gap-2.5">
                      <WifiOff className="h-4 w-4 text-zinc-400" />
                      <div className="text-sm font-medium text-zinc-300">Offline</div>
                    </div>
                    <div className="font-mono text-2xl font-semibold tabular-nums text-zinc-300">
                      {demoOffline}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-[10px] text-zinc-500">
                  <div>Total Distance Today: <span className="text-emerald-400 font-mono">253.7 km</span></div>
                  <div>Last Sync: <span className="text-cyan-400">just now</span></div>
                </div>
              </div>
            </CyberCard>
          </SlideUp>

          {/* Recent Alerts — severity aware */}
          <SlideUp delay={0.35}>
            <CyberCard className="h-full">
              <div className="p-5 md:p-6 pb-7 md:pb-8">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    <div>
                      <div className="text-base font-semibold tracking-tight">Peringatan Terbaru</div>
                      <div className="text-[10px] text-zinc-500 -mt-0.5 tracking-[1px]">RECENT EVENTS</div>
                    </div>
                  </div>
                  <Link 
                    href="/alerts" 
                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Lihat semua →
                  </Link>
                </div>

                {/* Using rich demo mock data for impressive demo presentation */}
                {demoRecentAlerts.length > 0 ? (
                  <div className="space-y-2">
                    {demoRecentAlerts.map((alert, index) => {
                      const sev = alert.severity || 'INFO';
                      const accent = severityAccent[sev] || severityAccent.INFO;
                      const iconColor = severityIconColor[sev] || severityIconColor.INFO;

                      return (
                        <div 
                          key={alert.id ?? index} 
                          className={`group flex items-start gap-3 rounded-xl border ${accent} px-3.5 py-3 transition hover:brightness-110`}
                        >
                          <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-sm font-medium leading-snug text-white/95">
                              {alert.device?.name && (
                                <span className="font-mono text-[11px] text-white/60 group-hover:text-white/80 transition">
                                  {alert.device.name}
                                </span>
                              )}
                              <span className="line-clamp-1">{alert.message}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/50">
                              <Clock className="h-3 w-3" />
                              {alert.triggeredAt.toLocaleString('id-ID', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center text-center">
                    <div className="mb-2 text-zinc-500">Tidak ada peringatan</div>
                    <div className="text-xs text-zinc-600">Sistem berjalan normal</div>
                  </div>
                )}
              </div>
            </CyberCard>
          </SlideUp>
        </div>
      </FadeIn>
    </div>
  );
}
