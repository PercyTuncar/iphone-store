'use client';

/**
 * AdminSidebar — left navigation for all /admin/* pages.
 * Highlights the active route. Collapsible on mobile.
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Package, ShoppingCart, CreditCard,
  Star, FileText, Truck, Bell, AlertCircle, ScrollText,
  ChevronLeft, Menu, LogOut, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Dashboard',      href: '/admin',               icon: LayoutDashboard },
  { label: 'Productos',      href: '/admin/productos',      icon: Package         },
  { label: 'Pedidos',        href: '/admin/pedidos',        icon: ShoppingCart    },
  { label: 'Pagos',          href: '/admin/pagos',          icon: CreditCard      },
  { label: 'Reseñas',        href: '/admin/resenas',        icon: Star            },
  { label: 'Blog',           href: '/admin/blog',           icon: FileText        },
  { label: 'Envíos',         href: '/admin/envios',         icon: Truck           },
  { label: 'Abandonos',      href: '/admin/abandonos',      icon: AlertCircle     },
  { label: 'Notificaciones', href: '/admin/notificaciones', icon: Bell            },
  { label: 'Auditoría',      href: '/admin/auditoria',      icon: ScrollText      },
  { label: 'Administradores',href: '/admin/make-admin',     icon: ShieldCheck     },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut, firebaseUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col',
          'bg-bg-dark text-text-inverted',
          'transition-all duration-200',
          collapsed ? 'w-16' : 'w-56',
          'min-h-screen sticky top-0 flex-shrink-0'
        )}
        aria-label="Navegación del administrador"
      >
        {/* Logo + collapse toggle */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {!collapsed && (
            <span className="font-semibold text-[15px] truncate">iPhone en Cuotas</span>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#86868B] hover:text-white hover:bg-white/10 transition-colors ml-auto"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed
              ? <Menu size={16} aria-hidden="true" />
              : <ChevronLeft size={16} aria-hidden="true" />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={clsx(
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-[10px] transition-colors text-[14px]',
                isActive(href)
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-[#86868B] hover:text-white hover:bg-white/5'
              )}
              aria-current={isActive(href) ? 'page' : undefined}
            >
              <Icon size={18} aria-hidden="true" className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-white/10">
          {!collapsed && (
            <p className="text-caption text-[#6E6E73] mb-2 truncate">
              {firebaseUser?.email}
            </p>
          )}
          <button
            onClick={() => signOut()}
            className={clsx(
              'flex items-center gap-2 text-[#86868B] hover:text-white transition-colors text-[14px]',
              collapsed && 'justify-center w-full'
            )}
          >
            <LogOut size={16} aria-hidden="true" />
            {!collapsed && 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-bg-dark text-white border-b border-white/10">
        <span className="font-semibold text-[15px]">Admin</span>
        <details className="relative">
          <summary className="list-none cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10">
            <Menu size={18} aria-label="Menú" />
          </summary>
          <div className="absolute right-0 top-full mt-1 w-52 bg-bg-dark border border-white/10 rounded-[14px] py-2 z-50 shadow-floating">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-2.5 text-[14px] transition-colors',
                  isActive(href) ? 'text-white' : 'text-[#86868B] hover:text-white'
                )}>
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </>
  );
}
