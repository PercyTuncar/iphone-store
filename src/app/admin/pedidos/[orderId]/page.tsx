'use client';

/**
 * /admin/pedidos/[orderId] — Full order detail for the admin.
 * Shows: customer data, product, timeline of payments (approve/reject inline),
 * shipping status controls, insurance info.
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react';
import { getOrderById, updateOrder } from '@/lib/firebase/orders';
import { getPaymentsByOrder } from '@/lib/firebase/payments';
import { PaymentApproval } from '@/components/admin/PaymentApproval';
import { DeliveryTracker } from '@/components/dashboard/DeliveryTracker';
import { AppImage } from '@/components/ui/AppImage';
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { formatSoles } from '@/lib/utils/currency';
import { formatDueDate, toDate } from '@/lib/utils/dates';
import { actionApprovePayment, actionRejectPayment } from '@/lib/actions/payment.actions';
import { actionUpdateDeliveryStatus } from '@/lib/actions/order.actions';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Order } from '@/types/order';
import type { Payment } from '@/types/payment';

const STATUS_LABELS: Record<string, string> = {
  pending_first_payment: 'Pendiente 1er pago',
  active: 'Activo', completed: 'Completado', delivering: 'En camino',
  delivered: 'Entregado', cancelled: 'Cancelado', defaulted: 'Moroso',
};

export default function AdminDetallePedidoPage() {
  const params  = useParams();
  const orderId = params.orderId as string;
  const { appUser } = useAuth();

  const [order,    setOrder]    = useState<Order | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    const [o, p] = await Promise.all([
      getOrderById(orderId),
      getPaymentsByOrder(orderId),
    ]);
    setOrder(o);
    setPayments(p.sort((a, b) => a.installmentNumber - b.installmentNumber));
    setLoading(false);
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (paymentId: string, oId: string, num: number) => {
    if (!appUser) return;
    const res = await actionApprovePayment(appUser.uid, appUser.email, paymentId, oId, num);
    if (res.success) { toast.success('Pago aprobado ✓'); await load(); }
    else toast.error(res.error ?? 'Error.');
  };

  const handleReject = async (paymentId: string, oId: string, num: number, reason: string) => {
    if (!appUser) return;
    const res = await actionRejectPayment(appUser.uid, appUser.email, paymentId, oId, num, reason);
    if (res.success) { toast.success('Rechazado.'); await load(); }
    else toast.error(res.error ?? 'Error.');
  };

  const handleDeliveryUpdate = async (status: 'preparing' | 'in_transit' | 'delivered') => {
    if (!appUser || !order) return;
    const res = await actionUpdateDeliveryStatus(appUser.uid, appUser.email, order.id, status);
    if (res.success) { toast.success('Envío actualizado.'); await load(); }
    else toast.error(res.error ?? 'Error.');
  };

  if (loading || !order) return (
    <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  );

  const pendingPayments = payments.filter(p => p.status === 'pending_approval');

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/admin/pedidos" className="inline-flex items-center gap-2 text-label text-text-secondary hover:text-accent">
        <ArrowLeft size={16} /> Pedidos
      </Link>

      {/* Order header */}
      <div className="card p-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-[10px] bg-bg-secondary overflow-hidden flex-shrink-0">
            <AppImage src={order.productThumbnail || '/og-default.jpg'} alt={order.productTitle}
              width={64} height={64} className="object-contain w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
              <p className="font-semibold text-[17px]">{order.productTitle}</p>
              <Badge variant={statusToBadgeVariant(order.status)}>
                {STATUS_LABELS[order.status] ?? order.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-[14px]">
              <span className="text-text-secondary">Cliente</span>
              <span className="font-medium sm:col-span-2">{order.customerName || '—'} · DNI {order.customerDni || '—'}</span>
              <span className="text-text-secondary">Email / Tel</span>
              <span className="sm:col-span-2">{order.customerEmail} · {order.customerPhone || '—'}</span>
              <span className="text-text-secondary">Envío a</span>
              <span className="sm:col-span-2">
                {order.shippingAddress?.department || '—'}
                {order.shippingAddress?.address ? ` — ${order.shippingAddress.address}` : ''}
              </span>
              <span className="text-text-secondary">Flete</span>
              <span className="sm:col-span-2">{formatSoles(order.shippingCost)}</span>
              <span className="text-text-secondary">Plan</span>
              <span className="sm:col-span-2">{order.installments} cuotas · {formatSoles(order.installmentAmount)}</span>
              <span className="text-text-secondary">Método</span>
              <span className="sm:col-span-2 capitalize">{order.paymentMethod}</span>
              <span className="text-text-secondary">Seguro</span>
              <span className="sm:col-span-2">
                {order.insurance.hasPurchased
                  ? `Sí · Plan ${order.insurance.plan} mes(es) · Usado: ${order.insurance.monthsUsed}`
                  : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending payments (approve queue) */}
      {pendingPayments.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-[17px]">Comprobantes Pendientes</h2>
          {pendingPayments.map(p => (
            <PaymentApproval key={p.id} payment={p} order={order}
              onApprove={handleApprove} onReject={handleReject} />
          ))}
        </div>
      )}

      {/* All payments timeline */}
      <div className="card p-5">
        <h2 className="font-semibold text-[17px] mb-4">Todas las Cuotas</h2>
        <div className="space-y-2">
          {payments.map(p => (
            <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0 text-[14px]">
              <div>
                <span className="font-medium mr-2">Cuota {p.installmentNumber}</span>
                <Badge variant={statusToBadgeVariant(p.status)}>{p.status.replace(/_/g,' ')}</Badge>
              </div>
              <div className="flex items-center gap-4 text-text-secondary">
                <span>{formatSoles(p.amount)}</span>
                {p.dueDate && <span>{formatDueDate(toDate(p.dueDate as never))}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery controls */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-[17px]">Estado de Envío</h2>
        <DeliveryTracker order={order} />
        <div className="flex flex-wrap gap-3 pt-2">
          {([
            { status: 'preparing' as const, label: 'Preparando',  Icon: Package   },
            { status: 'in_transit' as const, label: 'En camino',  Icon: Truck     },
            { status: 'delivered' as const,  label: 'Entregado',  Icon: CheckCircle },
          ]).map(s => (
            <Button key={s.status} variant={order.delivery.status === s.status ? 'primary' : 'ghost'}
              size="sm" onClick={() => handleDeliveryUpdate(s.status)}>
              <s.Icon size={14} aria-hidden="true" />
              {s.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
