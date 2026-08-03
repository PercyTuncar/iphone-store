'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { ClientMetadata } from '@/components/seo/ClientMetadata';
import Link from 'next/link';

function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export default function LoginPage() {
  return (
    <>
      <ClientMetadata title="Iniciar Sesión" noindex={true} />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg-secondary"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
        <LoginInner />
      </Suspense>
    </>
  );
}

function LoginInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser, loading, signIn } = useAuth();

  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const [signingIn, setSigningIn] = useState(false);

  // ── Caso: usuario ya estaba logueado al llegar a /login ──
  // Solo redirige si el usuario tenía sesión ANTES de intentar hacer login.
  // NO redirige durante el proceso de sign-in (eso lo hace handleGoogleSignIn).
  useEffect(() => {
    if (!loading && firebaseUser && !signingIn) {
      router.replace(callbackUrl);
    }
  }, [loading, firebaseUser, signingIn, callbackUrl, router]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      // signIn() incluye: signInWithPopup + getIdToken + POST /api/session (cookie)
      // Solo después de que todo esto resuelve hacemos la redirección.
      // Esto evita la race condition donde el redirect ocurre antes de que
      // se establezca la cookie __session.
      await signIn(isMobile());

      // Cookie establecida → ahora sí redirigimos de forma segura
      router.replace(callbackUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      if (!msg.includes('popup-closed-by-user') && !msg.includes('cancelled-popup-request')) {
        toast.error('No se pudo iniciar sesión. Intenta de nuevo.');
      }
      setSigningIn(false);
    }
  };


  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <Spinner size="lg" label="Cargando…" />
      </main>
    );
  }

  if (firebaseUser) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <Spinner size="lg" label="Redirigiendo…" />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-secondary px-4">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Card */}
        <div className="bg-bg-card rounded-[24px] shadow-floating px-8 py-10 text-center">
          {/* Logo mark */}
          <div
            className="w-16 h-16 rounded-[18px] bg-accent flex items-center justify-center mx-auto mb-6 shadow-accent-glow"
            aria-hidden="true"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" />
            </svg>
          </div>

          <h1 className="text-subtitle mb-2">Ingresar</h1>
          <p className="text-body text-text-secondary mb-8 text-[15px]">
            Accede con tu cuenta de Google para continuar.
          </p>

          {/* Google Sign-in button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className={clsx(
              'w-full flex items-center justify-center gap-3',
              'bg-bg-card border border-border rounded-[14px]',
              'px-5 py-3.5 text-[17px] font-semibold text-text-primary',
              'hover:bg-bg-secondary transition-all duration-200',
              'hover:shadow-card',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            )}
            aria-busy={signingIn}
          >
            {signingIn ? (
              <Spinner size="sm" label="Ingresando…" />
            ) : (
              /* Google "G" logo SVG */
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>{signingIn ? 'Ingresando…' : 'Continuar con Google'}</span>
          </button>

          <p className="text-caption text-text-tertiary mt-6 leading-relaxed">
            Al continuar aceptas nuestros{' '}
            <Link href="/terminos" target="_blank" className="text-accent hover:underline">
              Términos y Condiciones
            </Link>
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href={callbackUrl.startsWith('/iphone') ? callbackUrl : '/'}
            className="text-label text-text-secondary hover:text-accent transition-colors"
          >
            ← Volver
          </Link>
        </div>
      </div>
    </main>
  );
}
