'use client';

/**
 * ProductHero — two-column hero section for product pages.
 * Left: image gallery with thumbnails.
 * Right: H1, condition/storage badges, price, installments, ReserveButton.
 *
 * LCP image uses priority={true} as required by PRD §18.2.
 */

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { AppImage } from '@/components/ui/AppImage';
import { Badge } from '@/components/ui/Badge';
import { InstallmentSelector } from './InstallmentSelector';
import type { Product, ProductClient } from '@/types/product';
import type { InstallmentCalculation } from '@/lib/utils/installments';

interface ProductHeroProps {
  product: Product | ProductClient;
  onReserve: () => void;
  selectedInstallments: number;
  onInstallmentSelect: (installments: number, calculation: InstallmentCalculation) => void;
  installmentCalculation: InstallmentCalculation | null;
  variantSelector?: React.ReactNode;
}

export function ProductHero({
  product,
  onReserve,
  selectedInstallments,
  onInstallmentSelect,
  installmentCalculation,
  variantSelector,
}: ProductHeroProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const images = product.images?.length ? product.images : [product.thumbnailUrl || '/og-default.jpg'];
  const hasBattery = product.batteryHealth !== null && product.batteryHealth !== undefined;

  // Resetear índice de imagen cuando cambie el producto (variante)
  useEffect(() => {
    setActiveIdx(0);
  }, [product.id]);

  return (
    <section className="section-gradient">
      <div className="container-main grid lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] gap-8 items-start">
        {/* ── Gallery ── */}
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <AppImage
              src={images[activeIdx]}
              alt={product.title}
              width={1200}
              height={1200}
              priority
              className="w-full h-auto object-contain bg-bg-primary"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={clsx(
                    'flex-shrink-0 w-16 h-16 rounded-[10px] overflow-hidden border-2 transition-colors',
                    activeIdx === i ? 'border-accent' : 'border-border hover:border-accent/50'
                  )}
                >
                  <AppImage
                    src={src}
                    alt={`Miniatura ${i + 1}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product info ── */}
        <div className="flex flex-col gap-5 md:sticky md:top-20">
          <div className="flex flex-wrap gap-2">
            <Badge variant={product.condition === 'new' ? 'accent' : 'neutral'}>
              {product.condition === 'new' ? 'Nuevo' : 'Reacondicionado'}
            </Badge>
            {product.grade && <Badge variant="info">Grado {product.grade}</Badge>}
            {product.storage && <Badge variant="neutral">{product.storage}</Badge>}
            {product.color && <Badge variant="neutral">{product.color}</Badge>}
            {hasBattery && <Badge variant="neutral">Batería {product.batteryHealth}%</Badge>}
          </div>

          <h1 className="text-[clamp(26px,4vw,40px)] font-bold leading-tight tracking-tight">
            {product.seo.h1 || product.title}
          </h1>

          {/* Selector de variantes - aparece antes de pricing */}
          {variantSelector && (
            <div className="-mx-1">
              {variantSelector}
            </div>
          )}

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[#FF9F0A]" aria-hidden="true">
                {'★'.repeat(Math.round(product.averageRating))}
              </span>
              <span className="text-label text-text-secondary">
                {product.averageRating.toFixed(1)} ({product.reviewCount} reseñas)
              </span>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-label text-text-secondary">Precio total</p>
            <div className="flex items-end gap-2 flex-wrap">
              <span className="text-[clamp(36px,5vw,56px)] font-bold tracking-tight text-accent leading-none">
                S/ {product.priceTotal.toFixed(2)}
              </span>
              {product.stock > 0 && product.stock <= 5 && (
                <span className="text-label text-warning font-medium">Solo quedan {product.stock} unidades</span>
              )}
              {product.stock === 0 && (
                <span className="text-label text-danger font-medium">Sin stock</span>
              )}
            </div>
          </div>

          <InstallmentSelector
            product={product}
            selectedInstallments={selectedInstallments}
            onSelect={onInstallmentSelect}
          />

          <div className="flex flex-col gap-3 pt-2">
            <button
              className="btn btn-primary w-full text-[17px] py-4"
              onClick={onReserve}
              disabled={product.stock === 0}
            >
              {selectedInstallments === 1
                ? `Comprar por S/ ${product.priceTotal.toFixed(2)}`
                : `Reservar con S/ ${(
                    product.downPayment > 0
                      ? product.downPayment
                      : (installmentCalculation?.installmentAmount ?? product.installmentAmount)
                  ).toFixed(2)}`}
            </button>

            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-label text-warning text-center -mt-2 flex items-center justify-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                Solo quedan {product.stock} unidades disponibles
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
