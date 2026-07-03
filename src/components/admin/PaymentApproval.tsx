'use client';

/**
 * PaymentApproval — approval/rejection card for a pending payment.
 * PRD §12.4: admin sees voucher thumbnail, customer data, approve/reject buttons.
 * Reject opens a text field for the reason.
 */

import { useState } from 'react';
import { clsx } from 'clsx';
import { Check, X, ZoomIn } from 'lucide-react';
import { AppImage } from '@/components/ui/AppImage';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatSoles } from '@/lib/utils/currency';
import { formatDueDate, toDate } from '@/lib/utils/dates';
import type { Payment } from '@/types/payment';
import type { Order } from '@/types/order';

interface PaymentApprovalProps {
  payment: Payment;
  order: Order;
  onApprove: (paymentId: string, orderId: string, installmentNumber: number) => Promise<void>;
  onReject:  (paymentId: string, orderId: string, installmentNumber: number, reason: string) => Promise<void>;
}

export function PaymentApproval({ payment, order, onApprove, onReject }: PaymentApprovalProps) {
  const [rejecting,      setRejecting]      = useState(false);
  const [rejectionReason,setRejectionReason]= useState('');
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject,  setLoadingReject]  = useState(false);
  const [voucherZoomed,  setVoucherZoomed]  = useState(false);

  const handleApprove = async () => {
    setLoadingApprove(true);
    try {
      await onApprove(payment.id, order.id, payment.installmentNumber);
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setLoadingReject(true);
    try {
      await onReject(payment.id, order.id, payment.installmentNumber, rejectionReason.trim());
      setRejecting(false);
      setRejectionReason('');
    } finally {
      setLoadingReject(false);
    }
  };

  const uploadedAt = payment.voucherUploadedAt
    ? (payment.voucherUploadedAt as { toDate(): Date }).toDate()
    : null;

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-semibold text-[16px]">
            {order.customerName || 'Cliente'}
            <span className="ml-2 text-text-secondary font-normal text-[14px]">
              · DNI {order.customerDni || '—'}
            </span>
          </p>
          <p className="text-[14px] text-text-secondary line-clamp-1">{order.productTitle}</p>
        </div>
        <Badge variant="warning">
          Cuota {payment.installmentNumber} · {formatSoles(payment.amount)}
        </Badge>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[14px]">
        <span className="text-text-secondary">Método</span>
        <span className="font-medium capitalize">{order.paymentMethod}</span>
        {uploadedAt && (
          <>
            <span className="text-text-secondary">Subido</span>
            <span className="font-medium">{formatDueDate(uploadedAt)}</span>
          </>
        )}
        <span className="text-text-secondary">Vencía</span>
        <span className="font-medium">
          {payment.dueDate ? formatDueDate(toDate(payment.dueDate as never)) : '—'}
        </span>
      </div>

      {/* Voucher */}
      {payment.voucherUrl && (
        <div className="relative">
          <div
            className="rounded-[10px] overflow-hidden border border-border cursor-zoom-in"
            onClick={() => setVoucherZoomed(true)}
          >
            <AppImage
              src={payment.voucherUrl}
              alt="Comprobante de pago"
              width={400}
              height={220}
              className="w-full object-cover max-h-44"
            />
            <div className="absolute top-2 right-2 bg-black/60 text-white rounded-lg px-2 py-1 flex items-center gap-1 text-caption">
              <ZoomIn size={12} aria-hidden="true" />
              Ampliar
            </div>
          </div>

          {/* Zoomed overlay */}
          {voucherZoomed && (
            <div
              className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
              onClick={() => setVoucherZoomed(false)}
            >
              <div className="relative max-w-2xl w-full">
                <AppImage
                  src={payment.voucherUrl}
                  alt="Comprobante ampliado"
                  width={800}
                  height={600}
                  className="w-full rounded-[14px] object-contain"
                />
                <button
                  onClick={() => setVoucherZoomed(false)}
                  className="absolute top-3 right-3 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {!rejecting ? (
        <div className="flex gap-3">
          <Button
            variant="primary"
            loading={loadingApprove}
            onClick={handleApprove}
            leftIcon={<Check size={15} />}
            className="flex-1"
          >
            Aprobar ✓
          </Button>
          <Button
            variant="danger"
            onClick={() => setRejecting(true)}
            leftIcon={<X size={15} />}
            className="flex-1"
          >
            Rechazar ✗
          </Button>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          <Textarea
            label="Motivo del rechazo (obligatorio)"
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            placeholder="Ej: El monto transferido no coincide con lo esperado."
            rows={3}
          />
          <div className="flex gap-3">
            <Button
              variant="danger"
              loading={loadingReject}
              disabled={!rejectionReason.trim()}
              onClick={handleReject}
              className="flex-1"
            >
              Confirmar Rechazo
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setRejecting(false); setRejectionReason(''); }}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
