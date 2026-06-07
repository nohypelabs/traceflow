import { initTRPC, TRPCError } from '@trpc/server';
export { TRPCError };
import superjson from 'superjson';
import type { Session } from 'next-auth';
import { auth } from '@/lib/auth';
import { hasMinRole } from '@/lib/roles';

interface CreateContextOptions {
  session: Session | null;
}

export async function createAuthContext(
  req: Request,
): Promise<CreateContextOptions> {
  // Get session from NextAuth
  const session = await auth();
  return { session };
}

const t = initTRPC.context<CreateContextOptions>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  return next({
    ctx: { session: ctx.session },
  });
});

// SUPER_ADMIN only (level 100)
export const superAdminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!hasMinRole(ctx.session.user.role, 'SUPER_ADMIN')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Super Admin access required' });
  }
  return next({ ctx });
});

// ADMIN or above (level 80+)
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!hasMinRole(ctx.session.user.role, 'ADMIN')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// MANAGER or above (level 60+)
export const managerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!hasMinRole(ctx.session.user.role, 'MANAGER')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Manager access required' });
  }
  return next({ ctx });
});
