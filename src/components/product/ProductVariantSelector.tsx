'use client';

/**
 * ProductVariantSelector — selectores de variantes para el producto maestro.
 * Mantiene la selección sincronizada con la variante activa y deshabilita opciones sin stock.
 */

import { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import type { Product } from '@/types/product';

export type ProductClient = Omit<Product, 'createdAt' | 'updatedAt' | 'publishedAt'>;

interface ProductVariantSelectorProps {
  productTitle: string;
  variants: ProductClient[];
  defaultVariantId?: string;
  onVariantChange: (variantId: string) => void;
}

type SelectionState = {
  storage: string;
  color: string;
  grade: string;
  batteryHealth: string;
};

function matchesSelection(variant: ProductClient, selection: SelectionState) {
  return (
    (!selection.storage || variant.storage === selection.storage) &&
    (!selection.color || variant.color === selection.color) &&
    (!selection.grade || (variant.grade ?? '') === selection.grade) &&
    (!selection.batteryHealth || String(variant.batteryHealth ?? '') === selection.batteryHealth)
  );
}

function getSelectionFromVariant(variant: ProductClient): SelectionState {
  return {
    storage: variant.storage ?? '',
    color: variant.color ?? '',
    grade: variant.grade ?? '',
    batteryHealth: variant.batteryHealth ? String(variant.batteryHealth) : '',
  };
}

function sortUnique(values: string[]) {
  return [...new Set(values)].filter(Boolean).sort((a, b) => a.localeCompare(b, 'es'));
}

function sortByOrder(values: string[], order: string[]) {
  return [...new Set(values)].filter(Boolean).sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai !== -1 || bi !== -1) {
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    }
    return a.localeCompare(b, 'es');
  });
}

export function ProductVariantSelector({
  productTitle,
  variants,
  defaultVariantId,
  onVariantChange,
}: ProductVariantSelectorProps) {
  const baseVariant = useMemo(() => {
    if (!variants.length) return null;
    return variants.find((variant) => variant.id === defaultVariantId && variant.stock > 0)
      ?? variants.find((variant) => variant.stock > 0)
      ?? variants[0];
  }, [variants, defaultVariantId]);

  const [selection, setSelection] = useState<SelectionState>(() => (
    baseVariant ? getSelectionFromVariant(baseVariant) : {
      storage: '',
      color: '',
      grade: '',
      batteryHealth: '',
    }
  ));

  useEffect(() => {
    if (!baseVariant) return;
    setSelection(getSelectionFromVariant(baseVariant));
  }, [baseVariant?.id]);

  const selectedVariant = useMemo(() => {
    return variants.find((variant) => variant.stock > 0 && matchesSelection(variant, selection))
      ?? variants.find((variant) => matchesSelection(variant, selection))
      ?? null;
  }, [variants, selection]);

  useEffect(() => {
    if (selectedVariant) onVariantChange(selectedVariant.id);
  }, [selectedVariant?.id, onVariantChange]);

  const storageOptions = useMemo(() => sortByOrder(variants.map((variant) => variant.storage), ['64GB', '128GB', '256GB', '512GB', '1TB']), [variants]);
  const colorOptions = useMemo(() => sortUnique(variants.map((variant) => variant.color)), [variants]);
  const gradeOptions = useMemo(() => sortByOrder(variants.map((variant) => variant.grade ?? ''), ['A+', 'A', 'B']), [variants]);
  const batteryOptions = useMemo(() => sortByOrder(variants.map((variant) => String(variant.batteryHealth ?? '')), ['100', '95', '90', '85', '80']), [variants]);

  const isOptionEnabled = (field: keyof SelectionState, value: string) => {
    return variants.some((variant) => {
      const testSelection = { ...selection, [field]: value };
      return variant.stock > 0 && matchesSelection(variant, testSelection);
    });
  };

  if (!variants.length) return null;

  return (
    <section className="card p-5 md:p-6 space-y-5">
      <div className="space-y-1">
        <p className="text-label uppercase tracking-[0.18em] text-text-secondary">Variantes / Stock</p>
        <h2 className="text-[20px] font-semibold leading-tight">Configura tu {productTitle}</h2>
        <p className="text-body text-text-secondary text-[15px]">
          Elige una combinación disponible. El precio y la cuota se actualizan en vivo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="text-caption font-medium text-text-secondary">Capacidad</span>
          <select
            className="input mt-1"
            value={selection.storage}
            onChange={(e) => setSelection((prev) => ({ ...prev, storage: e.target.value }))}
          >
            {storageOptions.map((value) => (
              <option key={value} value={value} disabled={!isOptionEnabled('storage', value)}>
                {value}{!isOptionEnabled('storage', value) ? ' — sin stock' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-caption font-medium text-text-secondary">Color</span>
          <select
            className="input mt-1"
            value={selection.color}
            onChange={(e) => setSelection((prev) => ({ ...prev, color: e.target.value }))}
          >
            {colorOptions.map((value) => (
              <option key={value} value={value} disabled={!isOptionEnabled('color', value)}>
                {value}{!isOptionEnabled('color', value) ? ' — sin stock' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-caption font-medium text-text-secondary">Condición estética</span>
          <select
            className="input mt-1"
            value={selection.grade}
            onChange={(e) => setSelection((prev) => ({ ...prev, grade: e.target.value }))}
          >
            {gradeOptions.map((value) => (
              <option key={value} value={value} disabled={!isOptionEnabled('grade', value)}>
                Grado {value}{!isOptionEnabled('grade', value) ? ' — sin stock' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-caption font-medium text-text-secondary">Salud de batería</span>
          <select
            className="input mt-1"
            value={selection.batteryHealth}
            onChange={(e) => setSelection((prev) => ({ ...prev, batteryHealth: e.target.value }))}
          >
            {batteryOptions.map((value) => (
              <option key={value} value={value} disabled={!isOptionEnabled('batteryHealth', value)}>
                {value}%{!isOptionEnabled('batteryHealth', value) ? ' — sin stock' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-caption text-text-secondary">
        <span className={clsx('inline-flex items-center rounded-full px-3 py-1', selectedVariant ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning')}>
          {selectedVariant ? `Disponible: ${selectedVariant.stock} unidades` : 'Sin combinación exacta disponible'}
        </span>
      </div>
    </section>
  );
}
