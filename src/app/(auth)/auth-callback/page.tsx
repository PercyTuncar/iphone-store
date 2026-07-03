'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { ensureUserDocument } from '@/lib/firebase/auth';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg-secondary"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
      <AuthCallbackInner />
    </Suspense>
  );
}

function AuthCallbackInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get('callbackUrl') ?? '/dashboard';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function handleRedirectResult() {
      try {
        const result = await getRedirectResult(auth);

        if (!result) {
          // No redirect result — user arrived directly; send to home
          if (!cancelled) router.replace('/');
          return;
        }

        // Exchange ID token for session cookie
        const idToken = await result.user.getIdToken();
        const res = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        if (!res.ok) throw new Error('Failed to create session');

        // Ensure user document exists in Firestore
        await ensureUserDocument(result.user);

        if (!cancelled) router.replace(callbackUrl);
      } catch (err: unknown) {
        console.error('[auth-callback]', err);
        if (!cancelled) {
          setError('No se pudo completar el inicio de sesión. Intenta de nuevo.');
          toast.error('Error al iniciar sesión.');
        }
      }
    }

    handleRedirectResult();
    return () => { cancelled = true; };
  }, [callbackUrl, router]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-bg-secondary">
        <p className="text-danger text-label mb-4">{error}</p>
        <button
          onClick={() => router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)}
          className="btn btn-primary text-[15px] px-6 py-3"
        >
          Volver al inicio de sesión
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg-secondary">
      <Spinner size="lg" label="Verificando sesión…" />
      <p className="text-body text-text-secondary">Verificando sesión…</p>
    </main>
  );
}
