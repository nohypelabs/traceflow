import { createTRPCRouter, TRPCError, protectedProcedure } from '@/server/api/trpc';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Verify a device belongs to the user's organization.
 * Returns the device's org ID or throws.
 */
async function verifyDeviceOrgAccess(deviceId: string, orgId: string | null): Promise<void> {
  if (!orgId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'No organization' });
  }

  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    select: { organizationId: true },
  });

  if (!device) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Device not found' });
  }

  if (device.organizationId !== orgId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
  }
}

export const locationRouter = createTRPCRouter({
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.session.user.organizationId;

    const devices = await prisma.device.findMany({
      where: orgId ? { organizationId: orgId } : undefined,
      select: {
        id: true,
        name: true,
        status: true,
        lastLatitude: true,
        lastLongitude: true,
        lastSpeed: true,
        lastHeading: true,
        lastIgnition: true,
        lastSeenAt: true,
      },
    });

    return devices;
  }),

  getHistory: protectedProcedure
    .input(
      z.object({
        deviceId: z.string(),
        from: z.date(),
        to: z.date(),
      }),
    )
    .query(async ({ input, ctx }) => {
      await verifyDeviceOrgAccess(input.deviceId, ctx.session.user.organizationId);

      const locations = await prisma.location.findMany({
        where: {
          deviceId: input.deviceId,
          recordedAt: {
            gte: input.from,
            lte: input.to,
          },
        },
        orderBy: { recordedAt: 'asc' },
        select: {
          id: true,
          latitude: true,
          longitude: true,
          speed: true,
          heading: true,
          ignition: true,
          recordedAt: true,
        },
      });

      return locations;
    }),

  getByTrip: protectedProcedure
    .input(z.object({ tripId: z.string() }))
    .query(async ({ input, ctx }) => {
      const trip = await prisma.trip.findUnique({
        where: { id: input.tripId },
        select: {
          id: true,
          deviceId: true,
          startedAt: true,
          endedAt: true,
        },
      });

      if (!trip) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Trip not found' });
      }

      // Verify the trip's device belongs to user's org
      await verifyDeviceOrgAccess(trip.deviceId, ctx.session.user.organizationId);

      const locations = await prisma.location.findMany({
        where: {
          deviceId: trip.deviceId,
          recordedAt: {
            gte: trip.startedAt,
            lte: trip.endedAt ?? new Date(),
          },
        },
        orderBy: { recordedAt: 'asc' },
        select: {
          id: true,
          latitude: true,
          longitude: true,
          speed: true,
          heading: true,
          recordedAt: true,
        },
      });

      return locations;
    }),
});
