'use client';

/**
 * NavbarWrapper — renders the Navbar only on public routes.
 * Hides it on /admin and /dashboard which have their own navigation.
 * Needs to be a Client Component to use usePathname.
 */

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

export function NavbarWrapper() {
  const pathname = usePathname();
  const isAdminOrDash =
    pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  if (isAdminOrDash) return null;
  return <Navbar />;
}
