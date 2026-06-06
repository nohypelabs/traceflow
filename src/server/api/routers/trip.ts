import { createTRPCRouter, TRPCError, protectedProcedure } from '@/server/api/trpc';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const tripRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().optional(),
        from: z.date().optional(),
        to: z.date().optional(),
        limit: z.number().min(1).max(100).default(50),
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

      return prisma.trip.findMany({
        where: {
          ...(input.deviceId ? { deviceId: input.deviceId } : deviceIds ? { deviceId: { in: deviceIds } } : {}),
          ...(input.from ? { startedAt: { gte: input.from } } : {}),
          ...(input.to ? { endedAt: { lte: input.to } } : {}),
        },
        include: {
          device: {
            select: { name: true, vehiclePlate: true },
          },
        },
        orderBy: { startedAt: 'desc' },
        take: input.limit,
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const orgId = ctx.session.user.organizationId;

      const trip = await prisma.trip.findUnique({
        where: { id: input.id },
        include: {
          device: {
            select: { name: true, vehiclePlate: true, organizationId: true },
          },
        },
      });

      if (!trip) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Trip not found' });
      }

      // Verify the trip's device belongs to user's org
      if (orgId && trip.device.organizationId !== orgId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }

      return trip;
    }),
});
