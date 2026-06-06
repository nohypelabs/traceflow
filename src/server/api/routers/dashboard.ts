import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { prisma } from '@/lib/prisma';

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.session.user.organizationId;
    const where = orgId ? { organizationId: orgId } : {};

    const [
      totalDevices,
      onlineDevices,
      idleDevices,
      offlineDevices,
      unreadAlerts,
    ] = await Promise.all([
      prisma.device.count({ where }),
      prisma.device.count({ where: { ...where, status: 'ONLINE' } }),
      prisma.device.count({ where: { ...where, status: 'IDLE' } }),
      prisma.device.count({ where: { ...where, status: 'OFFLINE' } }),
      prisma.alert.count({
        where: {
          isRead: false,
          ...(orgId
            ? { device: { organizationId: orgId } }
            : {}),
        },
      }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTrips = await prisma.trip.count({
      where: {
        startedAt: { gte: today },
        ...(orgId
          ? { device: { organizationId: orgId } }
          : {}),
      },
    });

    return {
      totalDevices,
      onlineDevices,
      idleDevices,
      offlineDevices,
      unreadAlerts,
      todayTrips,
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
