'use client';

/**
 * VariantSelectorButtons — Selector visual de variantes con botones
 * Muestra las opciones como botones estilo Apple/Samsung
 * Actualiza la URL con el parámetro ?variant=id
 */

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import type { Product } from '@/types/product';

export type ProductClient = Omit<Product, 'createdAt' | 'updatedAt' | 'publishedAt'>;

interface VariantSelectorButtonsProps {
  productTitle: string;
  productSlug: string;
  variants: ProductClient[];
  defaultVariantId?: string;
  onVariantChange: (variantId: string) => void;
}

type SelectionState = {
  storage: string;
  color: string;
};

const STORAGE_ORDER = ['64GB', '128GB', '256GB', '512GB', '1TB'];

function getStorageDisplay(storage: string): string {
  return storage.replace('GB', ' GB').replace('TB', ' TB');
}

export function VariantSelectorButtons({
  productTitle,
  productSlug,
  variants,
  defaultVariantId,
  onVariantChange,
}: VariantSelectorButtonsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const baseVariant = useMemo(() => {
    if (!variants.length) return null;

    // Si hay defaultVariantId desde la URL, usarlo
    if (defaultVariantId) {
      return variants.find((v) => v.id === defaultVariantId && v.stock > 0)
        ?? variants.find((v) => v.id === defaultVariantId)
        ?? null;
    }

    // Si NO hay parámetro en URL, NO seleccionar nada automáticamente
    return null;
  }, [variants, defaultVariantId]);

  const [selection, setSelection] = useState<SelectionState>(() => ({
    storage: baseVariant?.storage ?? '',
    color: baseVariant?.color ?? '',
  }));

  // Rastrear si ya sincronizamos con la URL para evitar loops
  const syncedVariantId = useRef<string | undefined>(undefined);

  // Sincronizar con variante base solo cuando cambia defaultVariantId desde la URL
  useEffect(() => {
    // Si no hay baseVariant o ya sincronizamos este ID, no hacer nada
    if (!baseVariant || syncedVariantId.current === defaultVariantId) return;

    syncedVariantId.current = defaultVariantId;

    setSelection({
      storage: baseVariant.storage,
      color: baseVariant.color,
    });
  }, [defaultVariantId, baseVariant]);

  // Encontrar variante que coincida con la selección actual
  const selectedVariant = useMemo(() => {
    return variants.find((v) =>
      v.storage === selection.storage &&
      v.color === selection.color &&
      v.stock > 0
    ) ?? variants.find((v) =>
      v.storage === selection.storage &&
      v.color === selection.color
    ) ?? null;
  }, [variants, selection]);

  // Notificar cambio de variante y actualizar URL solo si el usuario interactuó
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!selectedVariant) return;

    onVariantChange(selectedVariant.id);

    // No actualizar URL en el mount inicial (cuando viene sin ?variant)
    // Solo actualizar cuando el usuario selecciona manualmente
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Actualizar URL con ?variant=id solo después de interacción del usuario
    const params = new URLSearchParams(searchParams.toString());
    const currentVariant = params.get('variant');

    // Solo actualizar si cambió
    if (currentVariant !== selectedVariant.id) {
      params.set('variant', selectedVariant.id);
      router.replace(`/${productSlug}?${params.toString()}`, { scroll: false });
    }
  }, [selectedVariant?.id, onVariantChange, router, productSlug, searchParams]);

  // Extraer opciones únicas
  const storageOptions = useMemo(() => {
    const storages = [...new Set(variants.map((v) => v.storage))];
    return storages.sort((a, b) => {
      const ai = STORAGE_ORDER.indexOf(a);
      const bi = STORAGE_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [variants]);

  const colorOptions = useMemo(() => {
    return [...new Set(variants.map((v) => v.color))].filter(Boolean).sort();
  }, [variants]);

  // Verificar si una opción está disponible con la selección actual
  const isStorageAvailable = (storage: string) => {
    // Si no hay color seleccionado aún, verificar si hay stock en cualquier combinación
    if (!selection.color) {
      return variants.some((v) => v.storage === storage && v.stock > 0);
    }
    return variants.some((v) => v.storage === storage && v.color === selection.color && v.stock > 0);
  };

  const isColorAvailable = (color: string) => {
    // Si no hay storage seleccionado aún, verificar si hay stock en cualquier combinación
    if (!selection.storage) {
      return variants.some((v) => v.color === color && v.stock > 0);
    }
    return variants.some((v) => v.storage === selection.storage && v.color === color && v.stock > 0);
  };

  const handleStorageSelect = (storage: string) => {
    setSelection((prev) => ({ ...prev, storage }));
  };

  const handleColorSelect = (color: string) => {
    setSelection((prev) => ({ ...prev, color }));
  };

  if (!variants.length) return null;

  // Determinar el estado de la selección para mostrar mensajes guiados
  const hasStorage = Boolean(selection.storage);
  const hasColor = Boolean(selection.color);
  const isComplete = hasStorage && hasColor && selectedVariant;

  return (
    <section className="card p-4 sm:p-5 md:p-6 space-y-5 sm:space-y-6 w-full min-w-0 overflow-hidden">
      {/* Header con progreso */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-label uppercase tracking-[0.18em]" style={{ color: 'var(--color-text-secondary)' }}>
            Configuración
          </p>
          {/* Indicador de progreso */}
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: hasStorage ? 'var(--color-success)' : 'var(--color-border)',
                transition: 'background var(--duration-normal) var(--ease-apple)',
              }}
            />
            <div
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: hasColor ? 'var(--color-success)' : 'var(--color-border)',
                transition: 'background var(--duration-normal) var(--ease-apple)',
              }}
            />
          </div>
        </div>

        <h2 className="text-[18px] sm:text-[20px] font-semibold leading-tight break-words" style={{ color: 'var(--color-text-primary)' }}>
          {!hasStorage && 'Elige la capacidad de tu ' + productTitle}
          {hasStorage && !hasColor && 'Ahora elige el color'}
          {isComplete && 'Tu configuración está lista'}
        </h2>

        <p className="text-body text-[14px] sm:text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>
          {!hasStorage && 'Empieza seleccionando cuánto espacio necesitas.'}
          {hasStorage && !hasColor && 'Selecciona el color que más te guste.'}
          {isComplete && 'Puedes cambiar tu selección en cualquier momento.'}
        </p>
      </div>

      {/* Selector de almacenamiento */}
      <div className="space-y-3 w-full min-w-0">
        <label className="text-[14px] sm:text-[15px] font-semibold flex items-center gap-2 flex-wrap" style={{ color: 'var(--color-text-primary)' }}>
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0"
            style={{
              background: hasStorage ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
              color: hasStorage ? '#FFFFFF' : 'var(--color-text-secondary)',
              transition: 'all var(--duration-normal) var(--ease-apple)',
            }}
          >
            1
          </span>
          <span className="break-words">Capacidad de almacenamiento</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 w-full">
          {storageOptions.map((storage) => {
            const isSelected = selection.storage === storage;
            const isAvailable = isStorageAvailable(storage);
            const isDisabled = !isAvailable;

            return (
              <button
                key={storage}
                type="button"
                onClick={() => !isDisabled && handleStorageSelect(storage)}
                disabled={isDisabled}
                className="relative px-4 py-4 rounded-xl border-2 text-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 animate-scale-in"
                style={{
                  borderColor: isSelected ? 'var(--color-accent)' : isDisabled ? 'var(--color-border)' : 'var(--color-border)',
                  background: isSelected ? 'rgba(0, 113, 227, 0.08)' : '#FFFFFF',
                  opacity: isDisabled ? 0.4 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all var(--duration-normal) var(--ease-apple)',
                  boxShadow: isSelected ? 'var(--shadow-accent)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled && !isSelected) {
                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <span
                    className="text-[16px] font-bold"
                    style={{
                      color: isSelected ? 'var(--color-accent)' : isDisabled ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                    }}
                  >
                    {getStorageDisplay(storage)}
                  </span>
                  {isDisabled && (
                    <span className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
                      Agotado
                    </span>
                  )}
                </div>
                {isSelected && !isDisabled && (
                  <div
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center animate-scale-in"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    <Check size={14} style={{ color: '#FFFFFF' }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector de color - solo visible después de seleccionar storage */}
      {hasStorage && (
        <div className="space-y-3 animate-slide-up">
          <label className="text-[15px] font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: hasColor ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                color: hasColor ? '#FFFFFF' : 'var(--color-text-secondary)',
                transition: 'all var(--duration-normal) var(--ease-apple)',
              }}
            >
              2
            </span>
            Color
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {colorOptions.map((color) => {
              const isSelected = selection.color === color;
              const isAvailable = isColorAvailable(color);
              const isDisabled = !isAvailable;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => !isDisabled && handleColorSelect(color)}
                  disabled={isDisabled}
                  className="relative px-5 py-4 rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 animate-scale-in"
                  style={{
                    borderColor: isSelected ? 'var(--color-accent)' : isDisabled ? 'var(--color-border)' : 'var(--color-border)',
                    background: isSelected ? 'rgba(0, 113, 227, 0.08)' : '#FFFFFF',
                    opacity: isDisabled ? 0.4 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all var(--duration-normal) var(--ease-apple)',
                    boxShadow: isSelected ? 'var(--shadow-accent)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="text-[16px] font-semibold"
                      style={{
                        color: isSelected ? 'var(--color-accent)' : isDisabled ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                      }}
                    >
                      {color}
                    </span>
                    {isSelected && !isDisabled && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 animate-scale-in"
                        style={{ background: 'var(--color-accent)' }}
                      >
                        <Check size={14} style={{ color: '#FFFFFF' }} />
                      </div>
                    )}
                  </div>
                  {isDisabled && (
                    <span className="text-[11px] mt-1 block" style={{ color: 'var(--color-text-tertiary)' }}>
                      No disponible en {getStorageDisplay(selection.storage)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Estado de disponibilidad - solo visible cuando hay variante completa */}
      {isComplete && (
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t gap-3 animate-slide-up"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-3">
            {selectedVariant && selectedVariant.stock > 0 ? (
              <>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center animate-scale-in"
                  style={{ background: 'rgba(52, 199, 89, 0.12)' }}
                >
                  <Check size={20} style={{ color: 'var(--color-success)' }} />
                </div>
                <div>
                  <p className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Disponible para entrega inmediata
                  </p>
                  <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                    {selectedVariant.stock} {selectedVariant.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255, 159, 10, 0.12)' }}
                >
                  <span style={{ color: 'var(--color-warning)', fontSize: '20px' }}>⚠</span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Combinación sin stock
                  </p>
                  <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                    Prueba otra configuración
                  </p>
                </div>
              </>
            )}
          </div>
          {selectedVariant && selectedVariant.stock > 0 && (
            <div
              className="px-3 py-2 rounded-lg text-right"
              style={{ background: 'var(--color-bg-secondary)' }}
            >
              <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                SKU
              </p>
              <p className="text-[13px] font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {selectedVariant.sku}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
