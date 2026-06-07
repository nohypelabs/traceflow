'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api-provider';
import { Bell, BellOff, Check, Trash2, Filter, AlertTriangle, AlertCircle, Info, Download, Loader2 } from 'lucide-react';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '@/components/ui/animation';
import { PageWrapper, CyberCard, NeonButton } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { exportAlertsToCSV } from '@/lib/export';

const severityAccent: Record<string, string> = {
  CRITICAL: 'border-red-500/50 bg-red-500/10',
  WARNING: 'border-yellow-500/50 bg-yellow-500/10',
  INFO: 'border-cyan-500/50 bg-cyan-500/10',
};

type AlertItem = {
  id: string;
  type: string;
  severity: string;
  message: string;
  latitude: number | null;
  longitude: number | null;
  isRead: boolean;
  triggeredAt: Date;
  device: { name: string; vehiclePlate: string | null };
  geofence: { name: string } | null;
};

export default function AlertsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const utils = api.useUtils();

  // Build query input
  const alertType = filter !== 'all' ? (filter as 'SPEEDING' | 'GEOFENCE_ENTER' | 'GEOFENCE_EXIT' | 'SOS' | 'IGNITION_ON' | 'IGNITION_OFF' | 'LOW_BATTERY' | 'DEVICE_OFFLINE' | 'IDLE_TOO_LONG') : undefined;
  const queryInput = {
    limit: 50,
    ...(alertType ? { type: alertType } : {}),
    ...(showUnreadOnly ? { isRead: false } : {}),
    ...(cursor ? { cursor } : {}),
  };
  if (showUnreadOnly) queryInput.isRead = false;
  if (cursor) queryInput.cursor = cursor;

  const alertsQuery = api.alert.list.useQuery(queryInput);
  const unreadCountQuery = api.alert.getUnreadCount.useQuery();

  const markReadMutation = api.alert.markRead.useMutation({
    onSuccess: () => {
      utils.alert.list.invalidate();
      utils.alert.getUnreadCount.invalidate();
    },
  });

  const markAllReadMutation = api.alert.markAllRead.useMutation({
    onSuccess: () => {
      utils.alert.list.invalidate();
      utils.alert.getUnreadCount.invalidate();
    },
  });

  const deleteMutation = api.alert.delete.useMutation({
    onSuccess: () => {
      utils.alert.list.invalidate();
      utils.alert.getUnreadCount.invalidate();
    },
  });

  const alerts: AlertItem[] = (alertsQuery.data?.items ?? []) as AlertItem[];
  const unreadCount = unreadCountQuery.data ?? 0;

  const handleMarkRead = useCallback((id: string) => {
    markReadMutation.mutate({ id });
  }, [markReadMutation]);

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate({ id });
  }, [deleteMutation]);

  const handleExport = () => {
    if (alerts.length === 0) return;
    exportAlertsToCSV(alerts);
  };

  const actions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={alerts.length === 0}
        className="border-white/15 bg-white/5"
      >
        <Download className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">Export CSV</span>
      </Button>
      {unreadCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllReadMutation.mutate()}
          disabled={markAllReadMutation.isPending}
          className="border-white/15 bg-white/5"
        >
          <Check className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Baca Semua</span>
        </Button>
      )}
      <Button
        variant={showUnreadOnly ? 'default' : 'outline'}
        size="sm"
        onClick={() => { setShowUnreadOnly(!showUnreadOnly); setCursor(undefined); }}
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
          <FilterButton
            active={filter === 'all'}
            onClick={() => { setFilter('all'); setCursor(undefined); }}
            icon={<Filter className="h-4 w-4" />}
          >
            Semua
          </FilterButton>
          <FilterButton
            active={filter === 'SPEEDING'}
            onClick={() => { setFilter('SPEEDING'); setCursor(undefined); }}
            icon={<AlertTriangle className="h-4 w-4 text-orange-400" />}
          >
            Kecepatan
          </FilterButton>
          <FilterButton
            active={filter === 'GEOFENCE_ENTER'}
            onClick={() => { setFilter('GEOFENCE_ENTER'); setCursor(undefined); }}
            icon={<AlertCircle className="h-4 w-4 text-blue-400" />}
          >
            Masuk Geofence
          </FilterButton>
          <FilterButton
            active={filter === 'GEOFENCE_EXIT'}
            onClick={() => { setFilter('GEOFENCE_EXIT'); setCursor(undefined); }}
            icon={<AlertCircle className="h-4 w-4 text-purple-400" />}
          >
            Keluar Geofence
          </FilterButton>
          <FilterButton
            active={filter === 'SOS'}
            onClick={() => { setFilter('SOS'); setCursor(undefined); }}
            icon={<AlertTriangle className="h-4 w-4 text-red-400" />}
          >
            SOS
          </FilterButton>
        </div>
      </CyberCard>

      {/* Alerts List */}
      <CyberCard>
        {alertsQuery.isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
          </div>
        ) : alerts.length > 0 ? (
          <>
            <div className="divide-y divide-white/5">
              <StaggerContainer>
                {alerts.map((alert) => (
                  <StaggerItem key={alert.id}>
                    <AlertRow alert={alert} onMarkRead={handleMarkRead} onDelete={handleDelete} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

            {/* Load more */}
            {alertsQuery.data?.nextCursor && (
              <div className="p-4 border-t border-white/5 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCursor(alertsQuery.data!.nextCursor!)}
                  disabled={alertsQuery.isFetching}
                  className="border-white/15"
                >
                  {alertsQuery.isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Muat Lebih Banyak
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Bell className="mb-3 h-10 w-10 text-zinc-600" />
            <div className="text-sm text-zinc-400">
              {showUnreadOnly ? 'Semua peringatan sudah dibaca' : 'Belum ada peringatan'}
            </div>
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

function AlertRow({ alert, onMarkRead, onDelete }: { alert: AlertItem; onMarkRead: (id: string) => void; onDelete: (id: string) => void }) {
  const sev = alert.severity || 'INFO';
  const accent = severityAccent[sev] || severityAccent.INFO;

  const typeIcon: Record<string, React.ReactNode> = {
    SPEEDING: <AlertTriangle className="h-4 w-4 text-orange-400" />,
    GEOFENCE_ENTER: <AlertCircle className="h-4 w-4 text-blue-400" />,
    GEOFENCE_EXIT: <AlertCircle className="h-4 w-4 text-purple-400" />,
    SOS: <AlertTriangle className="h-4 w-4 text-red-400" />,
    IGNITION_ON: <Info className="h-4 w-4 text-green-400" />,
    IGNITION_OFF: <Info className="h-4 w-4 text-zinc-400" />,
    LOW_BATTERY: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
    DEVICE_OFFLINE: <AlertCircle className="h-4 w-4 text-zinc-400" />,
    IDLE_TOO_LONG: <Info className="h-4 w-4 text-amber-400" />,
  };

  return (
    <div className={`flex items-start gap-4 p-4 transition ${!alert.isRead ? accent : 'hover:bg-white/5'}`}>
      <div className="mt-0.5">{typeIcon[alert.type] || <Info className="h-4 w-4 text-zinc-400" />}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium text-zinc-900 dark:text-white/95">{alert.message}</span>
          <span className={`rounded px-1.5 py-px text-[10px] font-mono tracking-wider ${sev === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : sev === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
            {sev}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400 dark:text-white/50">
          {alert.device?.name && <span className="font-mono text-cyan-400/70">{alert.device.name}</span>}
          {alert.geofence?.name && <span className="text-zinc-500">• {alert.geofence.name}</span>}
          <span>{new Date(alert.triggeredAt).toLocaleString('id-ID')}</span>
        </div>
      </div>
      <div className="flex shrink-0 gap-1.5">
        {!alert.isRead && (
          <Button variant="outline" size="sm" className="h-8 border-white/10" onClick={() => onMarkRead(alert.id)}>
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="outline" size="sm" className="h-8 border-white/10" onClick={() => onDelete(alert.id)}>
          <Trash2 className="h-3.5 w-3.5 text-red-400" />
        </Button>
      </div>
    </div>
  );
}
