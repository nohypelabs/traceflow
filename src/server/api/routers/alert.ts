import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { AlertType, AlertSeverity } from '@/generated/prisma/enums';

const ALERT_TYPES = [
  'SPEEDING', 'GEOFENCE_ENTER', 'GEOFENCE_EXIT', 'SOS',
  'IGNITION_ON', 'IGNITION_OFF', 'LOW_BATTERY', 'DEVICE_OFFLINE', 'IDLE_TOO_LONG',
] as const satisfies readonly AlertType[];

const ALERT_SEVERITIES = ['INFO', 'WARNING', 'CRITICAL'] as const satisfies readonly AlertSeverity[];

export const alertRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().optional(),
        type: z.enum(ALERT_TYPES).optional(),
        severity: z.enum(ALERT_SEVERITIES).optional(),
        isRead: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const orgId = ctx.session.user.organizationId;

      const devices = orgId
        ? await prisma.device.findMany({
            where: { organizationId: orgId },
            select: { id: true },
          })
        : undefined;

      const deviceIds = devices?.map((d) => d.id);

      const alerts = await prisma.alert.findMany({
        where: {
          ...(input.deviceId ? { deviceId: input.deviceId } : deviceIds ? { deviceId: { in: deviceIds } } : {}),
          ...(input.type ? { type: input.type } : {}),
          ...(input.severity ? { severity: input.severity } : {}),
          ...(input.isRead !== undefined ? { isRead: input.isRead } : {}),
        },
        include: {
          device: { select: { name: true, vehiclePlate: true } },
          geofence: { select: { name: true } },
        },
        orderBy: { triggeredAt: 'desc' },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      const nextCursor = alerts.length > input.limit ? alerts.pop()?.id : undefined;

      return { items: alerts, nextCursor };
    }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.alert.update({
        where: { id: input.id },
        data: { isRead: true },
      });
      return { success: true };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const orgId = ctx.session.user.organizationId;

    const devices = orgId
      ? await prisma.device.findMany({
          where: { organizationId: orgId },
          select: { id: true },
        })
      : undefined;

    const deviceIds = devices?.map((d) => d.id);

    await prisma.alert.updateMany({
      where: {
        isRead: false,
        ...(deviceIds ? { deviceId: { in: deviceIds } } : {}),
      },
      data: { isRead: true },
    });

    return { success: true };
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.alert.delete({ where: { id: input.id } });
      return { success: true };
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.session.user.organizationId;

    const devices = orgId
      ? await prisma.device.findMany({
          where: { organizationId: orgId },
          select: { id: true },
        })
      : undefined;

    const deviceIds = devices?.map((d) => d.id);

    const count = await prisma.alert.count({
      where: {
        isRead: false,
        ...(deviceIds ? { deviceId: { in: deviceIds } } : {}),
      },
    });

    return count;
  }),
});
