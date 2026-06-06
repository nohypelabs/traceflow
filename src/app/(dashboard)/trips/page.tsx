'use client';

import { useState } from 'react';
import { api } from '@/lib/api-provider';
import { Button } from '@/components/ui/button';
import { Play, Clock, MapPin, Gauge, RotateCcw, Download } from 'lucide-react';
import dynamic from 'next/dynamic';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '@/components/ui/animation';
import { Card, Flex, Box, Heading, Text, Badge } from '@radix-ui/themes';
import type { TripWithDevice } from '@/types';
import { exportTripsToCSV } from '@/lib/export';

const TripPlaybackMap = dynamic(() => import('@/components/map/trip-playback'), {
  ssr: false,
  loading: () => (
    <Flex align="center" justify="center" className="h-full">
      <Text color="gray">Memuat peta...</Text>
    </Flex>
  ),
});

export default function TripsPage() {
  const { data: devices } = api.device.list.useQuery();
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedTrip, setSelectedTrip] = useState<TripWithDevice | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const { data: trips, isLoading } = api.trip.list.useQuery(
    {
      deviceId: selectedDevice,
      from: new Date(dateRange.from),
      to: new Date(dateRange.to),
    },
    { enabled: !!selectedDevice }
  );

  return (
    <FadeIn className="space-y-4">
      <Flex align="center" justify="between">
        <Heading size="6">Riwayat Perjalanan</Heading>
        <Button
          variant="outline"
          size="default"
          onClick={() => trips && exportTripsToCSV(trips)}
          disabled={!trips || trips.length === 0}
        >
          <Download className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Export CSV</span>
        </Button>
      </Flex>

      {/* Filters */}
      <SlideUp delay={0.1}>
        <Card className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Perangkat</label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Pilih perangkat</option>
                {devices?.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Dari</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Sampai</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>
        </Card>
      </SlideUp>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Trip List */}
        <SlideUp delay={0.2}>
          <Card>
            <Box p="4" className="border-b">
              <Heading size="3">Perjalanan</Heading>
            </Box>
            <div className="max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="p-4">
                  <div className="animate-pulse space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-20 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                    ))}
                  </div>
                </div>
              ) : trips && trips.length > 0 ? (
                <div className="divide-y">
                  <StaggerContainer>
                    {trips.map((trip) => (
                      <StaggerItem key={trip.id}>
                        <TripRow
                          trip={trip}
                          isSelected={selectedTrip?.id === trip.id}
                          onClick={() => setSelectedTrip(trip)}
                        />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              ) : (
                <Flex direction="column" align="center" justify="center" className="h-64">
                  <Clock className="h-12 w-12 text-zinc-400" />
                  <Text color="gray" mt="2">
                    {selectedDevice ? 'Tidak ada perjalanan ditemukan' : 'Pilih perangkat'}
                  </Text>
                </Flex>
              )}
            </div>
          </Card>
        </SlideUp>

        {/* Trip Playback */}
        <SlideUp delay={0.3}>
          <Card>
            <Box p="4" className="border-b">
              <Heading size="3">Putar Ulang</Heading>
            </Box>
            {selectedTrip ? (
              <TripPlayback trip={selectedTrip} />
            ) : (
              <Flex direction="column" align="center" justify="center" className="h-[60vh]">
                <Play className="h-12 w-12 text-zinc-400" />
                <Text color="gray" mt="2">Pilih perjalanan untuk diputar ulang</Text>
              </Flex>
            )}
          </Card>
        </SlideUp>
      </div>
    </FadeIn>
  );
}

function TripRow({
  trip,
  isSelected,
  onClick,
}: {
  trip: any;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`cursor-pointer p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
        isSelected ? 'bg-blue-50 dark:bg-blue-950' : ''
      }`}
      onClick={onClick}
    >
      <Flex align="center" justify="between">
        <Box>
          <Text weight="medium">{trip.device?.name ?? 'Perangkat Tidak Diketahui'}</Text>
          <Text size="1" color="gray">
            {new Date(trip.startedAt).toLocaleString('id-ID')}
          </Text>
        </Box>
        <Box className="text-right">
          <Text size="2" weight="medium">
            {trip.distance ? `${(trip.distance / 1000).toFixed(1)} km` : 'N/A'}
          </Text>
          <Text size="1" color="gray">
            {trip.duration ? `${Math.round(trip.duration / 60)} mnt` : 'N/A'}
          </Text>
        </Box>
      </Flex>
      {trip.startAddress && (
        <Text size="1" color="gray" mt="1">{trip.startAddress}</Text>
      )}
    </div>
  );
}

function TripPlayback({ trip }: { trip: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const { data: locations } = api.location.getByTrip.useQuery(
    { tripId: trip.id },
    { enabled: !!trip.id }
  );

  const stats = {
    distance: trip.distance ? (trip.distance / 1000).toFixed(1) : '0',
    duration: trip.duration ? Math.round(trip.duration / 60) : 0,
    maxSpeed: trip.maxSpeed ? Math.round(trip.maxSpeed) : 0,
    avgSpeed: trip.averageSpeed ? Math.round(trip.averageSpeed) : 0,
  };

  return (
    <Flex direction="column" className="h-[60vh]">
      {/* Trip Stats */}
      <div className="grid grid-cols-4 gap-2 border-b p-4">
        <Box className="text-center">
          <Heading size="5">{stats.distance}</Heading>
          <Text size="1" color="gray">km</Text>
        </Box>
        <Box className="text-center">
          <Heading size="5">{stats.duration}</Heading>
          <Text size="1" color="gray">mnt</Text>
        </Box>
        <Box className="text-center">
          <Heading size="5">{stats.maxSpeed}</Heading>
          <Text size="1" color="gray">max km/j</Text>
        </Box>
        <Box className="text-center">
          <Heading size="5">{stats.avgSpeed}</Heading>
          <Text size="1" color="gray">rata² km/j</Text>
        </Box>
      </div>

      {/* Map */}
      <Box className="flex-1">
        {locations && locations.length > 0 ? (
          <TripPlaybackMap
            locations={locations}
            progress={progress}
            onProgressChange={setProgress}
          />
        ) : (
          <Flex align="center" justify="center" className="h-full">
            <Text color="gray">Tidak ada data lokasi</Text>
          </Flex>
        )}
      </Box>

      {/* Playback Controls */}
      <Box className="border-t p-4">
        <Flex align="center" gap="4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value))}
            className="flex-1"
          />
          <Text size="1" color="gray">{progress}%</Text>
        </Flex>
      </Box>
    </Flex>
  );
}
