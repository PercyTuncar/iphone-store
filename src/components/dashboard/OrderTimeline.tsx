'use client';

/**
 * OrderTimeline — interactive installment timeline for the client dashboard.
 * PRD §13.2: vertical on mobile, horizontal on desktop.
 * Each cuota = a PaymentSlot node connected by a line.
 * Real-time: uses onSnapshot via useOrder hook so the timeline updates
 * instantly when admin approves a payment.
 */

import { useState } from 'react';
import { clsx } from 'clsx';
import { PaymentSlot } from './PaymentSlot';
import { UploadVoucher } from './UploadVoucher';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Confetti } from '@/components/ui/Confetti';
import type { Order } from '@/types/order';
import type { Payment } from '@/types/payment';

interface OrderTimelineProps {
  order: Order;
  payments: Payment[];
  onPaymentUpdated?: () => void;
}

export function OrderTimeline({ order, payments, onPaymentUpdated }: OrderTimelineProps) {
  const [uploadTarget, setUploadTarget] = useState<Payment | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const sorted = [...payments].sort((a, b) => a.installmentNumber - b.installmentNumber);
  const approved = sorted.filter(p => p.status === 'approved' || p.status === 'insured');
  const progress = order.installments > 0
    ? Math.round((approved.length / order.installments) * 100)
    : 0;

  const handleApproved = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3500);
    onPaymentUpdated?.();
  };

  if (uploadTarget) {
    return (
      <UploadVoucher
        payment={uploadTarget}
        order={order}
        onSuccess={() => { setUploadTarget(null); handleApproved(); }}
        onCancel={() => setUploadTarget(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Confetti active={showConfetti} />

      {/* Progress bar */}
      <ProgressBar
        value={progress}
        label="Progreso del plan"
        rightLabel={`${approved.length} / ${order.installments} cuotas`}
        variant={progress === 100 ? 'success' : 'accent'}
        height="md"
        animated
      />

      {/* Status summary */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Pagadas',   count: approved.length,                                       color: 'text-success' },
          { label: 'Pendiente', count: sorted.filter(p => p.status === 'pending_approval').length, color: 'text-warning' },
          { label: 'Abiertas',  count: sorted.filter(p => p.status === 'open').length,         color: 'text-accent'  },
          { label: 'Bloqueadas',count: sorted.filter(p => p.status === 'locked').length,        color: 'text-text-tertiary' },
        ].map(s => s.count > 0 && (
          <span key={s.label} className={clsx('text-label', s.color)}>
            {s.count} {s.label}
          </span>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical connector line */}
        <div
          className="absolute left-[17px] top-5 bottom-5 w-0.5 bg-border"
          aria-hidden="true"
        />

        <div className="space-y-0 relative">
          {sorted.map((payment) => {
            const isActive = payment.status === 'open'
              || payment.status === 'rejected'
              || payment.status === 'overdue';
            return (
              <PaymentSlot
                key={payment.id}
                payment={payment}
                isActive={isActive}
                onPay={isActive ? () => setUploadTarget(payment) : undefined}
                onResubmit={payment.status === 'rejected' ? () => setUploadTarget(payment) : undefined}
              />
            );
          })}
        </div>
      </div>

      {progress === 100 && (
        <div className="bg-success/5 border border-success/25 rounded-[14px] p-5 text-center">
          <p className="text-[22px] font-bold text-success mb-1">🎉 ¡Plan completado!</p>
          <p className="text-body">Has pagado todas tus cuotas. Tu iPhone está en camino.</p>
        </div>
      )}
    </div>
  );
}
