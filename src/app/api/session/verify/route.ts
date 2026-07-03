/**
 * POST /api/session/verify
 * Internal endpoint called by middleware to verify the session cookie.
 * Not meant to be called by client code — no CORS headers needed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  const sessionCookie = request.headers.get('x-session-cookie');

  if (!sessionCookie) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  try {
    const auth = getAdminAuth();
    // checkSessionCookie verifies the cookie signature and expiry
    await auth.verifySessionCookie(sessionCookie, true /* checkRevoked */);
    return NextResponse.json({ valid: true });
  } catch {
    // Cookie is invalid, expired, or revoked
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
