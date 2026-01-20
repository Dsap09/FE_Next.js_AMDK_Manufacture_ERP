import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ambil token dari Cookies (Middleware tidak bisa baca localStorage)
  const token = request.cookies.get('token'); 
  const { pathname } = request.nextUrl;

  // 1. Jika TIDAK ada token dan mencoba akses dashboard (/)
  if (!token && pathname === '/') {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // 2. Jika ADA token dan mencoba akses login/register
  if (token && (pathname === '/signin' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/signin', '/signup'], 
};