// Export utility for CSV and PDF

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('Tidak ada data untuk diexport');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Headers
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportDevicesToCSV(devices: any[]) {
  const data = devices.map(device => ({
    'Nama': device.name,
    'IMEI': device.imei,
    'Status': device.status,
    'Plat Kendaraan': device.vehiclePlate ?? '-',
    'Jenis Kendaraan': device.vehicleType ?? '-',
    'Provider': device.provider,
    'Terakhir Dilihat': device.lastSeenAt 
      ? new Date(device.lastSeenAt).toLocaleString('id-ID')
      : 'Belum pernah',
    'Lintang': device.lastLatitude ?? '-',
    'Bujur': device.lastLongitude ?? '-',
  }));
  
  exportToCSV(data, 'perangkat_traceflow');
}

export function exportTripsToCSV(trips: any[]) {
  const data = trips.map(trip => ({
    'Perangkat': trip.device?.name ?? '-',
    'Tanggal Mulai': new Date(trip.startedAt).toLocaleString('id-ID'),
    'Tanggal Selesai': trip.endedAt 
      ? new Date(trip.endedAt).toLocaleString('id-ID')
      : '-',
    'Jarak (km)': trip.distance ? (trip.distance / 1000).toFixed(2) : '-',
    'Durasi (menit)': trip.duration ? Math.round(trip.duration / 60) : '-',
    'Kecepatan Maks (km/j)': trip.maxSpeed ? Math.round(trip.maxSpeed) : '-',
    'Kecepatan Rata² (km/j)': trip.averageSpeed ? Math.round(trip.averageSpeed) : '-',
    'Alamat Mulai': trip.startAddress ?? '-',
    'Alamat Selesai': trip.endAddress ?? '-',
  }));
  
  exportToCSV(data, 'perjalanan_traceflow');
}

export function exportAlertsToCSV(alerts: any[]) {
  const data = alerts.map(alert => ({
    'Tanggal': new Date(alert.triggeredAt).toLocaleString('id-ID'),
    'Perangkat': alert.device?.name ?? '-',
    'Tipe': alert.type,
    'Tingkat': alert.severity,
    'Pesan': alert.message,
    'Lintang': alert.latitude ?? '-',
    'Bujur': alert.longitude ?? '-',
    'Dibaca': alert.isRead ? 'Ya' : 'Tidak',
  }));
  
  exportToCSV(data, 'peringatan_traceflow');
}

export function exportLocationsToCSV(locations: any[], deviceName: string) {
  const data = locations.map(loc => ({
    'Waktu': new Date(loc.recordedAt).toLocaleString('id-ID'),
    'Lintang': loc.latitude,
    'Bujur': loc.longitude,
    'Kecepatan (km/j)': loc.speed ? Math.round(loc.speed) : '-',
    'Heading': loc.heading ? Math.round(loc.heading) : '-',
    'Ignition': loc.ignition ? 'On' : 'Off',
  }));
  
  exportToCSV(data, `lokasi_${deviceName.replace(/\s+/g, '_')}`);
}
