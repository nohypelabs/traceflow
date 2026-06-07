import { createTRPCRouter, superAdminProcedure, protectedProcedure, TRPCError } from '@/server/api/trpc';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ROLE_HIERARCHY, type AppRole } from '@/lib/roles';

const roleEnum = z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'VIEWER']);

export const roleRouter = createTRPCRouter({
  // List all users with their roles (SUPER_ADMIN only)
  listUsers: superAdminProcedure.query(async () => {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // Change a user's role (SUPER_ADMIN only, can't change own role)
  changeRole: superAdminProcedure
    .input(
      z.object({
        userId: z.string(),
        newRole: roleEnum,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const actorId = ctx.session.user.id;

      // Can't change your own role
      if (input.userId === actorId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Tidak bisa mengubah role sendiri',
        });
      }

      // Verify target exists
      const target = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { id: true, role: true },
      });

      if (!target) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User tidak ditemukan',
        });
      }

      const updated = await prisma.user.update({
        where: { id: input.userId },
        data: { role: input.newRole },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return updated;
    }),

  // Get current user's role info
  myRole: protectedProcedure.query(({ ctx }) => {
    const role = ctx.session.user.role as AppRole;
    return {
      role,
      level: ROLE_HIERARCHY[role] ?? 0,
    };
  }),
});
