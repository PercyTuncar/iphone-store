'use client';

import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Check, Info, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const options = generateInstallmentOptions(product.installments).reverse(); // Invertir orden: 11, 10, 9... 1
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Habilitar scroll horizontal con rueda del mouse
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Si hay scroll vertical (deltaY), convertirlo a horizontal
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handleSelect = (installments: number) => {
    const calculation = calculateInstallmentPlan(
      product.priceTotal,
      product.interestRate * 100,
      installments,
      product.downPayment
    );
    onSelect(installments, calculation);
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const selectedCalc = calculateInstallmentPlan(
    product.priceTotal,
    product.interestRate * 100,
    selectedInstallments,
    product.downPayment
  );

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* Interest Rate Info */}
      {product.interestRate > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-[12px] bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-[13px] text-blue-900 leading-relaxed break-words">
            <span className="font-semibold">Interés mensual: {(product.interestRate * 100).toFixed(1)}%</span>
            {' · '}Financiamiento disponible hasta {product.installments} meses
          </p>
        </div>
      )}

      {/* Options - Scrollable horizontal on all screens */}
      <div className="relative -mx-2 w-full min-w-0">
        {/* Navigation buttons - visible on hover (desktop only) */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-bg-primary border-2 border-border shadow-md items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} className="text-text-primary" />
        </button>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-bg-primary border-2 border-border shadow-md items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} className="text-text-primary" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 pt-2 scrollbar-hide snap-x snap-mandatory px-2 cursor-grab active:cursor-grabbing max-w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
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
                {/* Check badge - Positioned outside with high z-index */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-lg z-50 border-2 border-bg-primary">
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
        {/* Gradient fade only on right edge for scroll hint */}
        <div className="absolute top-0 right-0 bottom-2 w-8 bg-gradient-to-l from-bg-primary to-transparent pointer-events-none" />
      </div>

      {/* Selected Plan Summary */}
      <div className="rounded-[16px] bg-bg-secondary border border-border p-4 space-y-3">
        {selectedInstallments === 1 ? (
          // Pago al contado
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                  <Check size={16} className="text-success" strokeWidth={2.5} />
                </div>
                <span className="text-[15px] font-semibold text-text-primary">
                  Pago al contado
                </span>
              </div>
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Calendar size={16} className="text-accent" strokeWidth={2} />
                </div>
                <span className="text-[15px] font-semibold text-text-primary">
                  Plan de {selectedInstallments} cuotas
                </span>
              </div>
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
                  <span className="text-[26px] font-bold text-accent leading-none">
                    S/ {product.downPayment.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <div>
                    <p className="text-[13px] font-medium text-text-primary">Primera cuota</p>
                    <p className="text-[11px] text-text-tertiary">Al reservar</p>
                  </div>
                  <span className="text-[26px] font-bold text-accent leading-none">
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
                  <span className="text-[18px] font-semibold text-text-secondary leading-none">
                    S/ {selectedCalc.installmentAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Precio original */}
              <div className="flex justify-between items-center py-2">
                <span className="text-[12px] text-text-tertiary">Precio del producto</span>
                <span className="text-[13px] font-medium text-text-tertiary line-through">
                  S/ {product.priceTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Total - Menos prominente */}
            <div className="flex items-baseline justify-between pt-3 border-t border-border">
              <span className="text-[13px] text-text-tertiary">Total a pagar</span>
              <span className="text-[16px] font-semibold text-text-secondary leading-none">
                S/ {selectedCalc.totalWithInterest.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
