import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de Next.js — protección de rutas en el edge.
 *
 * Estrategia simplificada:
 * - Solo verifica que exista la cookie __session (cualquier valor).
 * - La verificación real del token/rol se hace en los layouts de cada área.
 * - Esto evita dependencia del Firebase Admin SDK en el edge.
 *
 * Flujo:
 *  /admin    → no cookie → /login?callbackUrl=/admin
 *  /dashboard → no cookie → /login?callbackUrl=/dashboard
 *  Otras rutas → pasan libremente
 */

const PROTECTED_ROUTES = ['/admin', '/dashboard'];
const SESSION_COOKIE   = '__session';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Solo proteger rutas de admin y dashboard
  const requiresAuth = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (!requiresAuth) return NextResponse.next();

  // Verificar existencia de la cookie (cualquier valor no vacío)
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const hasSession    = !!(sessionCookie && sessionCookie.trim().length > 0);

  if (!hasSession) {
    const callbackUrl = encodeURIComponent(
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    );
    const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|apple-touch-icon|og-default|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
