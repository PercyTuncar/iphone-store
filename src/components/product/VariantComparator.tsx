'use client';

/**
 * VariantComparator - Comparación lado a lado de variantes
 * Permite al usuario comparar hasta 3 variantes simultáneamente
 */

import { useState } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { AppImage } from '@/components/ui/AppImage';
import type { Product } from '@/types/product';

export type ProductClient = Omit<Product, 'createdAt' | 'updatedAt' | 'publishedAt'>;

interface VariantComparatorProps {
  variants: ProductClient[];
  onSelect: (variantId: string) => void;
  onClose: () => void;
}

export function VariantComparator({ variants, onSelect, onClose }: VariantComparatorProps) {
  const [selectedVariants, setSelectedVariants] = useState<ProductClient[]>([]);

  const toggleVariant = (variant: ProductClient) => {
    if (selectedVariants.find(v => v.id === variant.id)) {
      setSelectedVariants(selectedVariants.filter(v => v.id !== variant.id));
    } else if (selectedVariants.length < 3) {
      setSelectedVariants([...selectedVariants, variant]);
    }
  };

  const isSelected = (variantId: string) => selectedVariants.some(v => v.id === variantId);

  const comparisonFields = [
    { key: 'storage', label: 'Almacenamiento' },
    { key: 'color', label: 'Color' },
    { key: 'condition', label: 'Condición', format: (v: any) => v === 'new' ? 'Nuevo' : 'Reacondicionado' },
    { key: 'grade', label: 'Grado estético', format: (v: any) => v ? `Grado ${v}` : '-' },
    { key: 'batteryHealth', label: 'Batería', format: (v: any) => v ? `${v}%` : '-' },
    { key: 'priceTotal', label: 'Precio', format: (v: any) => `S/ ${v.toFixed(2)}` },
    { key: 'installmentAmount', label: 'Cuota mensual', format: (v: any) => `S/ ${v.toFixed(2)}` },
    { key: 'stock', label: 'Stock disponible', format: (v: any) => `${v} unidades` },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{
        background: 'rgba(0, 0, 0, 0.48)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="glass-card w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-slide-up sm:animate-scale-in"
        style={{
          borderRadius: 'var(--radius-ios)',
          boxShadow: 'var(--shadow-floating)',
        }}
      >
        {/* Header */}
        <div className="border-b border-[var(--color-border)] p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold" style={{ letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              Comparar Variantes
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Selecciona hasta 3 variantes para comparar (actualmente: {selectedVariants.length}/3)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full transition-all flex-shrink-0"
            style={{
              background: 'var(--color-bg-secondary)',
              transition: 'all var(--duration-normal) var(--ease-apple)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.background = '#E8E8ED';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'var(--color-bg-secondary)';
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            aria-label="Cerrar"
          >
            <X size={20} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Selector de variantes */}
          {selectedVariants.length < 3 && (
            <div
              className="p-4 sm:p-6 border-b"
              style={{
                background: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)'
              }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Selecciona variantes para comparar:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => toggleVariant(variant)}
                    disabled={!isSelected(variant.id) && selectedVariants.length >= 3}
                    className={clsx(
                      'p-3 sm:p-4 rounded-xl text-left transition-all',
                      isSelected(variant.id) && 'border-2',
                      !isSelected(variant.id) && 'border',
                      !isSelected(variant.id) && selectedVariants.length >= 3 && 'opacity-40 cursor-not-allowed'
                    )}
                    style={{
                      borderColor: isSelected(variant.id) ? 'var(--color-accent)' : 'var(--color-border)',
                      background: isSelected(variant.id) ? 'rgba(0, 113, 227, 0.06)' : '#FFFFFF',
                      transition: 'all var(--duration-normal) var(--ease-apple)',
                      transform: isSelected(variant.id) ? 'scale(1.02)' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected(variant.id) && selectedVariants.length < 3) {
                        e.currentTarget.style.borderColor = 'var(--color-accent)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected(variant.id)) {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          borderColor: isSelected(variant.id) ? 'var(--color-accent)' : 'var(--color-border)',
                          background: isSelected(variant.id) ? 'var(--color-accent)' : 'transparent',
                          transition: 'all var(--duration-normal) var(--ease-apple)',
                        }}
                      >
                        {isSelected(variant.id) && <Check size={14} style={{ color: '#FFFFFF' }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {variant.storage} {variant.color}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                          S/ {variant.priceTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de comparación */}
          {selectedVariants.length > 0 ? (
            <div className="p-4 sm:p-6">
              {/* Vista Desktop - Tabla */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ background: 'var(--color-bg-secondary)' }}>
                      <th
                        className="p-4 text-left text-sm font-semibold border sticky left-0 z-10 min-w-[150px]"
                        style={{
                          background: 'var(--color-bg-secondary)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        Característica
                      </th>
                      {selectedVariants.map((variant) => (
                        <th
                          key={variant.id}
                          className="p-4 text-center border min-w-[220px]"
                          style={{
                            background: '#FFFFFF',
                            borderColor: 'var(--color-border)'
                          }}
                        >
                          <div className="space-y-3">
                            <div className="overflow-hidden rounded-xl" style={{ boxShadow: 'var(--shadow-card)' }}>
                              <AppImage
                                src={variant.thumbnailUrl}
                                alt={variant.title}
                                width={200}
                                height={200}
                                className="w-full h-40 object-cover"
                              />
                            </div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                              {variant.storage} {variant.color}
                            </p>
                            <button
                              type="button"
                              onClick={() => toggleVariant(variant)}
                              className="text-xs font-medium hover:underline transition-colors"
                              style={{
                                color: 'var(--color-danger)',
                                transition: 'opacity var(--duration-normal) var(--ease-apple)'
                              }}
                            >
                              Quitar
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFields.map((field, idx) => (
                      <tr
                        key={field.key}
                        style={{
                          background: idx % 2 === 0 ? '#FFFFFF' : 'var(--color-bg-secondary)',
                        }}
                      >
                        <td
                          className="p-4 font-medium border sticky left-0 z-10 text-sm"
                          style={{
                            background: 'inherit',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          {field.label}
                        </td>
                        {selectedVariants.map((variant) => {
                          const value = (variant as any)[field.key];
                          const formattedValue = field.format ? field.format(value) : value;
                          return (
                            <td
                              key={variant.id}
                              className="p-4 text-center border"
                              style={{
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-primary)',
                              }}
                            >
                              {formattedValue}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista Mobile - Cards */}
              <div className="md:hidden space-y-4">
                {selectedVariants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="rounded-xl overflow-hidden border animate-slide-up"
                    style={{
                      background: '#FFFFFF',
                      borderColor: 'var(--color-border)',
                      boxShadow: 'var(--shadow-card)',
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Header del card */}
                    <div
                      className="p-4 border-b flex items-center justify-between"
                      style={{
                        background: 'var(--color-bg-secondary)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {variant.storage} {variant.color}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          S/ {variant.priceTotal.toFixed(2)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleVariant(variant)}
                        className="text-xs font-medium hover:underline"
                        style={{ color: 'var(--color-danger)' }}
                      >
                        Quitar
                      </button>
                    </div>

                    {/* Imagen */}
                    <div className="p-4">
                      <div className="overflow-hidden rounded-xl" style={{ boxShadow: 'var(--shadow-card)' }}>
                        <AppImage
                          src={variant.thumbnailUrl}
                          alt={variant.title}
                          width={300}
                          height={300}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>

                    {/* Características */}
                    <div className="p-4 space-y-3">
                      {comparisonFields.map((field) => {
                        const value = (variant as any)[field.key];
                        const formattedValue = field.format ? field.format(value) : value;
                        return (
                          <div
                            key={field.key}
                            className="flex justify-between items-center py-2 border-b last:border-0"
                            style={{ borderColor: 'var(--color-border)' }}
                          >
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                              {field.label}
                            </span>
                            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                              {formattedValue}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Botón seleccionar */}
                    <div
                      className="p-4 border-t"
                      style={{
                        background: 'var(--color-bg-secondary)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <button
                        onClick={() => {
                          onSelect(variant.id);
                          onClose();
                        }}
                        className="w-full btn btn-primary flex items-center justify-center gap-2"
                        disabled={variant.stock === 0}
                      >
                        Elegir esta variante
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Acciones Desktop */}
              <div className="hidden md:flex mt-6 flex-wrap gap-3 justify-center">
                {selectedVariants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      onSelect(variant.id);
                      onClose();
                    }}
                    className="btn btn-primary flex items-center gap-2 text-sm sm:text-base"
                    disabled={variant.stock === 0}
                  >
                    Elegir {variant.storage} {variant.color}
                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-base mb-2 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                No hay variantes seleccionadas
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Selecciona al menos una variante para comparar
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="border-t p-4 sm:p-6 flex justify-end flex-shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost text-sm sm:text-base"
          >
            Cerrar comparador
          </button>
        </div>
      </div>
    </div>
  );
}
