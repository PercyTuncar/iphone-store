/**
 * InstallmentPreview — visual installment breakdown.
 * "12 cuotas de S/ 185" with total price below.
 */

import { formatSoles } from '@/lib/utils/currency';

interface InstallmentPreviewProps {
  installments: number;
  installmentAmount: number;
  priceTotal: number;
  downPayment?: number;
  className?: string;
}

export function InstallmentPreview({
  installments,
  installmentAmount,
  priceTotal,
  downPayment = 0,
  className,
}: InstallmentPreviewProps) {
  return (
    <div className={className}>
      {/* Main installment line */}
      <p className="text-[15px] text-text-secondary mb-1">
        {installments} cuotas mensuales de
      </p>
      <p className="text-[40px] font-bold text-text-primary leading-none tracking-tight mb-3">
        {formatSoles(installmentAmount)}
      </p>

      {/* Divider */}
      <div className="divider my-3" />

      {/* Breakdown */}
      <div className="space-y-1.5 text-[15px]">
        {downPayment > 0 && (
          <div className="flex justify-between">
            <span className="text-text-secondary">Cuota inicial</span>
            <span className="font-semibold">{formatSoles(downPayment)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-text-secondary">Precio total del equipo</span>
          <span className="text-text-primary font-medium">{formatSoles(priceTotal)}</span>
        </div>
      </div>

      {/* Payment methods icons */}
      <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-border">
        <span className="text-caption text-text-tertiary">Paga con:</span>
        {[
          { label: 'Yape',          color: '#7E2DFF', initial: 'Y' },
          { label: 'Plin',          color: '#00C896', initial: 'P' },
          { label: 'Transferencia', color: '#0071E3', initial: 'T' },
          { label: 'Tarjeta',       color: '#1D1D1F', initial: 'C' },
        ].map((m) => (
          <span
            key={m.label}
            className="flex items-center gap-1.5 text-caption text-text-secondary"
            aria-label={m.label}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              style={{ background: m.color }}
              aria-hidden="true"
            >
              {m.initial.length === 1 ? m.initial : ''}
            </span>
            {m.initial.length > 1 ? m.initial : m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
