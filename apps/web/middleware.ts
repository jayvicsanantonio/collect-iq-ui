import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for server-side authentication checks
 * Protects routes that require authentication
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute =
    pathname.startsWith('/upload') ||
    pathname.startsWith('/vault') ||
    pathname.startsWith('/cards');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check for access token in cookies
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    // No token - redirect to home (client-side AuthGuard will handle sign in)
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Token exists - allow request to proceed
  // Note: Token validation happens in API routes and client-side
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
