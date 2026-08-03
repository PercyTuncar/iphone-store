'use client';

/**
 * StickyBuyBar — the "always visible" purchase CTA that follows the user while scrolling.
 *
 * Behavior (PRD §7.2):
 * - Hidden when hero section is visible (first 600px of scroll)
 * - Appears when user scrolls past 600px
 * - Mobile: fixed to bottom (above BottomTabBar)
 * - Desktop: fixed below the navbar (top position)
 * - Glassmorphism effect so content shows through
 * - Hides on /admin and /dashboard
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { ShoppingBag } from 'lucide-react';
import { formatSoles } from '@/lib/utils/currency';

interface StickyBuyBarProps {
  /** Product name to show in the bar */
  productName: string;
  /** First payment amount (down payment or first installment) */
  firstPaymentAmount: number;
  /** Number of installments */
  installments: number;
  /** Down payment amount (0 if none) */
  downPayment: number;
  /** Href for the "Reservar" button — or a click handler */
  onReserve: () => void;
  /** Whether the button should be disabled (e.g. out of stock) */
  disabled?: boolean;
}

const SCROLL_THRESHOLD = 600;

export function StickyBuyBar({
  productName,
  firstPaymentAmount,
  installments,
  downPayment,
  onReserve,
  disabled = false,
}: StickyBuyBarProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // Don't render on admin / dashboard routes
  const isProtectedRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  useEffect(() => {
    if (isProtectedRoute) return;

    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isProtectedRoute]);

  if (isProtectedRoute) return null;

  return (
    <div
      role="complementary"
      aria-label="Compra rápida"
      className={clsx(
        // Position — bottom on both mobile and desktop (floating card style)
        'fixed z-40',
        'bottom-16 md:bottom-6', // Above BottomTabBar on mobile, floating on desktop
        'left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-3xl',
        // Glassmorphism + rounded on desktop
        'glass border-t md:border md:rounded-[20px] md:shadow-2xl border-white/10',
        // Animation
        'transition-all duration-300 ease-out',
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none',
        // Height
        'h-14 md:h-auto md:py-3'
      )}
    >
      <div className="container-main md:px-6 flex items-center justify-between h-full gap-4">
        {/* Product info */}
        <div className="flex flex-col">
          <span className="text-label font-semibold text-text-primary line-clamp-1 hidden sm:block">
            {productName}
          </span>
          <span className="text-[13px] text-text-secondary">
            {installments === 1 ? (
              <>
                Pago al contado:{' '}
                <span className="font-semibold text-text-primary">
                  {formatSoles(firstPaymentAmount)}
                </span>
              </>
            ) : downPayment > 0 ? (
              <>
                Paga hoy:{' '}
                <span className="font-semibold text-text-primary">
                  {formatSoles(firstPaymentAmount)}
                </span>
              </>
            ) : (
              <>
                Primera cuota:{' '}
                <span className="font-semibold text-text-primary">
                  {formatSoles(firstPaymentAmount)}
                </span>
              </>
            )}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={onReserve}
          disabled={disabled}
          className={clsx(
            'btn btn-primary text-[15px] px-5 py-2.5 flex items-center gap-2',
            disabled && 'opacity-40 cursor-not-allowed'
          )}
        >
          <ShoppingBag size={16} aria-hidden="true" />
          <span>Reservar</span>
        </button>
      </div>
    </div>
  );
}
