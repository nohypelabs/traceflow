import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { prisma } from '@/lib/prisma';

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.session.user.organizationId;
    const where = orgId ? { organizationId: orgId } : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalDevices,
      onlineDevices,
      idleDevices,
      offlineDevices,
      unreadAlerts,
      todayTrips,
      todayTripData,
      geofences,
    ] = await Promise.all([
      // Device counts
      prisma.device.count({ where }),
      prisma.device.count({ where: { ...where, status: 'ONLINE' } }),
      prisma.device.count({ where: { ...where, status: 'IDLE' } }),
      prisma.device.count({ where: { ...where, status: 'OFFLINE' } }),
      // Alerts
      prisma.alert.count({
        where: {
          isRead: false,
          ...(orgId ? { device: { organizationId: orgId } } : {}),
        },
      }),
      // Today's trip count
      prisma.trip.count({
        where: {
          startedAt: { gte: today },
          ...(orgId ? { device: { organizationId: orgId } } : {}),
        },
      }),
      // Today's trip details (for distance + speed)
      prisma.trip.findMany({
        where: {
          startedAt: { gte: today },
          ...(orgId ? { device: { organizationId: orgId } } : {}),
        },
        select: {
          distance: true,
          averageSpeed: true,
          maxSpeed: true,
        },
      }),
      // Geofences
      prisma.geofence.findMany({
        where: orgId ? { organizationId: orgId } : {},
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    // Calculate aggregated stats
    const totalDistance = todayTripData.reduce((sum, t) => sum + (t.distance ?? 0), 0);
    const speeds = todayTripData.filter((t) => t.averageSpeed != null).map((t) => t.averageSpeed!);
    const avgSpeed = speeds.length > 0 ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0;
    const maxSpeed = todayTripData.reduce((max, t) => Math.max(max, t.maxSpeed ?? 0), 0);
    const fleetUtilPct = totalDevices > 0 ? Math.round(((onlineDevices + idleDevices) / totalDevices) * 100) : 0;

    return {
      totalDevices,
      onlineDevices,
      idleDevices,
      offlineDevices,
      unreadAlerts,
      todayTrips,
      // New real data
      totalDistance: Math.round(totalDistance * 10) / 10, // 1 decimal
      avgSpeed,
      maxSpeed: Math.round(maxSpeed),
      fleetUtilPct,
      geofences,
    };
  }),

  getRecentAlerts: protectedProcedure
    .query(async ({ ctx }) => {
      const orgId = ctx.session.user.organizationId;
      const devices = orgId
        ? await prisma.device.findMany({
            where: { organizationId: orgId },
            select: { id: true },
          })
        : undefined;

      const deviceIds = devices?.map((d) => d.id);

      return prisma.alert.findMany({
        where: deviceIds ? { deviceId: { in: deviceIds } } : {},
        include: {
          device: { select: { name: true, vehiclePlate: true } },
        },
        orderBy: { triggeredAt: 'desc' },
        take: 10,
      });
    }),
});
