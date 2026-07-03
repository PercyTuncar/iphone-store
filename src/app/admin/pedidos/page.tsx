'use client';

/**
 * /admin/pedidos — order list with status filter.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';
import { getAllOrders, getOrdersByStatus } from '@/lib/firebase/orders';
import { Spinner } from '@/components/ui/Spinner';
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge';
import { AppImage } from '@/components/ui/AppImage';
import { formatSoles } from '@/lib/utils/currency';
import type { Order, OrderStatus } from '@/types/order';

const STATUS_OPTIONS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'Todos',            value: 'all'                   },
  { label: 'Activos',          value: 'active'                },
  { label: 'Pend. 1er pago',   value: 'pending_first_payment' },
  { label: 'Completados',      value: 'completed'             },
  { label: 'En camino',        value: 'delivering'            },
  { label: 'Entregados',       value: 'delivered'             },
  { label: 'Cancelados',       value: 'cancelled'             },
  { label: 'Morosos',          value: 'defaulted'             },
];

const STATUS_LABELS: Record<string, string> = {
  pending_first_payment: 'Pend. 1er pago',
  active: 'Activo', completed: 'Completado',
  delivering: 'En camino', delivered: 'Entregado',
  cancelled: 'Cancelado', defaulted: 'Moroso',
  payment_rejected_first: 'Rechazado',
};

export default function AdminPedidosPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<OrderStatus | 'all'>('all');
  const [search,  setSearch]  = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = filter === 'all'
        ? await getAllOrders()
        : await getOrdersByStatus(filter);
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const filtered = search.trim()
    ? orders.filter(o =>
        o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        o.productTitle?.toLowerCase().includes(search.toLowerCase()) ||
        o.customerDni?.includes(search)
      )
    : orders;

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-section-title mb-1">Pedidos</h1>
        <p className="text-body text-text-secondary">
          {orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado{orders.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value as OrderStatus | 'all')}
              className={`text-label px-3 py-1.5 rounded-pill border transition-colors ${
                filter === opt.value
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-text-secondary hover:border-accent/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="search"
            placeholder="Buscar por nombre, DNI…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 py-2 text-[14px] w-56"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-body text-text-secondary">Sin pedidos.</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-border bg-bg-secondary">
                  {['Producto','Cliente','Estado','Cuota','Método',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-text-secondary whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-[6px] bg-bg-secondary overflow-hidden flex-shrink-0">
                          <AppImage src={order.productThumbnail || '/og-default.jpg'} alt={order.productTitle}
                            width={32} height={32} className="object-contain w-full h-full" />
                        </div>
                        <span className="line-clamp-1 max-w-[180px]">{order.productTitle}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customerName || '—'}</p>
                      <p className="text-caption text-text-tertiary">{order.customerDni || ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusToBadgeVariant(order.status)}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatSoles(order.installmentAmount)}</td>
                    <td className="px-4 py-3 capitalize">{order.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/pedidos/${order.id}`}
                        className="flex items-center gap-1 text-accent hover:underline">
                        Ver <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
