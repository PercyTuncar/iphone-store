/**
 * Firebase Admin SDK — server-only initialization.
 *
 * Used by:
 * - middleware.ts   → verify session cookies on every protected request
 * - /api/session    → create session cookies after login
 *
 * NEVER import this in client components (NEXT_PUBLIC_* vars are not used here).
 * The private key stored in FIREBASE_ADMIN_PRIVATE_KEY must have literal \n
 * replaced with real newlines before passing to cert().
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? '')
    .replace(/\\n/g, '\n');

  return initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}
