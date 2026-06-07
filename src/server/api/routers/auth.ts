import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/api/trpc';
import { prisma } from '@/lib/prisma';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        password: z.string().min(8).max(100),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email already registered',
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);

      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: 'USER',
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      return user;
    }),

  getSession: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      // Check if email is already taken
      if (input.email) {
        const existing = await prisma.user.findFirst({
          where: {
            email: input.email,
            id: { not: userId },
          },
        });

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already in use',
          });
        }
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          email: input.email,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return user;
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8).max(100),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user?.password) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User has no password set',
        });
      }

      const isValid = await bcrypt.compare(input.currentPassword, user.password);

      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Current password is incorrect',
        });
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 12);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return { success: true };
    }),
});
