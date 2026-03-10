import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const role = token?.role as string | undefined;

  // Admin routes: require ADMIN or SUPER_ADMIN
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(
        new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url)
      );
    }
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Member routes: require authenticated user
  if (pathname.startsWith('/member') || pathname.startsWith('/id-card')) {
    if (!token) {
      return NextResponse.redirect(
        new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url)
      );
    }
  }

  // API admin routes
  if (pathname.startsWith('/api/admin')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/member/:path*',
    '/id-card/:path*',
    '/api/admin/:path*',
  ],
};
