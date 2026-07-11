import { NextRequest, NextResponse } from 'next/server';
import { authToken, AUTH_COOKIE } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/manifest.json', '/favicon.ico'];

export async function middleware(req: NextRequest) {
  const password = process.env.APP_PASSWORD;
  // No password configured => open (local dev). Set APP_PASSWORD in prod.
  if (!password) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const expected = await authToken(password);
  if (req.cookies.get(AUTH_COOKIE)?.value === expected) {
    return NextResponse.next();
  }

  // API calls get 401; pages get redirected to the login form.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
