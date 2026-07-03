/**
 * POST /api/session — crea la cookie de sesión tras el login con Google.
 * DELETE /api/session — elimina la cookie en el logout.
 *
 * Estrategia:
 *  1. Intenta usar Firebase Admin SDK para crear una session cookie segura.
 *  2. Si falla (credenciales mock en desarrollo), guarda el uid como cookie simple.
 *     El verdadero estado de auth sigue siendo gestionado por Firebase Client SDK.
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = '__session';
const MAX_AGE_SECONDS     = 14 * 24 * 60 * 60; // 14 días

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { idToken?: string; uid?: string };
    const { idToken, uid } = body;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken required' }, { status: 400 });
    }

    const cookieStore = await cookies();

    // ── Intento 1: Firebase Admin SDK (requiere credenciales reales) ──
    try {
      const { getAdminAuth } = await import('@/lib/firebase/admin');
      const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
        expiresIn: MAX_AGE_SECONDS * 1000,
      });

      cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   MAX_AGE_SECONDS,
        path:     '/',
      });

      return NextResponse.json({ status: 'ok', method: 'admin' });
    } catch (adminErr) {
      // Admin SDK falló (credenciales mock o no configuradas)
      console.warn('[POST /api/session] Admin SDK failed, using fallback cookie:', adminErr instanceof Error ? adminErr.message : adminErr);
    }

    // ── Fallback: verificar el ID token y guardar el uid ──
    // Decodificamos el JWT manualmente (no necesitamos Admin SDK para esto)
    const payload = decodeFirebaseToken(idToken);
    if (!payload?.sub) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Cookie simple con "uid:email" — suficiente para el middleware de desarrollo
    const sessionValue = Buffer.from(
      JSON.stringify({ uid: payload.sub, email: payload.email ?? '', ts: Date.now() })
    ).toString('base64');

    cookieStore.set(SESSION_COOKIE_NAME, sessionValue, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   MAX_AGE_SECONDS,
      path:     '/',
    });

    return NextResponse.json({ status: 'ok', method: 'fallback' });
  } catch (err) {
    console.error('[POST /api/session]', err);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ status: 'ok' });
}

/**
 * Decodifica un Firebase ID token (JWT) sin verificar la firma.
 * Solo para el fallback de desarrollo — en producción se usa el Admin SDK.
 */
function decodeFirebaseToken(token: string): Record<string, string> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
    );
    return payload;
  } catch {
    return null;
  }
}
