'use client';

/**
 * Navbar — adaptive desktop/tablet navigation.
 * Hidden on mobile (replaced by BottomTabBar).
 *
 * Three visual states:
 * 1. Transparent  — scroll = 0, nav overlays hero content
 * 2. Glass premium — scroll > 50px, backdrop-filter blur + saturation
 * 3. Solid light   — /admin and /dashboard routes always solid
 *
 * Products are loaded dynamically from Firestore on mount to avoid 404 links.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  ChevronDown, LogOut, LayoutDashboard, UserCircle,
  Smartphone, BookOpen, Home,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { AppImage } from '@/components/ui/AppImage';
import { getAllPublishedProducts } from '@/lib/firebase/products';

interface NavProduct {
  label: string;
  slug: string;
}

export function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { appUser, firebaseUser, signOut, loading, effectivePhotoURL, effectiveName } = useAuth();

  const [scrolled,   setScrolled]   = useState(false);
  const [iphoneOpen, setIphoneOpen] = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const [iphoneMenu, setIphoneMenu] = useState<NavProduct[]>([]);

  const iphoneRef = useRef<HTMLDivElement>(null);
  const userRef   = useRef<HTMLDivElement>(null);

  // ── Load products dynamically on mount ──────────────────────
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getAllPublishedProducts();
        const navProducts = products.map((p) => ({
          label: p.title,
          slug: p.slug,
        }));

        // Sort by model priority (Pro Max > Pro > regular, newer > older)
        const modelPriority: Record<string, number> = {
          '17 Pro Max': 10,
          '17 Pro': 9,
          '16 Pro Max': 8,
          '16 Pro': 7,
          '15 Pro Max': 6,
          '15 Pro': 5,
          '15': 4,
          '14 Pro Max': 3,
          '14': 2,
          '13': 1,
        };

        navProducts.sort((a, b) => {
          const priorityA = Object.entries(modelPriority).find(([key]) =>
            a.label.toLowerCase().includes(key.toLowerCase())
          )?.[1] ?? 0;

          const priorityB = Object.entries(modelPriority).find(([key]) =>
            b.label.toLowerCase().includes(key.toLowerCase())
          )?.[1] ?? 0;

          return priorityB - priorityA;
        });

        setIphoneMenu(navProducts);
      } catch (error) {
        console.error('[Navbar] Error loading products:', error);
        // Keep empty array on error - graceful degradation
      }
    };

    loadProducts();
  }, []);

  // ── Scroll listener ──────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Close dropdowns on outside click ────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (iphoneRef.current && !iphoneRef.current.contains(e.target as Node)) setIphoneOpen(false);
      if (userRef.current   && !userRef.current.contains(e.target as Node))   setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Close dropdowns on route change ─────────────────────
  useEffect(() => {
    setIphoneOpen(false);
    setUserOpen(false);
  }, [pathname]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push('/');
  }, [signOut, router]);

  const isAdmin     = pathname.startsWith('/admin');
  const isDashboard = pathname.startsWith('/dashboard');
  const alwaysSolid = isAdmin || isDashboard;
  const isGlass     = scrolled && !alwaysSolid;
  const isTransparent = !scrolled && !alwaysSolid;

  return (
    <>
      <nav
        className={clsx(
          // Position + size
          'fixed top-0 left-0 right-0 z-50',
          'h-[60px]',
          // Transition
          'transition-all duration-300 ease-out',
          // State styles
          isGlass       && 'navbar-glass',
          alwaysSolid   && 'bg-white border-b border-[#E5E5EA]',
          isTransparent && 'bg-transparent',
          // Hidden on mobile
          'hidden md:flex items-center'
        )}
        aria-label="Navegación principal"
      >
        <div className="container-main flex items-center w-full gap-2">

          {/* ── Logo ─────────────────────────────────────── */}
          <Link
            href="/"
            className={clsx(
              'flex items-center gap-2 flex-shrink-0 mr-6',
              'font-semibold text-[17px] tracking-tight',
              'transition-opacity duration-200 hover:opacity-70'
            )}
            aria-label="iPhone en Cuotas — ir al inicio"
          >
            <span
              className="w-7 h-7 rounded-[8px] bg-gradient-accent flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <Smartphone size={14} className="text-white" />
            </span>
            <span className="text-text-primary">iPhone en Cuotas</span>
          </Link>

          {/* ── Nav links ────────────────────────────────── */}
          <div className="flex items-center gap-1 flex-1">

            {/* iPhones dropdown */}
            <div ref={iphoneRef} className="relative">
              <button
                onClick={() => setIphoneOpen(v => !v)}
                aria-expanded={iphoneOpen}
                aria-haspopup="true"
                className={clsx(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-[10px]',
                  'text-[15px] font-medium',
                  'transition-all duration-150',
                  iphoneOpen
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
                )}
              >
                <Smartphone size={14} aria-hidden="true" />
                iPhones
                <ChevronDown
                  size={13}
                  aria-hidden="true"
                  className={clsx('transition-transform duration-200', iphoneOpen && 'rotate-180')}
                />
              </button>

              {/* Dropdown panel */}
              {iphoneOpen && (
                <div
                  className={clsx(
                    'absolute top-full left-0 mt-2 w-60',
                    'glass-card py-1.5 z-50',
                    'animate-scale-in origin-top-left'
                  )}
                  role="menu"
                >
                  {iphoneMenu.length > 0 ? (
                    iphoneMenu.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/iphone/${item.slug}`}
                        role="menuitem"
                        className={clsx(
                          'flex items-center gap-2.5 px-4 py-2.5 text-[15px]',
                          'transition-colors duration-100',
                          pathname === `/iphone/${item.slug}`
                            ? 'text-accent font-semibold bg-accent/8'
                            : 'text-text-primary hover:bg-[#F2F2F7]'
                        )}
                      >
                        <Smartphone size={13} className="text-text-tertiary flex-shrink-0" aria-hidden="true" />
                        {item.label}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2.5 text-[15px] text-text-tertiary">
                      Cargando modelos...
                    </div>
                  )}
                  <div className="h-px bg-[#E5E5EA] mx-3 my-1" />
                  <Link
                    href="/#modelos"
                    role="menuitem"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[15px] text-accent font-medium hover:bg-accent/8 transition-colors"
                  >
                    <Home size={13} aria-hidden="true" />
                    Ver todos los modelos
                  </Link>
                </div>
              )}
            </div>

            {/* Blog */}
            <Link
              href="/blog"
              className={clsx(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-[10px]',
                'text-[15px] font-medium',
                'transition-all duration-150',
                pathname.startsWith('/blog')
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
              )}
            >
              <BookOpen size={14} aria-hidden="true" />
              Blog
            </Link>
          </div>

          {/* ── User element ─────────────────────────────── */}
          <div ref={userRef} className="relative ml-2 flex-shrink-0">
            {loading ? (
              <div className="h-9 w-24 skeleton rounded-pill" />
            ) : firebaseUser ? (
              /* Avatar button */
              <button
                onClick={() => setUserOpen(v => !v)}
                aria-expanded={userOpen}
                aria-haspopup="true"
                aria-label={`Cuenta de ${effectiveName || firebaseUser.email}`}
                className={clsx(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-[12px]',
                  'transition-all duration-150',
                  userOpen ? 'bg-accent/10' : 'hover:bg-black/5'
                )}
              >
                <span
                  className={clsx(
                    'w-8 h-8 rounded-full overflow-hidden flex-shrink-0',
                    'ring-2 ring-accent/30',
                    'transition-transform duration-150 hover:scale-105'
                  )}
                >
                  {effectivePhotoURL ? (
                    <AppImage
                      src={effectivePhotoURL}
                      alt={effectiveName || 'Foto de perfil'}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="w-full h-full bg-gradient-accent flex items-center justify-center text-white font-semibold text-sm">
                      {(effectiveName || firebaseUser.email || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="text-[14px] font-medium text-text-primary max-w-[100px] truncate hidden lg:block">
                  {effectiveName?.split(' ')[0] || 'Mi cuenta'}
                </span>
                <ChevronDown
                  size={13}
                  aria-hidden="true"
                  className={clsx(
                    'text-text-tertiary transition-transform duration-200',
                    userOpen && 'rotate-180'
                  )}
                />
              </button>
            ) : (
              /* Login button */
              <Link
                href="/login"
                className="btn btn-secondary text-[15px] px-5 py-2 h-9 flex items-center"
              >
                Ingresar
              </Link>
            )}

            {/* User dropdown */}
            {userOpen && firebaseUser && (
              <div
                className={clsx(
                  'absolute top-full right-0 mt-2 w-56',
                  'glass-card py-1.5 z-50',
                  'animate-scale-in origin-top-right'
                )}
                role="menu"
              >
                {/* User info header */}
                <div className="px-4 py-2.5 border-b border-[#E5E5EA]/60 mb-1">
                  <p className="text-[14px] font-semibold text-text-primary truncate">
                    {effectiveName || 'Usuario'}
                  </p>
                  <p className="text-[12px] text-text-tertiary truncate mt-0.5">
                    {firebaseUser.email}
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  role="menuitem"
                  className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-text-primary hover:bg-[#F2F2F7] transition-colors"
                >
                  <LayoutDashboard size={15} aria-hidden="true" className="text-accent flex-shrink-0" />
                  Mis Pedidos
                </Link>

                <Link
                  href="/dashboard/perfil"
                  role="menuitem"
                  className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-text-primary hover:bg-[#F2F2F7] transition-colors"
                >
                  <UserCircle size={15} aria-hidden="true" className="text-text-secondary flex-shrink-0" />
                  Mi Perfil
                  {appUser && !appUser.profileCompleted && (
                    <span className="ml-auto badge badge-warning text-[10px]">Completar</span>
                  )}
                </Link>

                {appUser?.role === 'admin' && (
                  <Link
                    href="/admin"
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-text-primary hover:bg-[#F2F2F7] transition-colors"
                  >
                    <LayoutDashboard size={15} aria-hidden="true" className="text-success flex-shrink-0" />
                    Panel Admin
                  </Link>
                )}

                <div className="h-px bg-[#E5E5EA]/60 mx-3 my-1" />

                <button
                  role="menuitem"
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-danger hover:bg-danger/8 transition-colors w-full text-left"
                >
                  <LogOut size={15} aria-hidden="true" className="flex-shrink-0" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for non-hero pages */}
      {(alwaysSolid || pathname === '/login') && (
        <div className="hidden md:block h-[60px]" aria-hidden="true" />
      )}
    </>
  );
}
