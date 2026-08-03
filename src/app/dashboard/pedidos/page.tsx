'use client';

/**
 * /dashboard/pedidos — Lista completa de pedidos del cliente
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { ChevronRight, Clock, Package, Search } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getOrdersByUser } from '@/lib/firebase/orders';
import { Spinner } from '@/components/ui/Spinner';
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge';
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

const STATUS_FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Activos', value: 'active' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Completados', value: 'completed' },
];

export default function PedidosPage() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) return;

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

  // Filtrar pedidos
  const filteredOrders = orders.filter((order) => {
    // Filtro de búsqueda
    const matchesSearch =
      !searchQuery ||
      order.productTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtro de estado
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = order.status === 'active';
    } else if (statusFilter === 'pending') {
      matchesStatus =
        order.status === 'pending_first_payment' || order.status === 'payment_rejected_first';
    } else if (statusFilter === 'completed') {
      matchesStatus = order.status === 'completed' || order.status === 'delivered';
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-section-title mb-2">Mis Pedidos</h1>
        <p className="text-body text-text-secondary">
          Aquí puedes ver todos tus pedidos y su estado
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="text"
              placeholder="Buscar por producto o ID de pedido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={clsx(
                'px-4 py-2 rounded-lg text-[14px] font-medium whitespace-nowrap transition-colors',
                statusFilter === filter.value
                  ? 'bg-accent text-white'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-semibold text-text-primary mb-1">
            {orders.length}
          </div>
          <div className="text-caption text-text-secondary">Total</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-semibold text-accent mb-1">
            {orders.filter((o) => o.status === 'active').length}
          </div>
          <div className="text-caption text-text-secondary">Activos</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-semibold text-warning mb-1">
            {
              orders.filter(
                (o) =>
                  o.status === 'pending_first_payment' || o.status === 'payment_rejected_first'
              ).length
            }
          </div>
          <div className="text-caption text-text-secondary">Pendientes</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-semibold text-success mb-1">
            {orders.filter((o) => o.status === 'completed' || o.status === 'delivered').length}
          </div>
          <div className="text-caption text-text-secondary">Completados</div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-bg-secondary mx-auto mb-4 flex items-center justify-center">
            <Package size={32} className="text-text-tertiary" />
          </div>
          <h3 className="text-[17px] font-semibold text-text-primary mb-2">
            No se encontraron pedidos
          </h3>
          <p className="text-body text-text-secondary">
            {searchQuery || statusFilter !== 'all'
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'Aún no tienes pedidos registrados'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const isPending = order.status === 'pending_first_payment' || order.status === 'payment_rejected_first';
  const isActive = order.status === 'active';

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
                Pedido #{order.id.slice(0, 8)} •{' '}
                {order.createdAt?.toDate
                  ? new Date(order.createdAt.toDate()).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Fecha no disponible'}
              </p>
            </div>
            <Badge variant={statusToBadgeVariant(order.status)}>
              {STATUS_LABELS[order.status] || order.status}
            </Badge>
          </div>

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
              <div className="flex items-center gap-2 text-caption text-warning">
                <Clock size={12} />
                <span>Esperando aprobación</span>
              </div>
            )}

            {/* Info para pedidos activos */}
            {isActive && (
              <div className="text-caption text-accent">
                ✓ Plan activo
              </div>
            )}
          </div>
        </div>

        <ChevronRight size={18} className="text-text-tertiary flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}
