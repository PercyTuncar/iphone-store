'use client';

/**
 * BottomTabBar — fixed mobile navigation bar.
 * Visible only on screens < md (768px).
 * Uses glassmorphism + safe-area-inset-bottom for iPhone notch support.
 *
 * Tabs:
 *  1. Inicio   — /
 *  2. iPhones  — opens a bottom sheet with model list
 *  3. Perfil   — shows user name when logged in, /dashboard or /login
 *  4. Blog     — /blog
 *  5. Más      — opens menu with additional options (role-based)
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  Home,
  Smartphone,
  User,
  BookOpen,
  X,
  MoreHorizontal,
  Package,
  CreditCard,
  Settings,
  LogOut,
  ShoppingBag,
  Users,
  BarChart3,
  FileText,
} from 'lucide-react';
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
  const { firebaseUser, appUser, loading, effectivePhotoURL, effectiveName, signOut } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Close sheet on route change
  useEffect(() => {
    setSheetOpen(false);
    setMoreMenuOpen(false);
  }, [pathname]);

  // Scroll lock when sheet or menu is open
  useEffect(() => {
    document.body.style.overflow = (sheetOpen || moreMenuOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sheetOpen, moreMenuOpen]);

  // Drag handlers for closing sheets
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
    setDragCurrentY(clientY);
    setIsDragging(true);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Allow dragging both up and down, but only apply downward movement
    setDragCurrentY(clientY);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    const deltaY = dragCurrentY - dragStartY;

    // Close if dragged down more than 80px
    if (deltaY > 80) {
      setSheetOpen(false);
      setMoreMenuOpen(false);
    }

    setIsDragging(false);
    setDragStartY(0);
    setDragCurrentY(0);
  };

  // Calculate drag offset - only positive values (dragging down)
  const dragOffset = isDragging ? Math.max(0, dragCurrentY - dragStartY) : 0;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const handleProfileTab = () => {
    if (firebaseUser) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const isAdmin = appUser?.role === 'admin';

  // Menu options for clients
  const clientMenuOptions = [
    {
      icon: <Package size={20} />,
      label: 'Mis Pedidos',
      href: '/dashboard/pedidos',
      show: !!firebaseUser,
    },
    {
      icon: <CreditCard size={20} />,
      label: 'Pagos',
      href: '/dashboard/pagos',
      show: !!firebaseUser,
    },
    {
      icon: <ShoppingBag size={20} />,
      label: 'Todos los iPhones',
      href: '/iphone-en-cuotas',
      show: true,
    },
    {
      icon: <FileText size={20} />,
      label: 'Términos y Condiciones',
      href: '/terminos',
      show: true,
    },
  ];

  // Additional options for admin
  const adminMenuOptions = [
    {
      icon: <Settings size={20} />,
      label: 'Panel Admin',
      href: '/admin',
      show: true,
    },
    {
      icon: <Users size={20} />,
      label: 'Gestionar Pedidos',
      href: '/admin/orders',
      show: true,
    },
    {
      icon: <BarChart3 size={20} />,
      label: 'Estadísticas',
      href: '/admin',
      show: true,
    },
  ];

  const menuOptions = isAdmin
    ? [...adminMenuOptions, ...clientMenuOptions]
    : clientMenuOptions;

  const visibleMenuOptions = menuOptions.filter((opt) => opt.show);

  return (
    <>
      {/* ── Tab Bar ── */}
      <nav
        className={clsx(
          'fixed bottom-0 left-0 right-0 z-50',
          'flex md:hidden',
          'navbar-glass border-t border-[#E5E5EA]/80',
          'h-16'
        )}
        aria-label="Navegación móvil"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex w-full items-center">
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
              'flex-1 flex flex-col items-center justify-center gap-0.5',
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

          {/* Perfil - Floating Action Button */}
          <div className="flex-1 relative flex items-center justify-center h-full">
            <button
              onClick={handleProfileTab}
              aria-label={firebaseUser ? 'Mi perfil' : 'Ingresar'}
              className={clsx(
                'flex flex-col items-center justify-center w-full h-full',
                'transition-colors duration-150',
                isActive('/dashboard') ? 'text-accent' : 'text-text-secondary'
              )}
            >
              {/* Foto flotante arriba del navbar */}
              <div className="absolute -top-3 w-12 h-12 rounded-full ring-[3px] ring-accent bg-white shadow-xl flex items-center justify-center overflow-hidden z-30">
                {!loading && effectivePhotoURL ? (
                  <AppImage
                    src={effectivePhotoURL}
                    alt={effectiveName || 'Foto de perfil'}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-accent flex items-center justify-center">
                    <User size={22} className="text-white" aria-hidden="true" />
                  </div>
                )}
              </div>

              {/* Texto abajo, más bajo que los otros para estar debajo de la foto */}
              <span className="text-[10px] font-medium truncate max-w-[64px] absolute bottom-[6px]">
                {firebaseUser && effectiveName
                  ? effectiveName.split(' ')[0]
                  : 'Ingresar'}
              </span>
            </button>
          </div>

          {/* Blog */}
          <TabButton
            href="/blog"
            label="Blog"
            icon={<BookOpen size={22} />}
            active={isActive('/blog')}
          />

          {/* Más — opens menu */}
          <button
            onClick={() => setMoreMenuOpen(true)}
            aria-label="Más opciones"
            className={clsx(
              'flex-1 flex flex-col items-center justify-center gap-0.5',
              'text-text-secondary transition-colors duration-150',
              moreMenuOpen && 'text-accent'
            )}
          >
            <MoreHorizontal size={22} aria-hidden="true" />
            <span className="text-[10px] font-medium">Más</span>
          </button>
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
              'animate-slide-up max-h-[80vh] overflow-y-auto',
              !isDragging && 'transition-transform duration-200 ease-out'
            )}
            style={{
              transform: `translateY(${dragOffset}px)`,
            }}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5 cursor-grab active:cursor-grabbing" aria-hidden="true" />

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

      {/* ── More Menu Sheet ── */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-[60] flex md:hidden flex-col justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMoreMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div
            role="dialog"
            aria-label="Más opciones"
            className={clsx(
              'relative bg-bg-card rounded-t-[24px] shadow-floating',
              'px-5 pt-5 pb-safe z-10',
              'animate-slide-up max-h-[80vh] overflow-y-auto',
              !isDragging && 'transition-transform duration-200 ease-out'
            )}
            style={{
              transform: `translateY(${dragOffset}px)`,
            }}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5 cursor-grab active:cursor-grabbing" aria-hidden="true" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-subtitle">Más opciones</h2>
                {isAdmin && (
                  <p className="text-caption text-text-secondary mt-1">
                    Modo Administrador
                  </p>
                )}
              </div>
              <button
                onClick={() => setMoreMenuOpen(false)}
                aria-label="Cerrar"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-secondary text-text-secondary hover:text-text-primary"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <ul className="divide-y divide-border">
              {visibleMenuOptions.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 py-4 text-[17px]',
                      'transition-colors duration-100',
                      pathname === item.href
                        ? 'text-accent font-medium'
                        : 'text-text-primary hover:text-accent'
                    )}
                  >
                    <span className="text-text-secondary">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}

              {/* Cerrar sesión si está logueado */}
              {firebaseUser && (
                <li>
                  <button
                    onClick={() => {
                      setMoreMenuOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-3 py-4 text-[17px] text-error hover:text-error-dark transition-colors duration-100 w-full"
                  >
                    <LogOut size={20} />
                    Cerrar sesión
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Spacer so page content isn't hidden behind the bar */}
      <div className="block md:hidden h-16" aria-hidden="true" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
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
        'flex-1 flex flex-col items-center justify-center gap-0.5',
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
