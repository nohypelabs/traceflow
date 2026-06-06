import { createTRPCRouter, TRPCError, protectedProcedure, managerProcedure } from '@/server/api/trpc';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const organizationRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      // Ensure user belongs to this organization
      if (ctx.session.user.organizationId !== input.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }

      return prisma.organization.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: { users: true, devices: true },
          },
        },
      });
    }),

  update: managerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        slug: z.string().min(1).max(50).optional(),
        logo: z.string().url().optional().nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Ensure user belongs to this organization
      if (ctx.session.user.organizationId !== input.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }

      const { id, ...data } = input;

      return prisma.organization.update({
        where: { id },
        data,
      });
    }),
});
