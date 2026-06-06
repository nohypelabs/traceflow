'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-provider';
import { MapPin, Activity, Bell, Truck, Wifi, WifiOff, Clock, AlertTriangle, Zap } from 'lucide-react';
import Link from 'next/link';
import { useSocket } from '@/hooks/use-socket';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '@/components/ui/animation';
import { StatCard, AlertCard, DeviceStatusBadge } from '@/components/ui/radix';
import { QueryError } from '@/components/ui/error-boundary';
import { AnimatedGrid, FloatingParticles, AnimatedBorder, HolographicCard, GlitchText, NeonGlow } from '@/components/ui/futuristic';
import { Card, Flex, Box, Heading, Text, Badge, Button } from '@radix-ui/themes';
import type { DashboardStats, AlertWithDevice } from '@/types';

export default function DashboardPage() {
  const { data: stats, isLoading, error: statsError, refetch: refetchStats } = api.dashboard.getStats.useQuery();
  const { data: recentAlerts, error: alertsError, refetch: refetchAlerts } = api.dashboard.getRecentAlerts.useQuery();
  const { socket } = useSocket();
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

  // Handle errors
  if (statsError) {
    return <QueryError error={statsError} retry={refetchStats} />;
  }

  if (alertsError) {
    return <QueryError error={alertsError} retry={refetchAlerts} />;
  }

  const allAlerts = [...realtimeAlerts, ...(recentAlerts ?? [])].slice(0, 5);

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <AnimatedGrid />
        <FloatingParticles />
        <div className="relative space-y-4 md:space-y-6">
          <h1 className="text-xl font-bold md:text-2xl">Dashboard</h1>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-zinc-200/10 dark:bg-zinc-800/50 md:h-28" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <AnimatedGrid />
      <FloatingParticles />
      
      <FadeIn className="relative space-y-4 md:space-y-6">
        {/* Header */}
        <Flex align="center" justify="between" wrap="wrap" gap="3">
          <Heading size="5" className="md:text-2xl">
            <Flex align="center" gap="2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Dashboard
            </Flex>
          </Heading>
          <Flex gap="2" className="md:gap-3">
            <Link href="/map">
              <NeonGlow color="blue">
                <Button size="2" className="md:size-3 bg-blue-600 hover:bg-blue-700">
                  <MapPin className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Peta Live</span>
                </Button>
              </NeonGlow>
            </Link>
            <Link href="/alerts">
              <Button variant="outline" size="2" className="md:size-3 border-blue-500/50 hover:bg-blue-500/10">
                <Bell className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Peringatan</span>
              </Button>
            </Link>
          </Flex>
        </Flex>

        {/* Stats Cards */}
        <StaggerContainer className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
          <StaggerItem>
            <AnimatedBorder>
              <div className="p-4 md:p-6">
                <Flex align="center" justify="between" mb="2">
                  <Text size="1" color="gray">Total Perangkat</Text>
                  <MapPin className="h-4 w-4 text-blue-400" />
                </Flex>
                <Heading size="6" className="md:text-3xl">{stats?.totalDevices ?? 0}</Heading>
                <Text size="1" color="gray">{onlineCount} online</Text>
              </div>
            </AnimatedBorder>
          </StaggerItem>
          <StaggerItem>
            <AnimatedBorder>
              <div className="p-4 md:p-6">
                <Flex align="center" justify="between" mb="2">
                  <Text size="1" color="gray">Online</Text>
                  <Wifi className="h-4 w-4 text-green-400" />
                </Flex>
                <Heading size="6" className="md:text-3xl text-green-400">{onlineCount}</Heading>
                <Text size="1" color="gray">{stats?.idleDevices ?? 0} idle</Text>
              </div>
            </AnimatedBorder>
          </StaggerItem>
          <StaggerItem>
            <AnimatedBorder>
              <div className="p-4 md:p-6">
                <Flex align="center" justify="between" mb="2">
                  <Text size="1" color="gray">Offline</Text>
                  <WifiOff className="h-4 w-4 text-zinc-400" />
                </Flex>
                <Heading size="6" className="md:text-3xl text-zinc-400">{stats?.offlineDevices ?? 0}</Heading>
                <Text size="1" color="gray">Terputus</Text>
              </div>
            </AnimatedBorder>
          </StaggerItem>
          <StaggerItem>
            <AnimatedBorder>
              <div className="p-4 md:p-6">
                <Flex align="center" justify="between" mb="2">
                  <Text size="1" color="gray">Perjalanan Hari Ini</Text>
                  <Zap className="h-4 w-4 text-yellow-400" />
                </Flex>
                <Heading size="6" className="md:text-3xl text-yellow-400">{stats?.todayTrips ?? 0}</Heading>
                <Text size="1" color="gray">Perjalanan aktif</Text>
              </div>
            </AnimatedBorder>
          </StaggerItem>
        </StaggerContainer>

        {/* Bottom section */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {/* Fleet Status */}
          <SlideUp delay={0.3}>
            <HolographicCard>
              <div className="p-4 md:p-6">
                <Heading size="3" className="md:text-lg mb-3 md:mb-4">
                  <Flex align="center" gap="2">
                    <Truck className="h-5 w-5 text-blue-400" />
                    Status Armada
                  </Flex>
                </Heading>
                <Flex direction="column" gap="2" className="md:gap-3">
                  <Flex align="center" justify="between" className="rounded-lg bg-green-500/10 px-3 py-2 md:px-4 md:py-3 border border-green-500/20">
                    <Flex align="center" gap="2">
                      <Activity className="h-4 w-4 text-green-400" />
                      <Text size="1" className="md:text-sm" weight="medium">Online</Text>
                    </Flex>
                    <Heading size="4" className="md:text-2xl text-green-400">{onlineCount}</Heading>
                  </Flex>
                  <Flex align="center" justify="between" className="rounded-lg bg-yellow-500/10 px-3 py-2 md:px-4 md:py-3 border border-yellow-500/20">
                    <Flex align="center" gap="2">
                      <Truck className="h-4 w-4 text-yellow-400" />
                      <Text size="1" className="md:text-sm" weight="medium">Idle</Text>
                    </Flex>
                    <Heading size="4" className="md:text-2xl text-yellow-400">{stats?.idleDevices ?? 0}</Heading>
                  </Flex>
                  <Flex align="center" justify="between" className="rounded-lg bg-zinc-500/10 px-3 py-2 md:px-4 md:py-3 border border-zinc-500/20">
                    <Flex align="center" gap="2">
                      <WifiOff className="h-4 w-4 text-zinc-400" />
                      <Text size="1" className="md:text-sm" weight="medium">Offline</Text>
                    </Flex>
                    <Heading size="4" className="md:text-2xl text-zinc-400">{stats?.offlineDevices ?? 0}</Heading>
                  </Flex>
                </Flex>
              </div>
            </HolographicCard>
          </SlideUp>

          {/* Recent Alerts */}
          <SlideUp delay={0.4}>
            <HolographicCard>
              <div className="p-4 md:p-6">
                <Flex align="center" justify="between" mb="3" className="md:mb-4">
                  <Heading size="3" className="md:text-lg">
                    <Flex align="center" gap="2">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      Peringatan Terbaru
                    </Flex>
                  </Heading>
                  <Link href="/alerts" className="text-xs text-blue-400 hover:text-blue-300 md:text-sm">
                    Lihat semua →
                  </Link>
                </Flex>
                {allAlerts.length > 0 ? (
                  <Flex direction="column" gap="2">
                    {allAlerts.map((alert, index) => (
                      <div key={alert.id ?? index} className="rounded-lg bg-zinc-800/50 p-3 border border-zinc-700/50">
                        <Flex align="start" gap="2">
                          <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                          <Box className="flex-1">
                            <Text size="2" weight="medium">{alert.message}</Text>
                            <Text size="1" color="gray" className="mt-1">
                              {new Date(alert.triggeredAt).toLocaleString('id-ID')}
                            </Text>
                          </Box>
                        </Flex>
                      </div>
                    ))}
                  </Flex>
                ) : (
                  <Flex align="center" justify="center" className="h-32">
                    <Text size="2" color="gray">Tidak ada peringatan terbaru</Text>
                  </Flex>
                )}
              </div>
            </HolographicCard>
          </SlideUp>
        </div>
      </FadeIn>
    </div>
  );
}
