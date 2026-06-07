import { createTRPCRouter, TRPCError, protectedProcedure, managerProcedure } from '@/server/api/trpc';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Verify a geofence belongs to the user's organization.
 */
async function verifyGeofenceOrgAccess(geofenceId: string, orgId: string | null): Promise<void> {
  if (!orgId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'No organization' });
  }

  const geofence = await prisma.geofence.findUnique({
    where: { id: geofenceId },
    select: { organizationId: true },
  });

  if (!geofence) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Geofence not found' });
  }

  if (geofence.organizationId !== orgId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
  }
}

export const geofenceRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.session.user.organizationId;

    return prisma.geofence.findMany({
      where: orgId ? { organizationId: orgId } : undefined,
      include: {
        geofenceDevices: {
          include: {
            device: {
              select: { id: true, name: true, vehiclePlate: true, status: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      await verifyGeofenceOrgAccess(input.id, ctx.session.user.organizationId);

      return prisma.geofence.findUnique({
        where: { id: input.id },
        include: { geofenceDevices: { include: { device: true } } },
      });
    }),

  create: managerProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        type: z.enum(['CIRCLE', 'POLYGON']),
        centerLat: z.number().optional(),
        centerLng: z.number().optional(),
        radius: z.number().optional(),
        polygon: z.array(z.array(z.number())).optional(),
        color: z.string().optional(),
        deviceIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.session.user.organizationId;
      if (!orgId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'User has no organization' });
      }

      const { deviceIds, ...data } = input;

      const geofence = await prisma.geofence.create({
        data: {
          ...data,
          organizationId: orgId,
        },
      });

      if (deviceIds && deviceIds.length > 0) {
        await prisma.geofenceDevice.createMany({
          data: deviceIds.map((deviceId) => ({
            geofenceId: geofence.id,
            deviceId,
          })),
        });
      }

      return geofence;
    }),

  update: managerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        deviceIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await verifyGeofenceOrgAccess(input.id, ctx.session.user.organizationId);

      const { id, deviceIds, ...data } = input;

      if (deviceIds) {
        await prisma.geofenceDevice.deleteMany({ where: { geofenceId: id } });
        await prisma.geofenceDevice.createMany({
          data: deviceIds.map((deviceId) => ({
            geofenceId: id,
            deviceId,
          })),
        });
      }

      return prisma.geofence.update({
        where: { id },
        data,
      });
    }),

  delete: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await verifyGeofenceOrgAccess(input.id, ctx.session.user.organizationId);

      await prisma.geofence.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
