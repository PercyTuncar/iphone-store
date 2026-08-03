/**
 * DashboardNav - Navegación del dashboard del cliente
 * El admin también puede acceder aquí para gestionar sus propios pedidos como cliente
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  User,
  LogOut,
  Smartphone,
  Settings
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

const NAV_ITEMS = [
  {
    label: 'Resumen',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Mis Pedidos',
    href: '/dashboard/pedidos',
    icon: Package,
  },
  {
    label: 'Pagos',
    href: '/dashboard/pagos',
    icon: CreditCard,
  },
  {
    label: 'Mi Perfil',
    href: '/dashboard/perfil',
    icon: User,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { firebaseUser, appUser, signOut, effectiveName, effectivePhotoURL } = useAuth();

  const isAdmin = appUser?.role === 'admin';

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-text-primary hover:opacity-70 transition-opacity"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
              <Smartphone size={16} className="text-white" />
            </span>
            <span className="hidden sm:inline">iPhone en Cuotas</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-[15px] transition-colors',
                    isActive
                      ? 'bg-bg-secondary text-accent font-medium'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50'
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}

            {/* Admin Link - solo si es admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[15px] transition-colors text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 border-l border-border ml-2"
              >
                <Settings size={16} />
                Panel Admin
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {effectivePhotoURL && (
              <img
                src={effectivePhotoURL}
                alt={effectiveName}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[13px] font-medium text-text-primary">
                {effectiveName || 'Usuario'}
              </span>
              <span className="text-[11px] text-text-tertiary">
                {firebaseUser?.email}
              </span>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-2 px-3 py-2 text-[14px] text-text-secondary hover:text-error transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-bg-secondary text-accent font-medium'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}

          {/* Admin Link Mobile */}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] whitespace-nowrap transition-colors text-text-secondary hover:text-text-primary border-l border-border"
            >
              <Settings size={14} />
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
