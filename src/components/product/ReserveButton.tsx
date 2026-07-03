'use client';

/**
 * ReserveButton — CTA that checks auth before opening the payment modal.
 * If not logged in → router.push('/login?callbackUrl=[current path]')
 * If logged in → calls onReserve()
 */

import { useRouter, usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface ReserveButtonProps {
  onReserve: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'md' | 'lg';
  className?: string;
}

export function ReserveButton({
  onReserve,
  disabled = false,
  fullWidth = false,
  size = 'lg',
  className,
}: ReserveButtonProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const { firebaseUser, loading } = useAuth();

  const handleClick = () => {
    if (!firebaseUser) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }
    onReserve();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={clsx(
        'btn btn-primary flex items-center gap-2',
        size === 'lg' ? 'text-[17px] px-8 py-4' : 'text-[15px] px-5 py-3',
        fullWidth && 'w-full justify-center',
        (disabled || loading) && 'opacity-40 cursor-not-allowed',
        className
      )}
      aria-busy={loading}
    >
      <ShoppingBag size={size === 'lg' ? 18 : 16} aria-hidden="true" />
      {loading ? 'Cargando…' : disabled ? 'Sin stock' : 'Reservar Ahora'}
    </button>
  );
}
