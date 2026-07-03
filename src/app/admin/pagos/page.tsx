'use client';

/**
 * /admin/pagos — payment approval queue.
 * Lists all payments with status "pending_approval", oldest first.
 */

import { useEffect, useState, useCallback } from 'react';
import { CreditCard } from 'lucide-react';
import { PaymentApproval } from '@/components/admin/PaymentApproval';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { getPendingPayments } from '@/lib/firebase/payments';
import { getOrderById } from '@/lib/firebase/orders';
import { actionApprovePayment, actionRejectPayment } from '@/lib/actions/payment.actions';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Payment } from '@/types/payment';
import type { Order } from '@/types/order';

interface PendingItem { payment: Payment; order: Order }

export default function AdminPagosPage() {
  const { appUser } = useAuth();
  const [items,   setItems]   = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payments = await getPendingPayments();
      const enriched = await Promise.all(
        payments.map(async (p) => {
          const order = await getOrderById(p.orderId);
          return order ? { payment: p, order } : null;
        })
      );
      setItems(enriched.filter(Boolean) as PendingItem[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (paymentId: string, orderId: string, installmentNumber: number) => {
    if (!appUser) return;
    const res = await actionApprovePayment(appUser.uid, appUser.email, paymentId, orderId, installmentNumber);
    if (res.success) {
      toast.success('Pago aprobado ✓');
      setItems(prev => prev.filter(i => i.payment.id !== paymentId));
    } else {
      toast.error(res.error ?? 'Error al aprobar.');
    }
  };

  const handleReject = async (paymentId: string, orderId: string, installmentNumber: number, reason: string) => {
    if (!appUser) return;
    const res = await actionRejectPayment(appUser.uid, appUser.email, paymentId, orderId, installmentNumber, reason);
    if (res.success) {
      toast.success('Pago rechazado.');
      setItems(prev => prev.filter(i => i.payment.id !== paymentId));
    } else {
      toast.error(res.error ?? 'Error al rechazar.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-section-title mb-1">Pagos Pendientes</h1>
        <p className="text-body text-text-secondary">
          Comprobantes esperando aprobación — más antiguo primero.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <CreditCard size={36} className="text-text-tertiary mx-auto mb-3" aria-hidden="true" />
          <p className="text-subtitle text-[17px] mb-1">Sin pagos pendientes</p>
          <p className="text-body text-text-secondary">Todos los comprobantes han sido revisados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-label text-text-secondary">{items.length} comprobante{items.length > 1 ? 's' : ''} pendiente{items.length > 1 ? 's' : ''}</p>
          {items.map(({ payment, order }) => (
            <PaymentApproval
              key={payment.id}
              payment={payment}
              order={order}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
