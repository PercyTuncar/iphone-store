'use client';

/**
 * ProductPageClient — interactive wrapper for the product page.
 * Keeps the active product variant, installment selection, sticky CTA and payment modal in sync.
 */

import { useEffect, useMemo, useState } from 'react';
import { ProductHero } from '@/components/product/ProductHero';
import { VariantSelectorButtons } from '@/components/product/VariantSelectorButtons';
import { VariantComparator } from '@/components/product/VariantComparator';
import { StickyBuyBar } from '@/components/layout/StickyBuyBar';
import { PaymentModal } from '@/components/product/PaymentModal';
import { calculateInstallmentPlan } from '@/lib/utils/installments';
import { trackVariantView, trackVariantInteraction } from '@/lib/analytics/variantTracking';
import type { Product } from '@/types/product';
import type { InstallmentCalculation } from '@/lib/utils/installments';

export type ProductClient = Omit<Product, 'createdAt' | 'updatedAt' | 'publishedAt'>;

interface ProductPageClientProps {
  product: ProductClient;
  variants?: ProductClient[];
  initialVariantId?: string; // NUEVO: ID de variante desde URL ?variant=
}

export function ProductPageClient({ product, variants = [], initialVariantId }: ProductPageClientProps) {
  const variantList = variants.length > 0 ? variants : [];

  // Si se proporciona initialVariantId desde URL, intentar usarlo
  const initialVariant = useMemo(() => {
    if (initialVariantId) {
      const urlVariant = variantList.find(v => v.id === initialVariantId);
      if (urlVariant) return urlVariant;
    }
    // Si NO hay initialVariantId, retornar null para que NO se seleccione nada
    return null;
  }, [variantList, initialVariantId]);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(initialVariant?.id ?? null);
  const [modalOpen, setModalOpen] = useState(false);
  const [comparatorOpen, setComparatorOpen] = useState(false);
  const [selectedInstallments, setSelectedInstallments] = useState(initialVariant?.installments ?? product.installments);
  const [installmentCalculation, setInstallmentCalculation] = useState<InstallmentCalculation | null>(null);

  const currentProduct = useMemo(
    () => {
      if (!selectedVariantId) return product;
      return variantList.find((variant) => variant.id === selectedVariantId) ?? product;
    },
    [variantList, selectedVariantId, product]
  );

  useEffect(() => {
    if (initialVariant?.id) {
      setSelectedVariantId(initialVariant.id);
    }
  }, [initialVariant?.id]);

  // Track variant view cuando se carga o cambia la variante
  useEffect(() => {
    if (currentProduct.id && currentProduct.id !== product.id) {
      trackVariantView(currentProduct.id, product.id, {
        storage: currentProduct.storage,
        color: currentProduct.color,
        price: currentProduct.priceTotal,
      });
    }
  }, [currentProduct.id, product.id, currentProduct.storage, currentProduct.color, currentProduct.priceTotal]);

  useEffect(() => {
    const calculation = calculateInstallmentPlan(
      currentProduct.priceTotal,
      currentProduct.interestRate * 100,
      currentProduct.installments,
      currentProduct.downPayment
    );
    setInstallmentCalculation(calculation);
    setSelectedInstallments(currentProduct.installments);
  }, [
    currentProduct.id,
    currentProduct.priceTotal,
    currentProduct.interestRate,
    currentProduct.installments,
    currentProduct.downPayment,
  ]);

  const handleInstallmentSelect = (installments: number, calculation: InstallmentCalculation) => {
    setSelectedInstallments(installments);
    setInstallmentCalculation(calculation);
  };

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);

    // Track interaction
    const variant = variantList.find(v => v.id === variantId);
    if (variant) {
      trackVariantInteraction(variantId, product.id, 'variant_selected', {
        storage: variant.storage,
        color: variant.color,
      });
    }
  };

  const firstPaymentAmount = selectedInstallments === 1
    ? currentProduct.priceTotal
    : (currentProduct.downPayment > 0
        ? currentProduct.downPayment
        : (installmentCalculation?.installmentAmount ?? currentProduct.installmentAmount));

  return (
    <>
      <ProductHero
        product={currentProduct}
        onReserve={() => setModalOpen(true)}
        selectedInstallments={selectedInstallments}
        onInstallmentSelect={handleInstallmentSelect}
        installmentCalculation={installmentCalculation}
        variantSelector={
          variantList.length > 0 ? (
            <div className="space-y-4">
              <VariantSelectorButtons
                productTitle={product.model}
                productSlug={product.slug}
                variants={variantList}
                defaultVariantId={selectedVariantId}
                onVariantChange={handleVariantChange}
              />

              {variantList.length > 1 && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setComparatorOpen(true)}
                    className="btn btn-ghost text-sm"
                  >
                    Comparar variantes lado a lado
                  </button>
                </div>
              )}
            </div>
          ) : undefined
        }
      />

      <StickyBuyBar
        productName={currentProduct.title}
        firstPaymentAmount={firstPaymentAmount}
        installments={selectedInstallments}
        downPayment={currentProduct.downPayment}
        onReserve={() => setModalOpen(true)}
        disabled={currentProduct.stock === 0}
      />

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={currentProduct}
        selectedInstallments={selectedInstallments}
        installmentCalculation={installmentCalculation}
      />

      {comparatorOpen && variantList.length > 1 && (
        <VariantComparator
          variants={variantList}
          onSelect={handleVariantChange}
          onClose={() => setComparatorOpen(false)}
        />
      )}
    </>
  );
}
