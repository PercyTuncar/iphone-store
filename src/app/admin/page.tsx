'use client';

/**
 * /admin — Admin dashboard with key metrics.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, CreditCard, Package, TrendingUp, ChevronRight } from 'lucide-react';
import { getAllOrders } from '@/lib/firebase/orders';
import { getPendingPayments } from '@/lib/firebase/payments';
import { getAllPublishedProducts } from '@/lib/firebase/products';
import { Spinner } from '@/components/ui/Spinner';
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge';
import { formatSoles } from '@/lib/utils/currency';
import type { Order } from '@/types/order';
import type { Payment } from '@/types/payment';

interface Metrics {
  activeOrders: number;
  pendingPayments: number;
  totalProducts: number;
  monthRevenue: number;
}

export default function AdminDashboardPage() {
  const [metrics,  setMetrics]  = useState<Metrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      getAllOrders(),
      getPendingPayments(),
      getAllPublishedProducts(),
    ]).then(([orders, pending, products]) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthRevenue = orders
        .filter(o => o.status === 'active' || o.status === 'completed' || o.status === 'delivered')
        .filter(o => (o.createdAt as unknown as { toDate(): Date }).toDate() >= startOfMonth)
        .reduce((sum, o) => sum + o.installmentAmount, 0);

      setMetrics({
        activeOrders:    orders.filter(o => o.status === 'active').length,
        pendingPayments: pending.length,
        totalProducts:   products.length,
        monthRevenue,
      });
      setRecentOrders(orders.slice(0, 5));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Spinner size="lg" label="Cargando métricas…" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-section-title mb-1">Panel de Administración</h1>
        <p className="text-body text-text-secondary">Resumen general del negocio.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pedidos Activos',       value: metrics?.activeOrders ?? 0,    icon: ShoppingCart, color: 'text-accent',   href: '/admin/pedidos'  },
          { label: 'Pagos Pendientes',       value: metrics?.pendingPayments ?? 0, icon: CreditCard,   color: 'text-warning',  href: '/admin/pagos'    },
          { label: 'Productos Publicados',   value: metrics?.totalProducts ?? 0,   icon: Package,      color: 'text-success',  href: '/admin/productos'},
          { label: 'Ingresos del mes',       value: formatSoles(metrics?.monthRevenue ?? 0), icon: TrendingUp, color: 'text-text-primary', href: '#' },
        ].map(m => (
          <Link key={m.label} href={m.href} className="card p-5 no-underline hover:shadow-elevated transition-shadow">
            <m.icon size={20} className={`${m.color} mb-3`} aria-hidden="true" />
            <p className={`text-[24px] font-bold ${m.color} leading-none mb-1`}>
              {typeof m.value === 'number' ? m.value : m.value}
            </p>
            <p className="text-caption text-text-secondary">{m.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-[17px]">Pedidos Recientes</h2>
            <Link href="/admin/pedidos" className="text-label text-accent hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.map(order => (
              <Link key={order.id} href={`/admin/pedidos/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-secondary transition-colors no-underline">
                <div>
                  <p className="text-[15px] font-medium text-text-primary">{order.customerName || '—'}</p>
                  <p className="text-caption text-text-secondary">{order.productTitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusToBadgeVariant(order.status)}>
                    {order.status.replace(/_/g,' ')}
                  </Badge>
                  <ChevronRight size={16} className="text-text-tertiary" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
