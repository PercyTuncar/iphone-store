'use client';

/**
 * InsuranceUpsell — insurance plan selector shown in the checkout modal.
 * Checkout-only: only the 1-month plan is available at checkout price.
 * PRD §10.2: checkout price is cheaper than the dashboard price.
 */

import { clsx } from 'clsx';
import { Shield, ShieldCheck } from 'lucide-react';
import { formatSoles } from '@/lib/utils/currency';
import type { ProductClient } from '@/types/product';

interface InsuranceUpsellProps {
  product: ProductClient;
  selected: boolean;
  onToggle: (selected: boolean) => void;
}

export function InsuranceUpsell({ product, selected, onToggle }: InsuranceUpsellProps) {
  const checkoutPrice  = product.insuranceCheckoutDiscount1Month;
  const standardPrice  = product.insurancePlan1Month;
  const savingsAmount  = standardPrice - checkoutPrice;

  return (
    <div
      role="group"
      aria-labelledby="insurance-label"
      className={clsx(
        'rounded-[14px] border-2 p-4 cursor-pointer transition-all duration-200',
        'select-none',
        selected
          ? 'border-accent bg-accent/5'
          : 'border-border bg-bg-secondary hover:border-accent/40'
      )}
      onClick={() => onToggle(!selected)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div
          role="checkbox"
          aria-checked={selected}
          className={clsx(
            'mt-0.5 w-5 h-5 rounded-[5px] border-2 flex-shrink-0 flex items-center justify-center transition-colors',
            selected ? 'border-accent bg-accent' : 'border-border bg-bg-primary'
          )}
          aria-label="Agregar Seguro de Prórroga"
        >
          {selected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1" id="insurance-label">
            {selected
              ? <ShieldCheck size={16} className="text-accent flex-shrink-0" aria-hidden="true" />
              : <Shield      size={16} className="text-text-secondary flex-shrink-0" aria-hidden="true" />
            }
            <span className="font-semibold text-[15px]">
              Seguro de Prórroga — 1 mes
            </span>
            <span className="badge badge-success text-[11px] ml-auto">
              Ahorra {formatSoles(savingsAmount)}
            </span>
          </div>

          <p className="text-caption text-text-secondary leading-relaxed">
            Protege tu plan. Si necesitas más tiempo para pagar una cuota, este seguro la cubre
            automáticamente sin penalidad. Hoy solo cuesta{' '}
            <strong className="text-accent">{formatSoles(checkoutPrice)}</strong>.{' '}
            <span className="line-through text-text-tertiary">
              Después: {formatSoles(standardPrice)}
            </span>
          </p>
        </div>
      </div>

      {/* Price line */}
      <div className={clsx(
        'mt-3 pt-3 border-t flex items-center justify-between',
        selected ? 'border-accent/20' : 'border-border'
      )}>
        <span className="text-label text-text-secondary">
          {selected ? '✓ Incluido en el pago de hoy' : 'Añadir al pago de hoy'}
        </span>
        <span className={clsx('text-[17px] font-bold', selected ? 'text-accent' : 'text-text-primary')}>
          {formatSoles(checkoutPrice)}
        </span>
      </div>
    </div>
  );
}
