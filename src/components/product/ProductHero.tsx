'use client';

/**
 * ProductHero — two-column hero section for product pages.
 * Left: image gallery with thumbnails.
 * Right: H1, condition/storage badges, price, installments, ReserveButton.
 *
 * LCP image uses priority={true} as required by PRD §18.2.
 */

import { useState } from 'react';
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
}

export function ProductHero({
  product,
  onReserve,
  selectedInstallments,
  onInstallmentSelect,
  installmentCalculation
}: ProductHeroProps) {
  const images = product.images.length > 0 ? product.images : [product.thumbnailUrl];
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section
      className="pt-6 pb-16 bg-bg-primary"
      aria-label={`Detalles de ${product.title}`}
    >
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          {/* ── Gallery ── */}
          <div className="flex flex-col gap-4">
            {/* Main image — LCP, priority={true} */}
            <div className="relative bg-bg-secondary rounded-[18px] overflow-hidden aspect-square flex items-center justify-center p-10">
              <AppImage
                src={images[activeIdx] ?? '/og-default.jpg'}
                alt={`${product.title}${product.color ? ` color ${product.color}` : ''}, vista ${activeIdx + 1}`}
                width={480}
                height={480}
                priority               // LCP optimization
                preset="none"
                className="object-contain w-full h-full"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Galería de imágenes">
                {images.map((src, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={activeIdx === i}
                    aria-label={`Imagen ${i + 1}`}
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
            {/* Condition badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={product.condition === 'new' ? 'accent' : 'neutral'}>
                {product.condition === 'new' ? 'Nuevo' : 'Reacondicionado'}
              </Badge>
              {product.grade && (
                <Badge variant="info">Grado {product.grade}</Badge>
              )}
              {product.storage && (
                <Badge variant="neutral">{product.storage}</Badge>
              )}
              {product.color && (
                <Badge variant="neutral">{product.color}</Badge>
              )}
            </div>

            {/* H1 — exactly one per page, SEO-optimized */}
            <h1 className="text-[clamp(26px,4vw,40px)] font-bold leading-tight tracking-tight">
              {product.seo.h1 || product.title}
            </h1>

            {/* Reviews summary */}
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

            {/* Installment Selector */}
            <InstallmentSelector
              product={product}
              selectedInstallments={selectedInstallments}
              onSelect={onInstallmentSelect}
            />

            {/* CTA */}
            <button
              onClick={onReserve}
              disabled={product.stock === 0}
              className={clsx(
                'btn btn-primary w-full text-[17px] py-4 font-semibold',
                product.stock === 0 && 'opacity-40 cursor-not-allowed'
              )}
            >
              {product.stock === 0 ? 'Sin stock' : (() => {
                if (selectedInstallments === 1) {
                  // Pago al contado
                  return `Comprar por S/ ${product.priceTotal.toFixed(2)}`;
                }

                // Pago en cuotas
                const firstPayment = product.downPayment > 0
                  ? product.downPayment
                  : (installmentCalculation?.installmentAmount ?? product.installmentAmount);

                return `Reservar con S/ ${firstPayment.toFixed(2)}`;
              })()}
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
