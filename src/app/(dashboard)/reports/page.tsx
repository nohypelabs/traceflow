'use client';

import { useState } from 'react';
import { api } from '@/lib/api-provider';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Truck,
  BarChart3
} from 'lucide-react';
import { FadeIn, SlideUp } from '@/components/ui/animation';
import { Card, Flex, Box, Heading, Text, Badge, Tabs } from '@radix-ui/themes';
import { 
  generateReportSummary, 
  generateDetailedReport, 
  exportReportToCSV,
  getDateRange,
  type ReportData 
} from '@/lib/reports';

type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [dateRange, setDateRange] = useState(getDateRange('daily'));

  // Fetch data for report
  const { data: stats } = api.dashboard.getStats.useQuery();
  const { data: devices } = api.device.list.useQuery();
  const { data: trips } = api.trip.list.useQuery({
    from: dateRange.start,
    to: dateRange.end,
  });
  const { data: alerts } = api.alert.list.useQuery({ limit: 1000 });

  // Generate report data
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
      totalDistance: trips?.reduce((sum, trip) => sum + (trip.distance ?? 0), 0) ?? 0,
      totalAlerts: alerts?.items?.length ?? 0,
      alertsByType: alerts?.items?.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) ?? {},
    },
    devices: devices?.map(device => ({
      id: device.id,
      name: device.name,
      status: device.status,
      trips: trips?.filter(t => t.deviceId === device.id).length ?? 0,
      distance: trips?.filter(t => t.deviceId === device.id)
        .reduce((sum, t) => sum + (t.distance ?? 0), 0) ?? 0,
      alerts: alerts?.items?.filter(a => a.deviceId === device.id).length ?? 0,
    })) ?? [],
    topAlerts: Object.entries(
      alerts?.items?.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) ?? {}
    )
      .map(([type, count]) => ({
        type,
        count,
        percentage: ((count / (alerts?.items?.length ?? 1)) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };

  const handlePeriodChange = (newPeriod: ReportPeriod) => {
    setPeriod(newPeriod);
    setDateRange(getDateRange(newPeriod));
  };

  const handleExportSummary = () => {
    const summary = generateReportSummary(reportData);
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_${period}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExportDetailed = () => {
    const report = generateDetailedReport(reportData);
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan_detail_${period}_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExportCSV = () => {
    exportReportToCSV(reportData);
  };

  return (
    <FadeIn className="space-y-4">
      <Flex align="center" justify="between">
        <Heading size="6">Laporan</Heading>
        <Flex gap="2">
          <Button variant="outline" onClick={handleExportSummary}>
            <FileText className="mr-2 h-4 w-4" />
            Export TXT
          </Button>
          <Button variant="outline" onClick={handleExportDetailed}>
            <FileText className="mr-2 h-4 w-4" />
            Export MD
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </Flex>
      </Flex>

      {/* Period Selection */}
      <Card className="p-4">
        <Flex align="center" gap="4">
          <Text weight="medium">Periode:</Text>
          <Flex gap="2">
            <Button
              variant={period === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodChange('daily')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Harian
            </Button>
            <Button
              variant={period === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodChange('weekly')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Mingguan
            </Button>
            <Button
              variant={period === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodChange('monthly')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Bulanan
            </Button>
          </Flex>
          <Text size="2" color="gray">
            {dateRange.start.toLocaleDateString('id-ID')} - {dateRange.end.toLocaleDateString('id-ID')}
          </Text>
        </Flex>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SlideUp delay={0.1}>
          <Card className="p-4">
            <Flex align="center" gap="3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <Box>
                <Text size="1" color="gray">Total Perjalanan</Text>
                <Heading size="4">{reportData.stats.totalTrips}</Heading>
              </Box>
            </Flex>
          </Card>
        </SlideUp>

        <SlideUp delay={0.2}>
          <Card className="p-4">
            <Flex align="center" gap="3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <Box>
                <Text size="1" color="gray">Total Jarak</Text>
                <Heading size="4">{reportData.stats.totalDistance.toFixed(1)} km</Heading>
              </Box>
            </Flex>
          </Card>
        </SlideUp>

        <SlideUp delay={0.3}>
          <Card className="p-4">
            <Flex align="center" gap="3">
              <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <Box>
                <Text size="1" color="gray">Total Peringatan</Text>
                <Heading size="4">{reportData.stats.totalAlerts}</Heading>
              </Box>
            </Flex>
          </Card>
        </SlideUp>

        <SlideUp delay={0.4}>
          <Card className="p-4">
            <Flex align="center" gap="3">
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <Box>
                <Text size="1" color="gray">Perangkat Online</Text>
                <Heading size="4">{reportData.stats.onlineDevices}</Heading>
              </Box>
            </Flex>
          </Card>
        </SlideUp>
      </div>

      {/* Detailed Report */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Alerts */}
        <SlideUp delay={0.5}>
          <Card className="p-4">
            <Heading size="3" mb="4">Peringatan Teratas</Heading>
            {reportData.topAlerts.length > 0 ? (
              <div className="space-y-3">
                {reportData.topAlerts.map((alert, index) => (
                  <Flex key={alert.type} align="center" justify="between">
                    <Flex align="center" gap="2">
                      <Badge color="yellow">{index + 1}</Badge>
                      <Text size="2">{alert.type}</Text>
                    </Flex>
                    <Flex align="center" gap="2">
                      <Text size="2" weight="medium">{alert.count}</Text>
                      <Text size="1" color="gray">({alert.percentage.toFixed(1)}%)</Text>
                    </Flex>
                  </Flex>
                ))}
              </div>
            ) : (
              <Text color="gray">Tidak ada peringatan</Text>
            )}
          </Card>
        </SlideUp>

        {/* Device Summary */}
        <SlideUp delay={0.6}>
          <Card className="p-4">
            <Heading size="3" mb="4">Ringkasan Perangkat</Heading>
            {reportData.devices.length > 0 ? (
              <div className="space-y-3">
                {reportData.devices.slice(0, 5).map((device) => (
                  <Flex key={device.id} align="center" justify="between">
                    <Box>
                      <Text size="2" weight="medium">{device.name}</Text>
                      <Text size="1" color="gray">{device.status}</Text>
                    </Box>
                    <Flex gap="4">
                      <Box className="text-right">
                        <Text size="1" color="gray">Perjalanan</Text>
                        <Text size="2">{device.trips}</Text>
                      </Box>
                      <Box className="text-right">
                        <Text size="1" color="gray">Jarak</Text>
                        <Text size="2">{device.distance.toFixed(1)} km</Text>
                      </Box>
                    </Flex>
                  </Flex>
                ))}
              </div>
            ) : (
              <Text color="gray">Tidak ada perangkat</Text>
            )}
          </Card>
        </SlideUp>
      </div>
    </FadeIn>
  );
}
