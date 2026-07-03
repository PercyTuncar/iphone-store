'use client';

/**
 * InsuranceStatusCard — compact status banner shown above the installment
 * timeline when the active payment was covered by insurance.
 * PRD §10.4: "La cuota aparece con un escudo verde y el mensaje
 *  'Cubierta por tu Seguro de Prórroga. Nueva fecha: [fecha + 1 mes]'"
 */

import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { formatDueDate, toDate } from '@/lib/utils/dates';
import { addMonths } from 'date-fns';
import type { Order } from '@/types/order';
import type { Payment } from '@/types/payment';

interface InsuranceStatusCardProps {
  order: Order;
  coveredPayment?: Payment | null;  // the payment that was just insured
}

export function InsuranceStatusCard({ order, coveredPayment }: InsuranceStatusCardProps) {
  const ins = order.insurance;

  if (!ins.hasPurchased) return null;

  const remaining = ins.monthsCovered - ins.monthsUsed;
  const isExhausted = remaining <= 0;

  // Compute the new due date if a payment was just covered
  const newDueDate = coveredPayment?.dueDate
    ? addMonths(toDate(coveredPayment.dueDate as never), 1)
    : null;

  return (
    <div className={`
      flex items-start gap-3 p-4 rounded-[14px] border
      ${isExhausted
        ? 'bg-text-tertiary/5 border-text-tertiary/20'
        : 'bg-success/5 border-success/25'
      }
    `}>
      {isExhausted
        ? <ShieldAlert size={20} className="text-text-tertiary flex-shrink-0 mt-0.5" aria-hidden="true" />
        : <ShieldCheck  size={20} className="text-success   flex-shrink-0 mt-0.5" aria-hidden="true" />
      }

      <div className="flex-1">
        {coveredPayment && newDueDate ? (
          <>
            <p className="font-semibold text-[15px] text-success mb-0.5">
              Cubierta por tu Seguro de Prórroga
            </p>
            <p className="text-[14px] text-text-secondary">
              Nueva fecha de vencimiento:{' '}
              <strong>{formatDueDate(newDueDate)}</strong>
            </p>
          </>
        ) : (
          <p className="font-semibold text-[15px] mb-0.5">
            Seguro de Prórroga
          </p>
        )}

        <p className="text-caption text-text-secondary mt-1">
          {isExhausted
            ? 'Has usado todos tus meses de prórroga.'
            : `${remaining} mes${remaining !== 1 ? 'es' : ''} de cobertura disponible${remaining !== 1 ? 's' : ''}`
          }
        </p>
      </div>
    </div>
  );
}
