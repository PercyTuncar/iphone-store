'use client';

/**
 * InsurancePurchase — dashboard widget for buying/viewing the extension insurance.
 *
 * States:
 * A) Has insurance → shows status (months covered/used/remaining)
 * B) No insurance, active due date → shows purchase options
 * C) Due date expired → button disabled, "plazo vencido" message
 *
 * PRD §10.3: purchase window closes the moment the active installment expires.
 */

import { useState } from 'react';
import { clsx } from 'clsx';
import { Shield, ShieldCheck, ShieldOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatSoles } from '@/lib/utils/currency';
import { useCountdown } from '@/lib/hooks/useCountdown';
import type { Order } from '@/types/order';
import type { Payment } from '@/types/payment';

interface InsurancePurchaseProps {
  order: Order;
  activePayment: Payment | null;  // current open installment
  onPurchase: (plan: 1 | 2 | 3) => Promise<void>;
}

const PLAN_LABELS: Record<1 | 2 | 3, string> = {
  1: '1 mes de prórroga',
  2: '2 meses de prórroga',
  3: '3 meses de prórroga',
};

export function InsurancePurchase({
  order,
  activePayment,
  onPurchase,
}: InsurancePurchaseProps) {
  const [loading, setLoading] = useState<1 | 2 | 3 | null>(null);

  const dueDate = activePayment?.dueDate
    ? (activePayment.dueDate as { toDate(): Date }).toDate()
    : null;

  const { isExpired } = useCountdown(dueDate);

  // PRD §10.3: lock purchase the moment due date passes
  const canBuy = !isExpired && dueDate !== null && order.insurance && !order.insurance.hasPurchased;

  const handleBuy = async (plan: 1 | 2 | 3) => {
    setLoading(plan);
    try {
      await onPurchase(plan);
    } finally {
      setLoading(null);
    }
  };

  // ── A: Already has insurance ─────────────────────────────
  if (order.insurance && order.insurance.hasPurchased) {
    const { monthsCovered, monthsUsed } = order.insurance;
    const remaining = monthsCovered - monthsUsed;

    return (
      <div className="card p-5 border-l-4 border-l-success">
        <div className="flex items-start gap-3">
          <ShieldCheck size={22} className="text-success flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold text-[16px] mb-1">Seguro de Prórroga Activo</p>
            <p className="text-[14px] text-text-secondary mb-3">
              {PLAN_LABELS[order.insurance.plan as 1 | 2 | 3]}
            </p>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              {Array.from({ length: monthsCovered }).map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    'h-2 flex-1 rounded-full transition-colors',
                    i < monthsUsed ? 'bg-text-tertiary' : 'bg-success'
                  )}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="text-caption text-text-secondary mt-2">
              {monthsUsed > 0
                ? `${monthsUsed} mes${monthsUsed > 1 ? 'es' : ''} usado${monthsUsed > 1 ? 's' : ''} · `
                : ''}
              <span className={remaining > 0 ? 'text-success font-medium' : 'text-text-tertiary'}>
                {remaining} mes{remaining !== 1 ? 'es' : ''} disponible{remaining !== 1 ? 's' : ''}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── C: Due date expired → cannot buy ─────────────────────
  if (isExpired && dueDate) {
    return (
      <div className="card p-5 border-l-4 border-l-danger opacity-70">
        <div className="flex items-start gap-3">
          <ShieldOff size={22} className="text-danger flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold text-[16px] mb-1">Seguro no disponible</p>
            <p className="text-[14px] text-text-secondary">
              El plazo de protección ha vencido. Se aplica penalidad por mora.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── B: Can buy insurance ──────────────────────────────────
  const prices: Record<1 | 2 | 3, number> = {
    1: order.insurance.plan === null
      ? (order as unknown as { product?: { insurancePlan1Month?: number } }).product?.insurancePlan1Month ?? 49
      : 49,
    2: 89,
    3: 99,
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={20} className="text-accent" aria-hidden="true" />
        <p className="font-semibold text-[16px]">Protege tu Pago</p>
      </div>
      <p className="text-[14px] text-text-secondary mb-5 leading-relaxed">
        Si no puedes pagar a tiempo, el seguro cubre tu cuota automáticamente
        —sin penalidad— y te da más tiempo.
      </p>

      <div className="space-y-3">
        {([1, 2, 3] as const).map((plan) => (
          <button
            key={plan}
            onClick={() => handleBuy(plan)}
            disabled={!!loading || !canBuy}
            className={clsx(
              'w-full flex items-center justify-between p-4 rounded-[12px] border-2 transition-all text-left',
              'hover:border-accent hover:bg-accent/5',
              loading === plan ? 'border-accent bg-accent/5' : 'border-border',
              (!canBuy || loading) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div>
              <p className="font-semibold text-[15px]">{PLAN_LABELS[plan]}</p>
              <p className="text-caption text-text-secondary">
                Cubre {plan} cuota{plan > 1 ? 's' : ''} vencida{plan > 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-[18px] font-bold text-accent">
                {loading === plan ? '…' : formatSoles(prices[plan])}
              </p>
            </div>
          </button>
        ))}
      </div>

      {dueDate && !isExpired && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-warning/5 border border-warning/20 rounded-[10px]">
          <Lock size={14} className="text-warning flex-shrink-0" aria-hidden="true" />
          <p className="text-caption text-warning leading-relaxed">
            El seguro solo puede comprarse mientras la cuota no haya vencido.
            Disponible hasta la fecha de vencimiento.
          </p>
        </div>
      )}
    </div>
  );
}
