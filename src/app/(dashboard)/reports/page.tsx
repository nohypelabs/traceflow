'use client';

import { useState } from 'react';
import { api } from '@/lib/api-provider';
import { FileText, Download, Calendar, TrendingUp, AlertTriangle, Truck, BarChart3 } from 'lucide-react';
import { FadeIn, SlideUp } from '@/components/ui/animation';
import { PageWrapper, CyberCard, NeonButton, NeonStat } from '@/components/ui/page-wrapper';
import { Button } from '@/components/ui/button';
import { generateReportSummary, generateDetailedReport, exportReportToCSV, getDateRange, type ReportData } from '@/lib/reports';

type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [dateRange, setDateRange] = useState(getDateRange('daily'));

  const { data: stats } = api.dashboard.getStats.useQuery();
  const { data: devices } = api.device.list.useQuery();
  const { data: trips } = api.trip.list.useQuery({ from: dateRange.start, to: dateRange.end });
  const { data: alerts } = api.alert.list.useQuery({ limit: 1000 });

  const reportData: ReportData = {
    period,
    startDate: dateRange.start,
    endDate: dateRange.end,
    stats: {
      totalDevices: stats?.totalDevices ?? 0,
      onlineDevices: stats?.onlineDevices ?? 0,
      offlineDevices: stats?.offlineDevices ?? 0,
      idleDevices: stats?.idleDevices ?? 0,
      totalTrips: trips?.length ?? 0,
      totalDistance: trips?.reduce((sum, t) => sum + (t.distance ?? 0), 0) ?? 0,
      totalAlerts: alerts?.items?.length ?? 0,
      alertsByType: alerts?.items?.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {} as Record<string, number>) ?? {},
    },
    devices: devices?.map(d => ({
      id: d.id, name: d.name, status: d.status,
      trips: trips?.filter(t => t.deviceId === d.id).length ?? 0,
      distance: trips?.filter(t => t.deviceId === d.id).reduce((s, t) => s + (t.distance ?? 0), 0) ?? 0,
      alerts: alerts?.items?.filter(a => a.deviceId === d.id).length ?? 0,
    })) ?? [],
    topAlerts: Object.entries((alerts?.items ?? []).reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {} as Record<string, number>))
      .map(([type, count]) => ({ type, count: count as number, percentage: ((count as number) / ((alerts?.items?.length || 1))) * 100 }))
      .sort((a, b) => b.count - a.count).slice(0, 5),
  };

  const handlePeriodChange = (p: ReportPeriod) => { setPeriod(p); setDateRange(getDateRange(p)); };

  return (
    <PageWrapper title="Laporan" subtitle="ANALYTICS • EXPORTABLE REPORTS">
      {/* Period selector */}
      <CyberCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs tracking-[1.5px] text-zinc-400 mr-1">PERIODE</div>
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => handlePeriodChange(p)} className={period === p ? '' : 'border-white/10'}>
              <Calendar className="mr-2 h-4 w-4" /> {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
            </Button>
          ))}
          <div className="ml-auto text-xs text-zinc-500 tabular-nums">
            {dateRange.start.toLocaleDateString('id-ID')} — {dateRange.end.toLocaleDateString('id-ID')}
          </div>
        </div>
      </CyberCard>

      {/* Top Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <SlideUp delay={0.05}><NeonStat label="TOTAL PERJALANAN" value={reportData.stats.totalTrips} icon={<Truck className="h-5 w-5" />} color="blue" /></SlideUp>
        <SlideUp delay={0.1}><NeonStat label="TOTAL JARAK" value={`${reportData.stats.totalDistance.toFixed(0)} km`} icon={<TrendingUp className="h-5 w-5" />} color="green" /></SlideUp>
        <SlideUp delay={0.15}><NeonStat label="TOTAL PERINGATAN" value={reportData.stats.totalAlerts} icon={<AlertTriangle className="h-5 w-5" />} color="yellow" /></SlideUp>
        <SlideUp delay={0.2}><NeonStat label="PERANGKAT ONLINE" value={reportData.stats.onlineDevices} icon={<BarChart3 className="h-5 w-5" />} color="cyan" /></SlideUp>
      </div>

      {/* Export buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => { const s = generateReportSummary(reportData); downloadBlob(s, `laporan_${period}.txt`, 'text/plain'); }} className="border-white/15"><FileText className="mr-2 h-4 w-4" /> Export TXT</Button>
        <Button variant="outline" onClick={() => { const r = generateDetailedReport(reportData); downloadBlob(r, `laporan_detail_${period}.md`, 'text/markdown'); }} className="border-white/15"><FileText className="mr-2 h-4 w-4" /> Export MD</Button>
        <NeonButton onClick={() => exportReportToCSV(reportData)}><Download className="mr-2 h-4 w-4" /> Export CSV</NeonButton>
      </div>

      {/* Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <CyberCard className="p-5">
          <div className="mb-4 text-sm font-medium tracking-wider text-zinc-400">PERINGATAN TERATAS</div>
          {reportData.topAlerts.length ? reportData.topAlerts.map((a, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 text-sm border-b border-white/5 last:border-0">
              <span>{a.type}</span>
              <span className="font-mono text-cyan-400">{a.count} <span className="text-xs text-zinc-500">({a.percentage.toFixed(0)}%)</span></span>
            </div>
          )) : <div className="text-sm text-zinc-500">Tidak ada data</div>}
        </CyberCard>

        <CyberCard className="p-5">
          <div className="mb-4 text-sm font-medium tracking-wider text-zinc-400">RINGKASAN PERANGKAT (TOP 5)</div>
          {reportData.devices.length ? reportData.devices.slice(0, 5).map((d) => (
            <div key={d.id} className="flex items-center justify-between py-1.5 text-sm border-b border-white/5 last:border-0">
              <div>
                <div>{d.name}</div>
                <div className="text-[10px] text-zinc-500">{d.status}</div>
              </div>
              <div className="flex gap-5 text-right font-mono text-xs">
                <div>{d.trips} trip<br /><span className="text-zinc-500">trips</span></div>
                <div>{d.distance.toFixed(0)} km<br /><span className="text-zinc-500">jarak</span></div>
              </div>
            </div>
          )) : <div className="text-sm text-zinc-500">Tidak ada data</div>}
        </CyberCard>
      </div>
    </PageWrapper>
  );
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}
