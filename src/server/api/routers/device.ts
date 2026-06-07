import { createTRPCRouter, TRPCError, protectedProcedure, managerProcedure } from '@/server/api/trpc';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@/generated/prisma/client';

const integrationModeSchema = z.enum([
  'TRACKER_WEBHOOK',
  'API_PUSH',
  'PHONE_GPS',
  'MOCK',
]);

const providerConfigSchema = z
  .object({
    integrationMode: integrationModeSchema,
    webhookFormat: z.enum(['PROVIDER_NATIVE', 'TRACEFLOW_JSON']),
    externalDeviceId: z.string().min(3).max(100),
  })
  .optional();

/**
 * Verify a device belongs to the user's organization.
 * Throws FORBIDDEN if mismatch or device not found.
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

export const deviceRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.session.user.organizationId;

    const devices = await prisma.device.findMany({
      where: orgId ? { organizationId: orgId } : undefined,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        imei: true,
        provider: true,
        vehiclePlate: true,
        vehicleType: true,
        status: true,
        lastSeenAt: true,
        lastLatitude: true,
        lastLongitude: true,
        lastSpeed: true,
        lastHeading: true,
        lastIgnition: true,
        createdAt: true,
      },
    });

    return devices;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      await verifyDeviceOrgAccess(input.id, ctx.session.user.organizationId);

      const device = await prisma.device.findUnique({
        where: { id: input.id },
        include: {
          geofenceDevices: {
            include: { geofence: true },
          },
        },
      });

      return device;
    }),

  create: managerProcedure
    .input(
      z
        .object({
          name: z.string().trim().min(1).max(100),
          imei: z.string().trim().min(3).max(100),
          provider: z.enum(['TELTONIKA', 'QUECLINK', 'CONCOX', 'MOCK']),
          vehiclePlate: z.string().trim().max(30).optional(),
          vehicleType: z.enum(['CAR', 'TRUCK', 'MOTORCYCLE', 'VAN', 'BUS', 'OTHER']).optional(),
          providerConfig: providerConfigSchema,
        })
        .superRefine((input, ctx) => {
          const mode = input.providerConfig?.integrationMode ?? 'TRACKER_WEBHOOK';

          if (mode === 'TRACKER_WEBHOOK' && input.provider === 'MOCK') {
            ctx.addIssue({
              code: 'custom',
              path: ['provider'],
              message: 'Physical tracker must use TELTONIKA, QUECLINK, or CONCOX',
            });
          }

          if (mode !== 'TRACKER_WEBHOOK' && input.provider !== 'MOCK') {
            ctx.addIssue({
              code: 'custom',
              path: ['provider'],
              message: 'TraceFlow JSON and mock integrations must use MOCK provider',
            });
          }
        }),
    )
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.session.user.organizationId;
      if (!orgId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'User has no organization' });
      }

      try {
        const device = await prisma.device.create({
          data: {
            ...input,
            vehiclePlate: input.vehiclePlate || null,
            providerConfig: input.providerConfig as Prisma.InputJsonValue ?? undefined,
            organizationId: orgId,
          },
        });

        return device;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError
          && error.code === 'P2002'
        ) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'IMEI atau Device ID sudah terdaftar',
          });
        }

        throw error;
      }
    }),

  update: managerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        vehiclePlate: z.string().optional(),
        vehicleType: z.enum(['CAR', 'TRUCK', 'MOTORCYCLE', 'VAN', 'BUS', 'OTHER']).optional(),
        providerConfig: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await verifyDeviceOrgAccess(input.id, ctx.session.user.organizationId);

      const { id, ...data } = input;

      const device = await prisma.device.update({
        where: { id },
        data: {
          ...data,
          providerConfig: data.providerConfig as Prisma.InputJsonValue ?? undefined,
        },
      });

      return device;
    }),

  delete: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await verifyDeviceOrgAccess(input.id, ctx.session.user.organizationId);

      await prisma.device.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
