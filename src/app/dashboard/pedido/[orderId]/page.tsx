'use client';

/**
 * /dashboard/pedido/[orderId] — Full order detail page.
 * Real-time via Firestore onSnapshot (useOrder hook).
 * Shows: order header, timeline, insurance widget, delivery tracker.
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useOrder } from '@/lib/hooks/useOrder';
import { useInsuranceCoverage } from '@/lib/hooks/useInsuranceCoverage';
import { getPaymentsByOrder } from '@/lib/firebase/payments';
import { OrderTimeline } from '@/components/dashboard/OrderTimeline';
import { InsurancePurchase } from '@/components/dashboard/InsurancePurchase';
import { InsuranceStatusCard } from '@/components/dashboard/InsuranceStatusCard';
import { DeliveryTracker } from '@/components/dashboard/DeliveryTracker';
import { Spinner } from '@/components/ui/Spinner';
import { Badge, statusToBadgeVariant } from '@/components/ui/Badge';
import { AppImage } from '@/components/ui/AppImage';
import { formatSoles } from '@/lib/utils/currency';
import { actionPurchaseInsurance } from '@/lib/actions/insurance.actions';
import type { Payment } from '@/types/payment';
import type { InsurancePlanMonths } from '@/types/insurance';

const STATUS_LABELS: Record<string, string> = {
  pending_first_payment: 'Esperando aprobación del primer pago',
  active:    'Plan activo',
  completed: 'Todas las cuotas pagadas',
  delivering:'En camino',
  delivered: '¡Entregado!',
  cancelled: 'Cancelado',
  defaulted: 'Cancelado por mora',
};

export default function OrderDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const orderId  = params.orderId as string;

  const { firebaseUser, loading: authLoading } = useAuth();
  const { order, loading: orderLoading } = useOrder(orderId);

  const [payments,  setPayments]  = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  // Load payments
  useEffect(() => {
    if (!orderId) return;
    getPaymentsByOrder(orderId)
      .then(setPayments)
      .catch(console.error)
      .finally(() => setPaymentsLoading(false));
  }, [orderId]);

  // Reload payments when order updates (e.g. new installment unlocked)
  const refreshPayments = () => {
    getPaymentsByOrder(orderId).then(setPayments).catch(console.error);
  };

  // Active (open/overdue) installment
  const activePayment = payments.find(
    p => p.status === 'open' || p.status === 'overdue' || p.status === 'rejected'
  ) ?? null;

  // Auto-apply insurance when due date passes
  useInsuranceCoverage({ order: order!, activePayment, onCovered: refreshPayments });

  const handleInsurancePurchase = async (plan: InsurancePlanMonths) => {
    if (!order) return;
    await actionPurchaseInsurance(order.id, plan, false);
    refreshPayments();
  };

  // Redirigir si el pedido no pertenece al usuario (en useEffect, NO en render)
  useEffect(() => {
    if (!authLoading && !orderLoading && !paymentsLoading && order && firebaseUser) {
      if (order.userId !== firebaseUser.uid) {
        router.replace('/dashboard');
      }
    }
  }, [order, firebaseUser, authLoading, orderLoading, paymentsLoading, router]);

  if (authLoading || orderLoading || paymentsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" label="Cargando pedido…" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-subtitle">Pedido no encontrado</p>
        <Link href="/dashboard" className="btn btn-secondary px-6 py-2.5">
          ← Volver al dashboard
        </Link>
      </div>
    );
  }

  const showDelivery = ['delivering', 'delivered', 'completed'].includes(order.status);
  const isDefaulted  = order.status === 'defaulted' || order.status === 'cancelled';
  const isPending = order.status === 'pending_first_payment' || order.status === 'payment_rejected_first';

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-label text-text-secondary hover:text-accent transition-colors"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Mis pedidos
      </Link>

      {/* Order header */}
      <div className="card p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-[10px] bg-bg-secondary overflow-hidden flex-shrink-0">
            <AppImage
              src={order.productThumbnail || '/og-default.jpg'}
              alt={order.productTitle}
              width={64} height={64}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[17px] mb-1">{order.productTitle}</p>
            <Badge variant={statusToBadgeVariant(order.status)}>
              {STATUS_LABELS[order.status] ?? order.status}
            </Badge>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-[14px]">
              <span className="text-text-secondary">Total</span>
              <span className="font-semibold">{formatSoles(order.priceTotal)}</span>
              <span className="text-text-secondary">Cuota mensual</span>
              <span className="font-medium">{formatSoles(order.installmentAmount)}</span>
              <span className="text-text-secondary">Plan</span>
              <span className="font-medium">{order.installments} cuotas</span>
              <span className="text-text-secondary">Inicial</span>
              <span className="font-medium">{formatSoles(order.downPayment || 0)}</span>
              <span className="text-text-secondary">Envío a</span>
              <span className="font-medium">{order.shippingAddress?.department || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending warning - Mostrar resumen mientras espera aprobación */}
      {isPending && (
        <div className="bg-warning/5 border border-warning/25 rounded-[14px] p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
              <Clock size={20} className="text-warning" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-warning text-[17px] mb-2">
                Esperando aprobación de tu primer pago
              </p>
              <p className="text-[14px] text-text-secondary mb-4">
                Hemos recibido tu pedido. Una vez que confirmemos tu primer pago, activaremos tu plan de cuotas y podrás ver el cronograma completo aquí.
              </p>
            </div>
          </div>

          {/* Resumen del pedido pendiente */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white rounded-xl">
            <div>
              <div className="text-caption text-text-secondary mb-1">Monto reservado</div>
              <div className="text-[17px] font-semibold text-text-primary">
                {formatSoles(order.priceTotal)}
              </div>
            </div>
            <div>
              <div className="text-caption text-text-secondary mb-1">Plan elegido</div>
              <div className="text-[15px] font-medium text-text-primary">
                {order.installments} cuotas de {formatSoles(order.installmentAmount)}
              </div>
            </div>
            <div>
              <div className="text-caption text-text-secondary mb-1">Fecha de pedido</div>
              <div className="text-[15px] font-medium text-text-primary">
                {order.createdAt?.toDate
                  ? new Date(order.createdAt.toDate()).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Procesando...'}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-lg">
            <p className="text-[13px] text-text-secondary">
              <strong className="text-accent">💡 Próximo paso:</strong> Una vez aprobado tu primer pago, se generará automáticamente el cronograma de cuotas y podrás ver las fechas exactas de cada pago.
            </p>
          </div>
        </div>
      )}

      {/* Defaulted warning */}
      {isDefaulted && (
        <div className="bg-danger/5 border border-danger/25 rounded-[14px] p-5">
          <p className="font-semibold text-danger mb-2">Pedido Cancelado</p>
          <p className="text-[14px] text-text-secondary">
            Tu pedido fue cancelado por falta de pago de la cuota vencida. Según los
            términos aceptados, los pagos realizados no son reembolsables.
          </p>
        </div>
      )}

      {/* Insurance status banner */}
      <InsuranceStatusCard order={order} coveredPayment={
        payments.find(p => p.status === 'insured') ?? null
      } />

      {/* Insurance purchase widget (only if active) */}
      {order.status === 'active' && (
        <InsurancePurchase
          order={order}
          activePayment={activePayment}
          onPurchase={handleInsurancePurchase}
        />
      )}

      {/* Payment timeline */}
      {payments.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-[17px] mb-5">Línea de Tiempo de Cuotas</h2>
          <OrderTimeline
            order={order}
            payments={payments}
            onPaymentUpdated={refreshPayments}
          />
        </div>
      )}

      {/* Delivery tracker */}
      {showDelivery && <DeliveryTracker order={order} />}
    </div>
  );
}
