'use client';

/**
 * /dashboard — Client dashboard main page.
 * Panel de control completo con resumen de pedidos, pagos y estadísticas.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import {
  ChevronRight,
  Package,
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingBag,
} from 'lucide-react';
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
  pending_payment: 'Pago pendiente',
  active: 'Activo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  completed: 'Completado',
};

export default function DashboardPage() {
  const { firebaseUser, appUser, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      // No redirigir desde aquí, el layout ya maneja esto
      return;
    }

    const uid = firebaseUser.uid; // Guardar el uid antes de la función async

    async function loadOrders() {
      try {
        const data = await getOrdersByUser(uid);
        setOrders(data);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [firebaseUser, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status === 'active');
  const pendingOrders = orders.filter(
    (o) => o.status === 'pending_first_payment' || o.status === 'payment_rejected_first'
  );
  const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'delivered');

  // Calcular estadísticas (usando los campos correctos del Order)
  const totalInvestment = orders.reduce((sum, o) => {
    return sum + (o.priceTotal || 0);
  }, 0);
  const totalPaid = 0; // TODO: calcular desde installments pagados
  const nextPaymentDate = activeOrders.length > 0 ? new Date() : null; // TODO: calcular próximo pago

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-section-title">
            Hola, {appUser?.firstName || firebaseUser?.displayName?.split(' ')[0] || 'Usuario'} 👋
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Aquí está el resumen de tus pedidos y pagos
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pedidos Activos */}
        <div className="card p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Package size={20} className="text-accent" />
            </div>
            <Badge variant={activeOrders.length > 0 ? 'success' : 'secondary'} size="sm">
              {activeOrders.length > 0 ? 'Activo' : 'Sin pedidos'}
            </Badge>
          </div>
          <div className="text-3xl font-semibold text-text-primary mb-1">
            {activeOrders.length}
          </div>
          <div className="text-label text-text-secondary">Pedidos activos</div>
        </div>

        {/* Pagos Pendientes */}
        <div className="card p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock size={20} className="text-warning" />
            </div>
            {pendingOrders.length > 0 && (
              <Badge variant="warning" size="sm">
                Pendiente
              </Badge>
            )}
          </div>
          <div className="text-3xl font-semibold text-text-primary mb-1">
            {pendingOrders.length}
          </div>
          <div className="text-label text-text-secondary">Pagos pendientes</div>
        </div>

        {/* Total Invertido */}
        <div className="card p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <DollarSign size={20} className="text-success" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-text-primary mb-1">
            {formatSoles(totalInvestment)}
          </div>
          <div className="text-label text-text-secondary">Total invertido</div>
        </div>

        {/* Pedidos Completados */}
        <div className="card p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle size={20} className="text-success" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-text-primary mb-1">
            {completedOrders.length}
          </div>
          <div className="text-label text-text-secondary">Completados</div>
        </div>
      </div>

      {/* Próximo Pago - si hay pedidos activos */}
      {activeOrders.length > 0 && nextPaymentDate && (
        <div className="card p-6 bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-text-primary mb-1">
                  Próximo pago programado
                </h3>
                <p className="text-body text-text-secondary mb-3">
                  Tienes un pago pendiente para el{' '}
                  <span className="font-medium text-text-primary">
                    {nextPaymentDate.toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </p>
                <Link
                  href="/dashboard/pagos"
                  className="inline-flex items-center gap-2 text-[15px] font-medium text-accent hover:underline"
                >
                  Ver detalles de pago
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mis Pedidos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-semibold text-text-primary">Mis Pedidos</h2>
          {orders.length > 3 && (
            <Link
              href="/dashboard/pedidos"
              className="text-[15px] text-accent hover:underline font-medium"
            >
              Ver todos
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-secondary mx-auto mb-4 flex items-center justify-center">
              <ShoppingBag size={32} className="text-text-tertiary" />
            </div>
            <h3 className="text-[17px] font-semibold text-text-primary mb-2">
              Aún no tienes pedidos
            </h3>
            <p className="text-body text-text-secondary mb-6 max-w-md mx-auto">
              Explora nuestro catálogo de iPhones y compra tu favorito en cómodas cuotas
              sin tarjeta de crédito.
            </p>
            <Link
              href="/iphone-en-cuotas"
              className="btn-primary inline-flex items-center gap-2"
            >
              <ShoppingBag size={18} />
              Ver iPhones disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/pagos"
          className="card p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all">
              <CreditCard size={24} className="text-accent group-hover:text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[17px] font-semibold text-text-primary mb-1">
                Gestionar Pagos
              </h3>
              <p className="text-caption text-text-secondary">
                Ver historial y próximas cuotas
              </p>
            </div>
            <ChevronRight size={20} className="text-text-tertiary group-hover:text-accent" />
          </div>
        </Link>

        <Link
          href="/dashboard/perfil"
          className="card p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success group-hover:scale-110 transition-all">
              <TrendingUp size={24} className="text-success group-hover:text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[17px] font-semibold text-text-primary mb-1">
                Mi Perfil
              </h3>
              <p className="text-caption text-text-secondary">
                Actualizar datos personales
              </p>
            </div>
            <ChevronRight size={20} className="text-text-tertiary group-hover:text-success" />
          </div>
        </Link>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const isActive = order.status === 'active';
  const isPending = order.status === 'pending_first_payment' || order.status === 'payment_rejected_first';

  return (
    <Link
      href={`/dashboard/pedido/${order.id}`}
      className="card p-5 hover:shadow-md transition-shadow block"
    >
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-bg-secondary flex-shrink-0">
          {order.productThumbnail && (
            <AppImage
              src={order.productThumbnail}
              alt={order.productTitle || 'Producto'}
              fill
              className="object-contain p-2"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-text-primary mb-1 truncate">
                {order.productTitle || 'Producto sin nombre'}
              </h3>
              <p className="text-caption text-text-secondary">
                Pedido #{order.id.slice(0, 8)}
              </p>
            </div>
            <Badge variant={statusToBadgeVariant[order.status] || 'secondary'} size="sm">
              {STATUS_LABELS[order.status] || order.status}
            </Badge>
          </div>

          {/* Mostrar información financiera */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-caption">
              <span className="text-text-secondary">
                {order.installments} cuotas de {formatSoles(order.installmentAmount || 0)}
              </span>
              <span className="font-semibold text-text-primary">
                Total: {formatSoles(order.priceTotal || 0)}
              </span>
            </div>

            {/* Mensaje para pedidos pendientes */}
            {isPending && (
              <div className="flex items-center gap-2 text-caption text-warning bg-warning/10 px-3 py-2 rounded-lg">
                <Clock size={14} />
                <span>Esperando aprobación del primer pago</span>
              </div>
            )}

            {/* Progress bar para pedidos activos */}
            {isActive && (
              <div className="mt-3">
                <ProgressBar
                  value={0}
                  label="Progreso de pagos"
                  height="sm"
                  variant="accent"
                  animated={false}
                />
              </div>
            )}
          </div>
        </div>

        <ChevronRight size={18} className="text-text-tertiary flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}
