// Report Generation Utility

export interface ReportData {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  stats: {
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    idleDevices: number;
    totalTrips: number;
    totalDistance: number; // in km
    totalAlerts: number;
    alertsByType: Record<string, number>;
  };
  devices: Array<{
    id: string;
    name: string;
    status: string;
    trips: number;
    distance: number;
    alerts: number;
  }>;
  topAlerts: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export function generateReportSummary(data: ReportData): string {
  const { period, stats } = data;
  
  const periodLabel = {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
  }[period];

  let summary = `📊 *Laporan ${periodLabel} TraceFlow*\n`;
  summary += `📅 ${data.startDate.toLocaleDateString('id-ID')} - ${data.endDate.toLocaleDateString('id-ID')}\n\n`;

  summary += `*Statistik Umum*\n`;
  summary += `📱 Total Perangkat: ${stats.totalDevices}\n`;
  summary += `🟢 Online: ${stats.onlineDevices}\n`;
  summary += `⚫ Offline: ${stats.offlineDevices}\n`;
  summary += `🟡 Idle: ${stats.idleDevices}\n\n`;

  summary += `*Perjalanan*\n`;
  summary += `🛣️ Total Perjalanan: ${stats.totalTrips}\n`;
  summary += `📏 Total Jarak: ${stats.totalDistance.toFixed(1)} km\n\n`;

  summary += `*Peringatan*\n`;
  summary += `⚠️ Total Peringatan: ${stats.totalAlerts}\n`;

  if (Object.keys(stats.alertsByType).length > 0) {
    summary += `\n*Detail Peringatan:*\n`;
    Object.entries(stats.alertsByType).forEach(([type, count]) => {
      const typeLabel = {
        SPEEDING: 'Kecepatan',
        GEOFENCE_ENTER: 'Masuk Geofence',
        GEOFENCE_EXIT: 'Keluar Geofence',
        SOS: 'SOS',
        IGNITION_ON: 'Ignition On',
        IGNITION_OFF: 'Ignition Off',
        LOW_BATTERY: 'Baterai Rendah',
        DEVICE_OFFLINE: 'Perangkat Offline',
        IDLE_TOO_LONG: 'Idle Terlalu Lama',
      }[type] || type;

      summary += `• ${typeLabel}: ${count}\n`;
    });
  }

  summary += `\n_Dikirim otomatis oleh TraceFlow_`;

  return summary;
}

export function generateDetailedReport(data: ReportData): string {
  let report = `# Laporan ${data.period === 'daily' ? 'Harian' : data.period === 'weekly' ? 'Mingguan' : 'Bulanan'} TraceFlow\n\n`;
  report += `**Periode:** ${data.startDate.toLocaleDateString('id-ID')} - ${data.endDate.toLocaleDateString('id-ID')}\n\n`;

  report += `## Statistik Umum\n\n`;
  report += `| Metrik | Jumlah |\n`;
  report += `|--------|--------|\n`;
  report += `| Total Perangkat | ${data.stats.totalDevices} |\n`;
  report += `| Online | ${data.stats.onlineDevices} |\n`;
  report += `| Offline | ${data.stats.offlineDevices} |\n`;
  report += `| Idle | ${data.stats.idleDevices} |\n`;
  report += `| Total Perjalanan | ${data.stats.totalTrips} |\n`;
  report += `| Total Jarak | ${data.stats.totalDistance.toFixed(1)} km |\n`;
  report += `| Total Peringatan | ${data.stats.totalAlerts} |\n\n`;

  report += `## Perangkat\n\n`;
  report += `| Nama | Status | Perjalanan | Jarak (km) | Peringatan |\n`;
  report += `|------|--------|------------|------------|------------|\n`;
  data.devices.forEach(device => {
    report += `| ${device.name} | ${device.status} | ${device.trips} | ${device.distance.toFixed(1)} | ${device.alerts} |\n`;
  });
  report += `\n`;

  report += `## Peringatan Teratas\n\n`;
  report += `| Tipe | Jumlah | Persentase |\n`;
  report += `|------|--------|------------|\n`;
  data.topAlerts.forEach(alert => {
    report += `| ${alert.type} | ${alert.count} | ${alert.percentage.toFixed(1)}% |\n`;
  });

  return report;
}

export function exportReportToCSV(data: ReportData) {
  const headers = [
    'Metrik',
    'Nilai',
  ];

  const rows = [
    ['Periode', data.period],
    ['Tanggal Mulai', data.startDate.toLocaleDateString('id-ID')],
    ['Tanggal Selesai', data.endDate.toLocaleDateString('id-ID')],
    ['Total Perangkat', data.stats.totalDevices.toString()],
    ['Online', data.stats.onlineDevices.toString()],
    ['Offline', data.stats.offlineDevices.toString()],
    ['Idle', data.stats.idleDevices.toString()],
    ['Total Perjalanan', data.stats.totalTrips.toString()],
    ['Total Jarak (km)', data.stats.totalDistance.toFixed(1)],
    ['Total Peringatan', data.stats.totalAlerts.toString()],
  ];

  // Add alert types
  Object.entries(data.stats.alertsByType).forEach(([type, count]) => {
    rows.push([`Peringatan: ${type}`, count.toString()]);
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `laporan_${data.period}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Helper to get date range for reports
export function getDateRange(period: 'daily' | 'weekly' | 'monthly'): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();

  switch (period) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      start.setMonth(now.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end: now };
}
