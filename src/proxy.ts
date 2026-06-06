import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/api/auth', '/api/gps-webhook'];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((path) => pathname.startsWith(path));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Allow tRPC auth routes (register, login)
  if (pathname.startsWith('/api/trpc/auth.')) {
    return NextResponse.next();
  }

  // Check for NextAuth session token (edge-compatible)
  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ??
    request.cookies.get('__Secure-authjs.session-token')?.value;

  // API routes — return 401 if no session
  if (pathname.startsWith('/api/')) {
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Static / internal — skip
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Protected pages — redirect to login
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
