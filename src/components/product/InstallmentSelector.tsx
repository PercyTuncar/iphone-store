'use client';

import { useEffect } from 'react';
import { clsx } from 'clsx';
import { Check, Info } from 'lucide-react';
import type { Product, ProductClient } from '@/types/product';
import {
  calculateInstallmentPlan,
  generateInstallmentOptions,
  type InstallmentCalculation
} from '@/lib/utils/installments';

interface InstallmentSelectorProps {
  product: Product | ProductClient;
  selectedInstallments: number;
  onSelect: (installments: number, calculation: InstallmentCalculation) => void;
}

export function InstallmentSelector({
  product,
  selectedInstallments,
  onSelect
}: InstallmentSelectorProps) {
  const options = generateInstallmentOptions(product.installments);

  // Seleccionar la cuota más alta por defecto al montar
  useEffect(() => {
    if (selectedInstallments === product.installments) return; // Ya está seleccionada

    const calculation = calculateInstallmentPlan(
      product.priceTotal,
      product.interestRate * 100,
      product.installments,
      product.downPayment
    );
    onSelect(product.installments, calculation);
  }, []); // Solo al montar

  const handleSelect = (installments: number) => {
    const calculation = calculateInstallmentPlan(
      product.priceTotal,
      product.interestRate * 100,
      installments,
      product.downPayment
    );
    onSelect(installments, calculation);
  };

  const selectedCalc = calculateInstallmentPlan(
    product.priceTotal,
    product.interestRate * 100,
    selectedInstallments,
    product.downPayment
  );

  return (
    <div className="space-y-4">
      {/* Interest Rate Info */}
      {product.interestRate > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-[12px] bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-[13px] text-blue-900 leading-relaxed">
            <span className="font-semibold">Interés mensual: {(product.interestRate * 100).toFixed(1)}%</span>
            {' · '}Financiamiento disponible hasta {product.installments} meses
          </p>
        </div>
      )}

      {/* Options - Scrollable horizontal on mobile */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {options.map((installments) => {
            const isSelected = installments === selectedInstallments;
            const calculation = calculateInstallmentPlan(
              product.priceTotal,
              product.interestRate * 100,
              installments,
              product.downPayment
            );

            const isContado = installments === 1;

            return (
              <button
                key={installments}
                onClick={() => handleSelect(installments)}
                className={clsx(
                  'relative flex-shrink-0 w-[140px] p-4 rounded-[16px] transition-all snap-start',
                  'border-2 text-left',
                  isSelected
                    ? 'border-accent bg-gradient-to-br from-accent/10 to-accent/5 shadow-lg scale-[1.02]'
                    : 'border-border bg-bg-secondary hover:border-accent/40 hover:shadow-md active:scale-[0.98]'
                )}
              >
                {/* Check badge */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-md">
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Content */}
                <div className="space-y-2">
                  {isContado ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">
                          Al contado
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[24px] font-bold text-accent leading-none">
                          S/ {Math.floor(product.priceTotal)}
                        </p>
                        <p className="text-[11px] text-text-tertiary">
                          Pago único · Sin interés
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[20px] font-bold text-text-primary leading-none">
                          {installments}
                        </span>
                        <span className="text-[11px] font-medium text-text-secondary">
                          {installments === 1 ? 'mes' : 'meses'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[28px] font-bold text-accent leading-none">
                          S/ {Math.floor(calculation.installmentAmount)}
                        </p>
                        <p className="text-[11px] text-text-tertiary">
                          por mes
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {/* Gradient fade on edges for scroll hint */}
        <div className="absolute top-0 right-0 bottom-2 w-8 bg-gradient-to-l from-bg-primary to-transparent pointer-events-none" />
      </div>

      {/* Selected Plan Summary */}
      <div className="rounded-[16px] bg-bg-secondary border border-border p-4 space-y-3">
        {selectedInstallments === 1 ? (
          // Pago al contado
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-text-primary">
                💳 Pago al contado
              </span>
              <span className="px-2.5 py-1 rounded-full bg-success/10 text-success text-[11px] font-semibold">
                Sin interés
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-3 border-t border-border">
              <span className="text-[15px] text-text-secondary">Total a pagar</span>
              <span className="text-[28px] font-bold text-accent leading-none">
                S/ {product.priceTotal.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          // Pago en cuotas
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-text-primary">
                📅 Plan de {selectedInstallments} cuotas
              </span>
              {selectedCalc.totalInterest > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-warning/10 text-warning text-[11px] font-semibold">
                  +S/ {selectedCalc.totalInterest.toFixed(0)} interés
                </span>
              )}
            </div>

            <div className="space-y-2">
              {/* Primera cuota */}
              {product.downPayment > 0 ? (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <div>
                    <p className="text-[13px] font-medium text-text-primary">Paga hoy (1ª cuota)</p>
                    <p className="text-[11px] text-text-tertiary">Reserva tu iPhone</p>
                  </div>
                  <span className="text-[20px] font-bold text-accent">
                    S/ {product.downPayment.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <div>
                    <p className="text-[13px] font-medium text-text-primary">Primera cuota</p>
                    <p className="text-[11px] text-text-tertiary">Al reservar</p>
                  </div>
                  <span className="text-[20px] font-bold text-accent">
                    S/ {selectedCalc.installmentAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Cuotas restantes */}
              {product.downPayment > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <div>
                    <p className="text-[13px] font-medium text-text-primary">
                      Cuotas 2 - {selectedInstallments}
                    </p>
                    <p className="text-[11px] text-text-tertiary">
                      {selectedInstallments - 1} pagos mensuales
                    </p>
                  </div>
                  <span className="text-[20px] font-bold text-accent">
                    S/ {selectedCalc.installmentAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Precio original */}
              <div className="flex justify-between items-center py-2">
                <span className="text-[13px] text-text-secondary">Precio del producto</span>
                <span className="text-[14px] font-medium text-text-secondary">
                  S/ {product.priceTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-baseline justify-between pt-3 border-t border-border">
              <span className="text-[15px] text-text-secondary">Total a pagar</span>
              <span className="text-[24px] font-bold text-text-primary leading-none">
                S/ {selectedCalc.totalWithInterest.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
