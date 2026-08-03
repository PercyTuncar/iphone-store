'use client';

/**
 * PaymentModal — central checkout modal.
 *
 * Steps shown inside the modal:
 * 1. Insurance upsell (InsuranceUpsell)
 * 2. Payment method selector: online | offline
 * 3. Terms & conditions checkbox (MANDATORY — PRD §11 Regla 8)
 * 4. Method panel (OfflinePaymentPanel | OnlinePaymentPanel)
 *
 * Business rules enforced here:
 * - Cannot proceed without terms checkbox (button disabled)
 * - Insurance price added to amountDue reactively
 * - Creates order in Firestore before redirecting / submitting
 */

import { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { CreditCard, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { InsuranceUpsell } from './InsuranceUpsell';
import { OfflinePaymentPanel } from './OfflinePaymentPanel';
import { OnlinePaymentPanel } from './OnlinePaymentPanel';
import { formatSoles } from '@/lib/utils/currency';
import { toast } from '@/components/ui/Toast';
import { createOrder } from '@/lib/firebase/orders';
import { decrementStock } from '@/lib/firebase/products';
import { createPayment } from '@/lib/firebase/payments';
import { uploadVoucher } from '@/lib/firebase/storage';
import { getShippingCost } from '@/lib/firebase/shipping';
import { useAuth } from '@/lib/hooks/useAuth';
import { Timestamp } from 'firebase/firestore';
import type { ProductClient } from '@/types/product';
import type { InstallmentCalculation } from '@/lib/utils/installments';
import { calculateInstallmentPlan } from '@/lib/utils/installments';

type PaymentMethod = 'online' | 'offline' | null;

interface ShippingData {
  name: string; dni: string; phone: string;
  department: string; province: string; district: string; address: string;
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductClient;
  selectedInstallments: number;
  installmentCalculation: InstallmentCalculation | null;
}

export function PaymentModal({
  open,
  onClose,
  product,
  selectedInstallments,
  installmentCalculation
}: PaymentModalProps) {
  const router = useRouter();
  const { firebaseUser } = useAuth();

  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [method, setMethod]                         = useState<PaymentMethod>(null);
  const [termsAccepted, setTermsAccepted]           = useState(false);

  // Reactive total: first installment + optional insurance + shipping (calculated later)
  const baseAmount     = selectedInstallments > 0
    ? (installmentCalculation?.installmentAmount ?? product.installmentAmount)
    : product.priceTotal;
  const insuranceExtra = insuranceSelected ? product.insuranceCheckoutDiscount1Month : 0;
  const amountDue      = baseAmount + insuranceExtra;

  const reset = useCallback(() => {
    setInsuranceSelected(false);
    setMethod(null);
    setTermsAccepted(false);
  }, []);

  const handleClose = () => { reset(); onClose(); };

  /* ── Create order in Firestore ─────────────────────────── */
  const buildAndCreateOrder = async (
    paymentMethodType: 'online' | 'offline',
    shipping: ShippingData
  ): Promise<string> => {
    if (!firebaseUser) throw new Error('Not authenticated');

    const shippingCost = await getShippingCost(shipping.department);
    const reservedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Calcular cuotas basado en la selección del usuario
    const calculation = installmentCalculation || calculateInstallmentPlan(
      product.priceTotal,
      product.interestRate * 100,
      selectedInstallments,
      product.downPayment
    );

    const orderId = await createOrder({
      userId:           firebaseUser.uid,
      productId:        product.id,
      productSlug:      product.slug,
      productTitle:     product.title,
      productThumbnail: product.thumbnailUrl,
      customerName:     shipping.name,
      customerDni:      shipping.dni,
      customerEmail:    firebaseUser.email ?? '',
      customerPhone:    shipping.phone,
      shippingAddress:  {
        department: shipping.department,
        province:   shipping.province,
        district:   shipping.district,
        address:    shipping.address,
      },
      shippingCost,
      priceTotal:        product.priceTotal,
      installments:      selectedInstallments,
      installmentAmount: calculation.installmentAmount,
      downPayment:       product.downPayment,
      status:            'pending_first_payment',
      paymentMethod:     paymentMethodType,
      reservedUntil:     Timestamp.fromDate(reservedUntil),
      insurance: {
        hasPurchased:       insuranceSelected,
        plan:               insuranceSelected ? 1 : null,
        monthsCovered:      insuranceSelected ? 1 : 0,
        monthsUsed:         0,
        purchasedAt:        insuranceSelected ? Timestamp.now() : null,
        purchasedAtCheckout: insuranceSelected,
      },
      delivery: {
        status:        'not_started',
        estimatedDate: null,
        deliveredAt:   null,
      },
    });

    // Reserve stock
    await decrementStock(product.id);

    return orderId;
  };

  /* ── Offline submit handler ────────────────────────────── */
  const handleOfflineSubmit = async (voucher: File, shipping: ShippingData) => {
    try {
      const orderId  = await buildAndCreateOrder('offline', shipping);
      const voucherUrl = await uploadVoucher(orderId, 1, voucher);
      const dueDate    = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await createPayment({
        orderId,
        userId:            firebaseUser!.uid,
        installmentNumber: 1,
        amount:            amountDue,
        dueDate:           Timestamp.fromDate(dueDate),
        voucherUrl,
        voucherUploadedAt:  Timestamp.now(),
        voucherUploadedBy:  'customer',
        status:            'pending_approval',
        penaltyApplied:    false,
        penaltyAmount:     null,
        penaltyAppliedAt:  null,
        rejectionReason:   null,
        rejectedAt:        null,
        resubmitDeadline:  null,
        approvedBy:        null,
        approvedAt:        null,
      });

      toast.success('¡Comprobante enviado! Revisaremos tu pago en breve.');
      handleClose();
      router.push('/dashboard');
    } catch (err) {
      console.error('[PaymentModal offline]', err);
      toast.error('Hubo un error. Intenta de nuevo.');
    }
  };

  /* ── Online proceed handler ────────────────────────────── */
  const handleOnlineProceed = async () => {
    // For online payment, we need shipping data first.
    // In this simplified flow, we create a minimal order and redirect.
    // Full shipping data is collected on /pago-exitoso.
    const orderId = await buildAndCreateOrder('online', {
      name: firebaseUser?.displayName ?? '',
      dni: '', phone: '',
      department: '', province: '', district: '', address: '',
    });
    localStorage.setItem('pendingOrderId', orderId);
    return { orderId };
  };

  const canProceed = termsAccepted && method !== null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Reservar ${product.model}`}
      size="md"
    >
      <div className="space-y-5">
        {/* ── Product summary ── */}
        <div className="rounded-[16px] bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-border shadow-sm overflow-hidden">
          {/* Product header */}
          <div className="flex items-center gap-3 p-4 bg-bg-primary/50 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-[12px] bg-bg-secondary border border-border overflow-hidden flex-shrink-0">
              <img
                src={product.thumbnailUrl || '/og-default.jpg'}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[15px] text-text-primary truncate">{product.title}</p>
              <p className="text-[13px] text-text-secondary mt-0.5">
                {selectedInstallments === 1
                  ? '💳 Pago único al contado'
                  : `📅 ${selectedInstallments} cuotas mensuales`}
              </p>
            </div>
          </div>

          {/* Installment details */}
          {selectedInstallments > 1 && installmentCalculation && (
            <div className="p-4 space-y-2.5 text-[14px]">
              {/* Primera cuota */}
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <div>
                  <p className="font-medium text-text-primary">
                    {product.downPayment > 0 ? 'Paga hoy (1ª cuota)' : 'Primera cuota'}
                  </p>
                  <p className="text-[12px] text-text-tertiary">Al reservar</p>
                </div>
                <span className="text-[20px] font-bold text-accent">
                  {formatSoles(product.downPayment > 0 ? product.downPayment : installmentCalculation.installmentAmount)}
                </span>
              </div>

              {/* Cuotas restantes */}
              {product.downPayment > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <div>
                    <p className="font-medium text-text-primary">Cuotas 2-{selectedInstallments}</p>
                    <p className="text-[12px] text-text-tertiary">{selectedInstallments - 1} pagos mensuales</p>
                  </div>
                  <span className="text-[20px] font-bold text-accent">
                    {formatSoles(installmentCalculation.installmentAmount)}
                  </span>
                </div>
              )}

              {/* Precio del producto */}
              <div className="flex justify-between items-center py-2">
                <span className="text-text-secondary">Precio del producto</span>
                <span className="font-medium text-text-secondary">{formatSoles(product.priceTotal)}</span>
              </div>

              {/* Interés */}
              {installmentCalculation.totalInterest > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-text-secondary">Interés financiero</span>
                  <span className="font-medium text-warning">+{formatSoles(installmentCalculation.totalInterest)}</span>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-baseline pt-3 border-t-2 border-border">
                <span className="text-[15px] font-semibold text-text-primary">Total a pagar</span>
                <span className="text-[24px] font-bold text-accent leading-none">
                  {formatSoles(installmentCalculation.totalWithInterest)}
                </span>
              </div>
            </div>
          )}

          {/* Contado details */}
          {selectedInstallments === 1 && (
            <div className="p-4">
              <div className="flex justify-between items-center py-3 px-4 rounded-[12px] bg-success/5 border border-success/20">
                <div>
                  <p className="font-semibold text-success">Pago único</p>
                  <p className="text-[12px] text-success/70">Sin intereses ni cargos</p>
                </div>
                <span className="text-[28px] font-bold text-success leading-none">
                  {formatSoles(product.priceTotal)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Insurance upsell ── */}
        <InsuranceUpsell
          product={product}
          selected={insuranceSelected}
          onToggle={setInsuranceSelected}
        />

        {/* ── Method selector ── */}
        <div>
          <p className="text-label text-text-primary mb-3">Método de pago</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: 'offline' as const,
                icon: <Smartphone size={20} aria-hidden="true" />,
                label: 'Yape / Transferencia',
                sub: 'Pago manual',
              },
              ...(product.isOnlinePaymentEnabled && product.onlinePaymentLink
                ? [{
                    id: 'online' as const,
                    icon: <CreditCard size={20} aria-hidden="true" />,
                    label: 'Pagar con Tarjeta',
                    sub: 'Pago online seguro',
                  }]
                : []),
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={clsx(
                  'flex flex-col items-center gap-2 p-4 rounded-[14px] border-2 transition-all text-center',
                  method === m.id
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-border hover:border-accent/40 text-text-secondary'
                )}
                aria-pressed={method === m.id}
              >
                {m.icon}
                <span className="text-[14px] font-semibold">{m.label}</span>
                <span className="text-caption">{m.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Amount due ── */}
        {method && (
          <div className="bg-bg-secondary rounded-[10px] p-3 flex items-center justify-between">
            <span className="text-label text-text-secondary">Total a pagar hoy</span>
            <span className="text-[20px] font-bold text-text-primary">
              {formatSoles(amountDue)}
            </span>
          </div>
        )}

        {/* ── Terms checkbox — MANDATORY (PRD §11 Regla 8) ── */}
        <label
          className={clsx(
            'flex items-start gap-3 p-4 rounded-[14px] border-2 cursor-pointer transition-colors select-none',
            termsAccepted ? 'border-success/40 bg-success/5' : 'border-border'
          )}
        >
          <div
            className={clsx(
              'mt-0.5 w-5 h-5 rounded-[5px] border-2 flex-shrink-0 flex items-center justify-center transition-colors',
              termsAccepted ? 'border-success bg-success' : 'border-border'
            )}
            aria-hidden="true"
          >
            {termsAccepted && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            aria-label="Acepto las condiciones de compra"
          />
          <p className="text-[13px] text-text-secondary leading-relaxed">
            He leído y acepto las{' '}
            <Link
              href="/terminos"
              target="_blank"
              className="text-accent underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              Condiciones de Compra
            </Link>
            , incluyendo la política de penalidades por atraso y la política de no
            devolución en caso de mora.{' '}
            <strong>
              Entiendo que si me atraso más de 15 días en una cuota, pierdo el equipo
              y los pagos realizados.
            </strong>
          </p>
        </label>

        {/* ── Method panel ── */}
        {method === 'offline' && canProceed && (
          <OfflinePaymentPanel
            product={product}
            amountDue={amountDue}
            onSubmit={handleOfflineSubmit}
          />
        )}

        {method === 'online' && canProceed && (
          <OnlinePaymentPanel
            paymentLink={product.onlinePaymentLink}
            amountDue={amountDue}
            onProceed={handleOnlineProceed}
          />
        )}

        {/* ── Proceed disabled state ── */}
        {!canProceed && method && (
          <p className="text-caption text-warning text-center">
            ⚠ Debes aceptar las condiciones de compra para continuar.
          </p>
        )}
        {!method && (
          <p className="text-caption text-text-tertiary text-center">
            Selecciona un método de pago para continuar.
          </p>
        )}
      </div>
    </Modal>
  );
}
