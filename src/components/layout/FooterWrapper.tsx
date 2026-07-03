'use client';

/**
 * FooterWrapper — renders the Footer only on public routes.
 * Hides it on /admin, /dashboard, /login, /auth-callback.
 */

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function FooterWrapper() {
  const pathname = usePathname();
  const isHidden =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth-callback');

  if (isHidden) return null;
  return <Footer />;
}
