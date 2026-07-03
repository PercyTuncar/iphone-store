'use client';

/**
 * BottomTabBar — fixed mobile navigation bar.
 * Visible only on screens < md (768px).
 * Uses glassmorphism + safe-area-inset-bottom for iPhone notch support.
 *
 * Tabs:
 *  1. Inicio   — /
 *  2. iPhones  — opens a bottom sheet with model list
 *  3. Perfil   — /dashboard (auth) or /login (guest)
 *  4. Blog     — /blog
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { Home, Smartphone, User, BookOpen, X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { AppImage } from '@/components/ui/AppImage';

const IPHONE_MENU = [
  { label: 'iPhone 17 Pro Max', slug: 'iphone-17-pro-max' },
  { label: 'iPhone 17 Pro',     slug: 'iphone-17-pro' },
  { label: 'iPhone 16 Pro Max', slug: 'iphone-16-pro-max' },
  { label: 'iPhone 16 Pro',     slug: 'iphone-16-pro' },
  { label: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max' },
  { label: 'iPhone 15 Pro',     slug: 'iphone-15-pro' },
  { label: 'iPhone 15',         slug: 'iphone-15' },
  { label: 'iPhone 14 Pro Max', slug: 'iphone-14-pro-max' },
  { label: 'iPhone 13',         slug: 'iphone-13' },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { firebaseUser, loading, effectivePhotoURL, effectiveName } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Close sheet on route change
  useEffect(() => { setSheetOpen(false); }, [pathname]);

  // Scroll lock when sheet is open
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sheetOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const handleProfileTab = () => {
    if (firebaseUser) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <>
      {/* ── Tab Bar ── */}
      <nav
        className={clsx(
          'fixed bottom-0 left-0 right-0 z-50',
          'flex md:hidden',
          'navbar-glass border-t border-[#E5E5EA]/80',
          'pb-safe',
          'h-16'
        )}
        aria-label="Navegación móvil"
      >
        <div className="flex w-full h-full">
          {/* Inicio */}
          <TabButton
            href="/"
            label="Inicio"
            icon={<Home size={22} />}
            active={isActive('/')}
          />

          {/* iPhones — opens sheet */}
          <button
            onClick={() => setSheetOpen(true)}
            aria-label="Ver iPhones"
            className={clsx(
              'flex-1 flex flex-col items-center justify-center gap-0.5 pt-2',
              'text-text-secondary transition-colors duration-150',
              isActive('/iphone') && 'text-accent'
            )}
          >
            <Smartphone
              size={22}
              aria-hidden="true"
              className={isActive('/iphone') ? 'text-accent' : ''}
            />
            <span className={clsx('text-[10px] font-medium', isActive('/iphone') && 'text-accent')}>
              iPhones
            </span>
          </button>

          {/* Perfil */}
          <button
            onClick={handleProfileTab}
            aria-label={firebaseUser ? 'Mi perfil' : 'Ingresar'}
            className={clsx(
              'flex-1 flex flex-col items-center justify-center gap-0.5 pt-2',
              'transition-colors duration-150',
              isActive('/dashboard') ? 'text-accent' : 'text-text-secondary'
            )}
          >
            {!loading && effectivePhotoURL ? (
              <span className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-accent">
                <AppImage
                  src={effectivePhotoURL}
                  alt={effectiveName || 'Foto de perfil'}
                  width={28}
                  height={28}
                />
              </span>
            ) : (
              <User size={22} aria-hidden="true" />
            )}
            <span className="text-[10px] font-medium">
              {firebaseUser ? 'Perfil' : 'Ingresar'}
            </span>
          </button>

          {/* Blog */}
          <TabButton
            href="/blog"
            label="Blog"
            icon={<BookOpen size={22} />}
            active={isActive('/blog')}
          />
        </div>
      </nav>

      {/* ── iPhone model sheet ── */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] flex md:hidden flex-col justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div
            role="dialog"
            aria-label="Seleccionar modelo de iPhone"
            className={clsx(
              'relative bg-bg-card rounded-t-[24px] shadow-floating',
              'px-5 pt-5 pb-safe z-10',
              'animate-slide-up max-h-[80vh] overflow-y-auto'
            )}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" aria-hidden="true" />

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-subtitle">iPhones Disponibles</h2>
              <button
                onClick={() => setSheetOpen(false)}
                aria-label="Cerrar"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-secondary text-text-secondary hover:text-text-primary"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <ul className="divide-y divide-border">
              {IPHONE_MENU.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/iphone/${item.slug}`}
                    className={clsx(
                      'flex items-center justify-between py-4 text-[17px]',
                      'transition-colors duration-100',
                      pathname === `/iphone/${item.slug}`
                        ? 'text-accent font-medium'
                        : 'text-text-primary hover:text-accent'
                    )}
                  >
                    {item.label}
                    <span className="text-text-tertiary text-[13px]">Ver →</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/#modelos"
              onClick={() => setSheetOpen(false)}
              className="block text-center py-4 mt-2 text-accent font-semibold"
            >
              Ver todos los modelos
            </Link>
          </div>
        </div>
      )}

      {/* Spacer so page content isn't hidden behind the bar */}
      <div className="block md:hidden h-16 pb-safe" aria-hidden="true" />
    </>
  );
}

// ── Sub-component ─────────────────────────────────────────────
function TabButton({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex-1 flex flex-col items-center justify-center gap-0.5 pt-2',
        'transition-colors duration-150',
        active ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
