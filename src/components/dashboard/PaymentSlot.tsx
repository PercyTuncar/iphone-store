'use client';

/**
 * PaymentSlot — single installment node in the timeline.
 *
 * Visual states (PRD §13.2):
 * locked     → grey circle + lock icon
 * open       → blue pulsing circle (active, awaiting payment)
 * open+alert → orange (3 days or less to due)
 * open+urgent→ red pulse + countdown (last day)
 * approved   → green circle + check
 * insured    → blue shield
 * pending_approval → grey with upload icon (waiting admin)
 * rejected   → red X + resubmit CTA
 * overdue    → red + penalty info
 * penalized  → dark red + penalty amount
 */

import { clsx } from 'clsx';
import { Lock, Check, Shield, Upload, X, Clock, AlertTriangle } from 'lucide-react';
import { Countdown } from '@/components/ui/Countdown';
import { formatSoles } from '@/lib/utils/currency';
import { formatDueDate, toDate, daysOverdue, isDueSoon } from '@/lib/utils/dates';
import { getPenaltyLabel } from '@/lib/utils/penalties';
import type { Payment } from '@/types/payment';

interface PaymentSlotProps {
  payment: Payment;
  isActive: boolean;
  onPay?: () => void;        // opens the upload voucher form
  onResubmit?: () => void;   // after rejection: re-open upload form
}

export function PaymentSlot({ payment, isActive, onPay, onResubmit }: PaymentSlotProps) {
  const dueDate = payment.dueDate
    ? toDate(payment.dueDate as never)
    : null;

  const overdueDays   = dueDate ? daysOverdue(dueDate)     : 0;
  const dueSoon3Days  = dueDate ? isDueSoon(dueDate, 3)    : false;
  const dueSoon1Day   = dueDate ? isDueSoon(dueDate, 1)    : false;
  const isUrgent      = dueSoon1Day && payment.status === 'open';
  const isWarning     = dueSoon3Days && !dueSoon1Day && payment.status === 'open';

  // ── Node icon ──────────────────────────────────────────
  const NodeIcon = () => {
    switch (payment.status) {
      case 'locked':           return <Lock    size={14} className="text-text-tertiary" />;
      case 'approved':         return <Check   size={14} className="text-white" />;
      case 'insured':          return <Shield  size={14} className="text-white" />;
      case 'pending_approval': return <Clock   size={14} className="text-text-secondary" />;
      case 'rejected':         return <X       size={14} className="text-white" />;
      case 'overdue':
      case 'penalized':        return <AlertTriangle size={14} className="text-white" />;
      default:                 return null;
    }
  };

  // ── Node color ─────────────────────────────────────────
  const nodeClass = clsx(
    'w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
    {
      // locked
      'border-border bg-bg-secondary':
        payment.status === 'locked',
      // approved
      'border-success bg-success':
        payment.status === 'approved',
      // insured
      'border-accent bg-accent':
        payment.status === 'insured',
      // pending_approval
      'border-text-tertiary bg-bg-secondary':
        payment.status === 'pending_approval',
      // rejected / overdue / penalized
      'border-danger bg-danger':
        payment.status === 'rejected' ||
        payment.status === 'overdue'  ||
        payment.status === 'penalized',
      // open – urgent (red pulse)
      'border-danger bg-danger/10 animate-pulse-fast':
        payment.status === 'open' && isUrgent,
      // open – warning (orange)
      'border-warning bg-warning/10':
        payment.status === 'open' && isWarning,
      // open – normal (blue pulse)
      'border-accent bg-accent/10 animate-pulse-slow':
        payment.status === 'open' && !isUrgent && !isWarning,
    }
  );

  const penaltyLabel = overdueDays > 0 ? getPenaltyLabel(overdueDays) : '';

  return (
    <div className="flex gap-4 items-start">
      {/* Node */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <div className={nodeClass} aria-label={`Cuota ${payment.installmentNumber}: ${payment.status}`}>
          <NodeIcon />
        </div>
      </div>

      {/* Content */}
      <div className={clsx(
        'flex-1 pb-6 min-w-0',
        payment.status === 'locked' && 'opacity-50'
      )}>
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <p className="font-semibold text-[15px]">
            Cuota {payment.installmentNumber}
          </p>
          <p className={clsx(
            'text-[15px] font-bold',
            payment.status === 'approved' && 'text-success',
            payment.status === 'insured'  && 'text-accent',
            (payment.status === 'overdue' || payment.status === 'penalized') && 'text-danger',
          )}>
            {formatSoles(payment.amount)}
          </p>
        </div>

        {/* Due date */}
        {dueDate && payment.status !== 'locked' && (
          <p className={clsx(
            'text-caption mt-0.5',
            isUrgent  && 'text-danger font-medium',
            isWarning && 'text-warning font-medium',
            !isUrgent && !isWarning && 'text-text-secondary'
          )}>
            {payment.status === 'approved'
              ? `Pagado el ${formatDueDate(toDate(payment.approvedAt as never))}`
              : `Vence: ${formatDueDate(dueDate)}`
            }
          </p>
        )}

        {/* Countdown for urgent/last-day */}
        {isUrgent && dueDate && (
          <Countdown
            targetDate={dueDate}
            label="Tiempo restante:"
            className="mt-2"
          />
        )}

        {/* Penalty info */}
        {(payment.status === 'overdue' || payment.status === 'penalized') && penaltyLabel && (
          <p className="text-caption text-danger mt-1">{penaltyLabel}</p>
        )}

        {/* Insured message */}
        {payment.status === 'insured' && dueDate && (
          <p className="text-caption text-accent mt-1">
            🛡 Cubierta por Seguro de Prórroga
          </p>
        )}

        {/* Rejection message */}
        {payment.status === 'rejected' && (
          <div className="mt-2 p-3 bg-danger/5 border border-danger/20 rounded-[10px]">
            <p className="text-caption text-danger mb-1 font-medium">Comprobante rechazado</p>
            {payment.rejectionReason && (
              <p className="text-caption text-text-secondary mb-2">
                Motivo: {payment.rejectionReason}
              </p>
            )}
            {payment.resubmitDeadline && (
              <Countdown
                targetDate={toDate(payment.resubmitDeadline as never)}
                label="Tiempo para reenviar:"
                className="mb-2"
              />
            )}
            {onResubmit && (
              <button
                onClick={onResubmit}
                className="btn btn-danger text-[13px] px-4 py-2 mt-1"
              >
                Subir nuevo comprobante
              </button>
            )}
          </div>
        )}

        {/* Pending approval */}
        {payment.status === 'pending_approval' && (
          <p className="text-caption text-text-secondary mt-1">
            ⏳ Comprobante enviado — pendiente de revisión
          </p>
        )}

        {/* Open CTA */}
        {payment.status === 'open' && onPay && (
          <button
            onClick={onPay}
            className={clsx(
              'mt-3 btn text-[14px] px-5 py-2 flex items-center gap-2',
              isUrgent || isWarning ? 'btn-danger' : 'btn-primary'
            )}
          >
            <Upload size={14} aria-hidden="true" />
            Pagar esta cuota
          </button>
        )}
      </div>
    </div>
  );
}
