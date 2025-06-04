import { NextResponse } from 'next/server';

export function middleware() {
  // We'll let the client handle authentication
  // The client will check localStorage and redirect if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - register (registration page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)',
  ],
};