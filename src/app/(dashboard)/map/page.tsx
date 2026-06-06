'use client';

import { api } from '@/lib/api-provider';
import dynamic from 'next/dynamic';
import { FadeIn } from '@/components/ui/animation';
import { Flex, Heading, Text, Badge } from '@radix-ui/themes';

const MapComponent = dynamic(() => import('@/components/map/map-view'), {
  ssr: false,
  loading: () => (
    <Flex align="center" justify="center" className="h-full">
      <Text color="gray">Memuat peta...</Text>
    </Flex>
  ),
});

export default function MapPage() {
  const { data: devices, isLoading } = api.device.list.useQuery();

  return (
    <FadeIn className="space-y-4">
      <Flex align="center" justify="between">
        <Heading size="6">Peta Live</Heading>
        <Badge variant="soft" color="blue">
          {devices?.length ?? 0} perangkat
        </Badge>
      </Flex>

      <div className="h-[calc(100vh-12rem)] overflow-hidden rounded-xl border">
        <MapComponent devices={devices ?? []} />
      </div>
    </FadeIn>
  );
}
