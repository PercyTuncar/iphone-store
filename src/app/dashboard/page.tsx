'use client';

/**
 * /dashboard — Client dashboard main page.
 * Loads the user's most recent active order and shows a summary.
 * Full order detail is at /dashboard/pedido/[orderId].
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';
import { ChevronRight, Package, CheckCircle, AlertTriangle, Smartphone } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getOrdersByUser } from '@/lib/firebase/orders';
import { Spinner } from '@/components/ui/Spinner';
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AppImage } from '@/components/ui/AppImage';
import { formatSoles } from '@/lib/utils/currency';
import type { Order } from '@/types/order';

const STATUS_LABELS: Record<string, string> = {
  pending_first_payment: 'Esperando aprobación',
  payment_rejected_first: 'Primer pago rechazado',
  active:    'En curso',
  completed: 'Completado',
  delivering:'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  defaulted: 'Cancelado por mora',
};

export default function DashboardPage() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) { router.replace('/login?callbackUrl=/dashboard'); return; }

    getOrdersByUser(firebaseUser.uid)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [firebaseUser, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" label="Cargando tus pedidos…" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 gap-6">
        <div className="w-20 h-20 rounded-[22px] bg-accent/10 flex items-center justify-center" aria-hidden="true">
          <Smartphone size={40} className="text-accent" />
        </div>
        <div>
          <h1 className="text-subtitle mb-2">No tienes pedidos aún</h1>
          <p className="text-body text-text-secondary mb-6 max-w-sm">
            Elige tu iPhone favorito y comienza a pagarlo hoy en cómodas cuotas.
          </p>
          <Link href="/#modelos" className="btn btn-primary px-8 py-3">
            Ver iPhones disponibles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-section-title mb-1">Mis Pedidos</h1>
        <p className="text-body text-text-secondary">
          Hola, {firebaseUser?.displayName?.split(' ')[0]} 👋
        </p>
      </div>

      {orders.map((order) => (
        <OrderSummaryCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrderSummaryCard({ order }: { order: Order }) {
  const isActive   = order.status === 'active';
  const isDefaulted = order.status === 'defaulted' || order.status === 'cancelled';

  return (
    <Link
      href={`/dashboard/pedido/${order.id}`}
      className={clsx(
        'card p-5 block no-underline',
        'hover:shadow-elevated transition-shadow',
        isDefaulted && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-[10px] bg-bg-secondary overflow-hidden flex-shrink-0">
          <AppImage
            src={order.productThumbnail || '/og-default.jpg'}
            alt={order.productTitle}
            width={64}
            height={64}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <p className="font-semibold text-[15px] line-clamp-1">{order.productTitle}</p>
            <Badge variant={statusToBadgeVariant(order.status)}>
              {STATUS_LABELS[order.status] ?? order.status}
            </Badge>
          </div>

          <p className="text-caption text-text-secondary mt-1">
            {order.installments} cuotas de {formatSoles(order.installmentAmount)}
          </p>

          {/* Default/cancelled warning */}
          {isDefaulted && (
            <div className="flex items-center gap-1.5 mt-2">
              <AlertTriangle size={13} className="text-danger flex-shrink-0" aria-hidden="true" />
              <p className="text-caption text-danger">
                {order.status === 'defaulted'
                  ? 'Pedido cancelado por mora superior a 15 días.'
                  : 'Pedido cancelado.'}
              </p>
            </div>
          )}

          {/* Active: show delivery status */}
          {(order.status === 'delivering' || order.status === 'delivered') && (
            <div className="flex items-center gap-1.5 mt-2">
              {order.status === 'delivered'
                ? <CheckCircle size={13} className="text-success flex-shrink-0" aria-hidden="true" />
                : <Package     size={13} className="text-accent  flex-shrink-0" aria-hidden="true" />
              }
              <p className="text-caption text-text-secondary">
                {order.status === 'delivered' ? 'Entregado ✓' : 'En camino a tu dirección'}
              </p>
            </div>
          )}
        </div>

        <ChevronRight size={18} className="text-text-tertiary flex-shrink-0 mt-1" aria-hidden="true" />
      </div>

      {/* Progress bar for active orders */}
      {isActive && (
        <div className="mt-4 pt-4 border-t border-border">
          <ProgressBar
            value={0}
            label="Cuotas pagadas"
            height="sm"
            variant="accent"
            animated={false}
          />
          <p className="text-caption text-text-tertiary mt-1">
            Ver detalles para el progreso completo →
          </p>
        </div>
      )}
    </Link>
  );
}
