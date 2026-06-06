import NextAuth from 'next-auth';
import type { DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      organizationId: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role?: string;
    organizationId?: string | null;
  }
}

interface AuthToken {
  id: string;
  role?: string;
  organizationId?: string | null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      const t = token as unknown as AuthToken;
      if (t && session.user) {
        session.user.id = t.id;
        session.user.role = t.role ?? 'VIEWER';
        session.user.organizationId = t.organizationId ?? null;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const typedToken = token as Record<string, unknown>;
        typedToken['id'] = user.id;
        typedToken['role'] = user.role;
        typedToken['organizationId'] = user.organizationId;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
