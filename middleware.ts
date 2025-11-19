import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;
  
  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const payload = verifyToken(token.value);
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Redirect to admin if already logged in and trying to access login
  if (pathname === '/login' && token) {
    const payload = verifyToken(token.value);
    if (payload) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
