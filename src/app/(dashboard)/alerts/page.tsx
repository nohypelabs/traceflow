'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-provider';
import { Bell, BellOff, Check, Trash2, Filter, AlertTriangle, AlertCircle, Info, Download } from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '@/components/ui/animation';
import { PageWrapper, CyberCard, NeonButton } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import type { AlertWithDevice } from '@/types';
import { exportAlertsToCSV } from '@/lib/export';

const severityAccent: Record<string, string> = {
  CRITICAL: 'border-red-500/50 bg-red-500/10',
  WARNING: 'border-yellow-500/50 bg-yellow-500/10',
  INFO: 'border-cyan-500/50 bg-cyan-500/10',
};

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

  const actions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportAlertsToCSV(filteredAlerts)}
        disabled={filteredAlerts.length === 0}
        className="border-white/15 bg-white/5"
      >
        <Download className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">Export CSV</span>
      </Button>
      <Button
        variant={showUnreadOnly ? 'default' : 'outline'}
        size="sm"
        onClick={() => setShowUnreadOnly(!showUnreadOnly)}
        className="border-white/15"
      >
        {showUnreadOnly ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}
        Belum Dibaca {unreadCount > 0 && `(${unreadCount})`}
      </Button>
    </div>
  );

  return (
    <PageWrapper
      title="Peringatan"
      subtitle="REAL-TIME ALERTS • GEOFENCE • SPEED • SOS"
      actions={actions}
    >
      {/* Filters */}
      <CyberCard className="p-4">
        <div className="flex flex-wrap gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} icon={<Filter className="h-4 w-4" />}>Semua</FilterButton>
          <FilterButton active={filter === 'SPEEDING'} onClick={() => setFilter('SPEEDING')} icon={<AlertTriangle className="h-4 w-4 text-orange-400" />}>Kecepatan</FilterButton>
          <FilterButton active={filter === 'GEOFENCE_ENTER'} onClick={() => setFilter('GEOFENCE_ENTER')} icon={<AlertCircle className="h-4 w-4 text-blue-400" />}>Masuk Geofence</FilterButton>
          <FilterButton active={filter === 'GEOFENCE_EXIT'} onClick={() => setFilter('GEOFENCE_EXIT')} icon={<AlertCircle className="h-4 w-4 text-purple-400" />}>Keluar Geofence</FilterButton>
          <FilterButton active={filter === 'SOS'} onClick={() => setFilter('SOS')} icon={<AlertTriangle className="h-4 w-4 text-red-400" />}>SOS</FilterButton>
        </div>
      </CyberCard>

      {/* Alerts List */}
      <CyberCard>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="divide-y divide-white/5">
            <StaggerContainer>
              {filteredAlerts.map((alert) => (
                <StaggerItem key={alert.id}>
                  <AlertRow alert={alert} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Bell className="mb-3 h-10 w-10 text-zinc-600" />
            <div className="text-sm text-zinc-400">Tidak ada peringatan yang sesuai</div>
          </div>
        )}
      </CyberCard>
    </PageWrapper>
  );
}

function FilterButton({ active, onClick, icon, children }: any) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className={active ? '' : 'border-white/10 bg-white/5'}
    >
      {icon}<span className="ml-1.5">{children}</span>
    </Button>
  );
}

function AlertRow({ alert }: { alert: AlertWithDevice }) {
  const utils = api.useUtils();
  const markReadMutation = api.alert.markRead.useMutation({ onSuccess: () => utils.alert.list.invalidate() });
  const deleteMutation = api.alert.delete.useMutation({ onSuccess: () => utils.alert.list.invalidate() });

  const sev = alert.severity || 'INFO';
  const accent = severityAccent[sev] || severityAccent.INFO;

  const typeIcon = {
    SPEEDING: <AlertTriangle className="h-4 w-4 text-orange-400" />,
    GEOFENCE_ENTER: <AlertCircle className="h-4 w-4 text-blue-400" />,
    GEOFENCE_EXIT: <AlertCircle className="h-4 w-4 text-purple-400" />,
    SOS: <AlertTriangle className="h-4 w-4 text-red-400" />,
  }[alert.type] || <Info className="h-4 w-4 text-zinc-400" />;

  return (
    <div className={`flex items-start gap-4 p-4 transition ${!alert.isRead ? accent : 'hover:bg-white/5'}`}>
      <div className="mt-0.5">{typeIcon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium text-white/95">{alert.message}</span>
          <span className={`rounded px-1.5 py-px text-[10px] font-mono tracking-wider ${sev === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : sev === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
            {sev}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-white/50">
          {alert.device?.name && <span className="font-mono text-cyan-400/70">{alert.device.name}</span>}
          <span>{new Date(alert.triggeredAt).toLocaleString('id-ID')}</span>
        </div>
      </div>
      <div className="flex shrink-0 gap-1.5">
        {!alert.isRead && (
          <Button variant="outline" size="sm" className="h-8 border-white/10" onClick={() => markReadMutation.mutate({ id: alert.id })}>
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="outline" size="sm" className="h-8 border-white/10" onClick={() => deleteMutation.mutate({ id: alert.id })}>
          <Trash2 className="h-3.5 w-3.5 text-red-400" />
        </Button>
      </div>
    </div>
  );
}
