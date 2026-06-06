'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-provider';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check, Trash2, Filter, AlertTriangle, AlertCircle, Info, Download } from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '@/components/ui/animation';
import { Card, Flex, Box, Heading, Text, Badge } from '@radix-ui/themes';
import type { AlertWithDevice } from '@/types';
import { exportAlertsToCSV } from '@/lib/export';

export default function AlertsPage() {
  const { data: alerts, isLoading } = api.alert.list.useQuery({ limit: 50 });
  const [filter, setFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { socket } = useSocket();
  const [realtimeAlerts, setRealtimeAlerts] = useState<AlertWithDevice[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleNewAlert = (alert: AlertWithDevice) => {
      setRealtimeAlerts((prev) => [alert, ...prev.slice(0, 49)]);
    };

    socket.on('alert:new', handleNewAlert);

    return () => {
      socket.off('alert:new', handleNewAlert);
    };
  }, [socket]);

  const allAlerts = [...realtimeAlerts, ...(alerts?.items ?? [])];

  const filteredAlerts = allAlerts.filter((alert) => {
    if (filter !== 'all' && alert.type !== filter) return false;
    if (showUnreadOnly && alert.isRead) return false;
    return true;
  });

  const unreadCount = allAlerts.filter((a) => !a.isRead).length;

  return (
    <FadeIn className="space-y-4">
      <Flex align="center" justify="between">
        <Flex align="center" gap="2">
          <Heading size="6">Peringatan</Heading>
          {unreadCount > 0 && (
            <Badge color="red">{unreadCount}</Badge>
          )}
        </Flex>
        <Flex gap="2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAlertsToCSV(filteredAlerts)}
            disabled={filteredAlerts.length === 0}
          >
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Export CSV</span>
          </Button>
          <Button
            variant={showUnreadOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            {showUnreadOnly ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}
            Belum Dibaca
          </Button>
        </Flex>
      </Flex>

      {/* Filters */}
      <SlideUp delay={0.1}>
        <Card className="p-4">
          <Flex wrap="wrap" gap="2">
            <FilterButton
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              icon={<Filter className="h-4 w-4" />}
            >
              Semua
            </FilterButton>
            <FilterButton
              active={filter === 'SPEEDING'}
              onClick={() => setFilter('SPEEDING')}
              icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
            >
              Kecepatan
            </FilterButton>
            <FilterButton
              active={filter === 'GEOFENCE_ENTER'}
              onClick={() => setFilter('GEOFENCE_ENTER')}
              icon={<AlertCircle className="h-4 w-4 text-blue-500" />}
            >
              Masuk Geofence
            </FilterButton>
            <FilterButton
              active={filter === 'GEOFENCE_EXIT'}
              onClick={() => setFilter('GEOFENCE_EXIT')}
              icon={<AlertCircle className="h-4 w-4 text-purple-500" />}
            >
              Keluar Geofence
            </FilterButton>
            <FilterButton
              active={filter === 'SOS'}
              onClick={() => setFilter('SOS')}
              icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
            >
              SOS
            </FilterButton>
          </Flex>
        </Card>
      </SlideUp>

      {/* Alert List */}
      <SlideUp delay={0.2}>
        <Card>
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                ))}
              </div>
            </div>
          ) : filteredAlerts.length > 0 ? (
            <div className="divide-y">
              <StaggerContainer>
                {filteredAlerts.map((alert) => (
                  <StaggerItem key={alert.id}>
                    <AlertRow alert={alert} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          ) : (
            <Flex direction="column" align="center" justify="center" className="h-64">
              <Bell className="h-12 w-12 text-zinc-400" />
              <Text color="gray" mt="2">Tidak ada peringatan</Text>
              <Text size="1" color="gray">
                {showUnreadOnly ? 'Semua peringatan sudah dibaca' : 'Tidak ada peringatan yang sesuai filter'}
              </Text>
            </Flex>
          )}
        </Card>
      </SlideUp>
    </FadeIn>
  );
}

function FilterButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
    >
      {icon}
      <span className="ml-1">{children}</span>
    </Button>
  );
}

function AlertRow({ alert }: { alert: AlertWithDevice }) {
  const utils = api.useUtils();
  const markReadMutation = api.alert.markRead.useMutation({
    onSuccess: () => utils.alert.list.invalidate(),
  });
  const deleteMutation = api.alert.delete.useMutation({
    onSuccess: () => utils.alert.list.invalidate(),
  });

  const severityColors: Record<string, 'blue' | 'yellow' | 'red'> = {
    INFO: 'blue',
    WARNING: 'yellow',
    CRITICAL: 'red',
  };

  const typeIcons: Record<string, React.ReactNode> = {
    SPEEDING: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    GEOFENCE_ENTER: <AlertCircle className="h-5 w-5 text-blue-500" />,
    GEOFENCE_EXIT: <AlertCircle className="h-5 w-5 text-purple-500" />,
    SOS: <AlertTriangle className="h-5 w-5 text-red-500" />,
    IGNITION_ON: <Info className="h-5 w-5 text-green-500" />,
    IGNITION_OFF: <Info className="h-5 w-5 text-zinc-500" />,
  };

  return (
    <Flex align="start" gap="4" p="4" className={!alert.isRead ? 'bg-blue-50 dark:bg-blue-950' : ''}>
      <Box className="mt-1">{typeIcons[alert.type] ?? <Bell className="h-5 w-5" />}</Box>
      <Box className="flex-1">
        <Flex align="center" gap="2">
          <Text weight="medium">{alert.message}</Text>
          <Badge color={severityColors[alert.severity] ?? 'blue'}>
            {alert.severity}
          </Badge>
        </Flex>
        <Flex align="center" gap="4" mt="1">
          {alert.device && <Text size="1" color="gray">{alert.device.name}</Text>}
          <Text size="1" color="gray">{new Date(alert.triggeredAt).toLocaleString('id-ID')}</Text>
        </Flex>
      </Box>
      <Flex gap="2">
        {!alert.isRead && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markReadMutation.mutate({ id: alert.id })}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => deleteMutation.mutate({ id: alert.id })}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </Flex>
    </Flex>
  );
}
