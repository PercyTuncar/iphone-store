'use client';

/**
 * /dashboard/pagos — Historial de pagos y próximas cuotas
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import {
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getOrdersByUser } from '@/lib/firebase/orders';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatSoles } from '@/lib/utils/currency';
import type { Order } from '@/types/order';

export default function PagosPage() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) return;

    async function loadOrders() {
      try {
        const data = await getOrdersByUser(firebaseUser.uid);
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

  // Calcular estadísticas de pagos
  const totalPagado = 0; // TODO: calcular desde installments
  const totalPorPagar = orders
    .filter((o) => o.status === 'active')
    .reduce((sum, o) => sum + (o.priceTotal || 0), 0);

  const proximosPagos = []; // TODO: calcular próximos pagos desde installments

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-section-title mb-2">Pagos</h1>
        <p className="text-body text-text-secondary">
          Gestiona tus cuotas y revisa el historial de pagos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle size={20} className="text-success" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-text-primary mb-1">
            {formatSoles(totalPagado)}
          </div>
          <div className="text-label text-text-secondary">Total pagado</div>
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock size={20} className="text-warning" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-text-primary mb-1">
            {formatSoles(totalPorPagar)}
          </div>
          <div className="text-label text-text-secondary">Por pagar</div>
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-accent" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-text-primary mb-1">
            {activeOrders.length}
          </div>
          <div className="text-label text-text-secondary">Pedidos activos</div>
        </div>
      </div>

      {/* Próximos Pagos */}
      {activeOrders.length > 0 ? (
        <div>
          <h2 className="text-[20px] font-semibold text-text-primary mb-4">
            Próximos pagos programados
          </h2>

          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div key={order.id} className="card p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-[15px] font-semibold text-text-primary mb-1">
                      {order.productTitle || 'Producto'}
                    </h3>
                    <p className="text-caption text-text-secondary">
                      Pedido #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <Badge variant="warning" size="sm">
                    Pendiente
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-bg-secondary rounded-xl">
                  <div>
                    <div className="text-caption text-text-secondary mb-1">
                      Próxima cuota
                    </div>
                    <div className="text-[17px] font-semibold text-text-primary">
                      {formatSoles(order.installmentAmount || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-caption text-text-secondary mb-1">Fecha límite</div>
                    <div className="text-[15px] font-medium text-text-primary">
                      Por definir
                    </div>
                  </div>
                  <div>
                    <div className="text-caption text-text-secondary mb-1">
                      Cuotas restantes
                    </div>
                    <div className="text-[15px] font-medium text-text-primary">
                      {order.installments || 0} de {order.installments || 0}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Link
                    href={`/dashboard/pedido/${order.id}`}
                    className="btn-secondary flex-1 sm:flex-initial"
                  >
                    Ver detalles
                  </Link>
                  <button
                    className="btn-primary flex-1 sm:flex-initial"
                    onClick={() => alert('Función de pago próximamente')}
                  >
                    <CreditCard size={18} />
                    Pagar ahora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-bg-secondary mx-auto mb-4 flex items-center justify-center">
            <Calendar size={32} className="text-text-tertiary" />
          </div>
          <h3 className="text-[17px] font-semibold text-text-primary mb-2">
            No tienes pagos programados
          </h3>
          <p className="text-body text-text-secondary mb-6 max-w-md mx-auto">
            Cuando tengas pedidos activos, verás aquí tus próximas cuotas y podrás
            gestionarlas fácilmente.
          </p>
          <Link href="/iphone-en-cuotas" className="btn-primary inline-flex items-center gap-2">
            Ver productos disponibles
          </Link>
        </div>
      )}

      {/* Historial de Pagos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-semibold text-text-primary">
            Historial de pagos
          </h2>
          {orders.length > 0 && (
            <button className="text-[14px] text-accent hover:underline font-medium flex items-center gap-2">
              <Download size={16} />
              Exportar
            </button>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-body text-text-secondary">
              Aún no tienes pagos registrados
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-secondary border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-caption font-semibold text-text-secondary">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-4 text-caption font-semibold text-text-secondary">
                      Pedido
                    </th>
                    <th className="text-left py-3 px-4 text-caption font-semibold text-text-secondary">
                      Concepto
                    </th>
                    <th className="text-right py-3 px-4 text-caption font-semibold text-text-secondary">
                      Monto
                    </th>
                    <th className="text-center py-3 px-4 text-caption font-semibold text-text-secondary">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-text-secondary">
                      No hay pagos registrados todavía
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
