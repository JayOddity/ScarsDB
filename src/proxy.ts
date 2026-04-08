import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Auth routes are handled by next-auth, let them through
  // Protected routes can be added here later
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
