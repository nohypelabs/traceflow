import { initTRPC, TRPCError } from '@trpc/server';
export { TRPCError };
import superjson from 'superjson';
import type { Session } from 'next-auth';
import { auth } from '@/lib/auth';

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

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const managerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.session.user.role !== 'ADMIN' && ctx.session.user.role !== 'MANAGER') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Manager access required' });
  }
  return next({ ctx });
});
