'use client';

/**
 * ProductPageClient — interactive wrapper for the product page.
 * Keeps the active product variant, installment selection, sticky CTA and payment modal in sync.
 */

import { useEffect, useMemo, useState } from 'react';
import { ProductHero } from '@/components/product/ProductHero';
import { ProductVariantSelector } from '@/components/product/ProductVariantSelector';
import { StickyBuyBar } from '@/components/layout/StickyBuyBar';
import { PaymentModal } from '@/components/product/PaymentModal';
import { calculateInstallmentPlan } from '@/lib/utils/installments';
import type { Product } from '@/types/product';
import type { InstallmentCalculation } from '@/lib/utils/installments';

export type ProductClient = Omit<Product, 'createdAt' | 'updatedAt' | 'publishedAt'>;

interface ProductPageClientProps {
  product: ProductClient;
  variants?: ProductClient[];
}

export function ProductPageClient({ product, variants = [] }: ProductPageClientProps) {
  const variantList = variants.length > 0 ? variants : [];
  const initialVariant = useMemo(
    () => variantList.find((variant) => variant.stock > 0) ?? variantList[0] ?? product,
    [variantList, product]
  );

  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant.id);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInstallments, setSelectedInstallments] = useState(initialVariant.installments);
  const [installmentCalculation, setInstallmentCalculation] = useState<InstallmentCalculation | null>(null);

  const currentProduct = useMemo(
    () => variantList.find((variant) => variant.id === selectedVariantId) ?? product,
    [variantList, selectedVariantId, product]
  );

  useEffect(() => {
    setSelectedVariantId(initialVariant.id);
  }, [initialVariant.id]);

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

  const firstPaymentAmount = selectedInstallments === 1
    ? currentProduct.priceTotal
    : (currentProduct.downPayment > 0
        ? currentProduct.downPayment
        : (installmentCalculation?.installmentAmount ?? currentProduct.installmentAmount));

  return (
    <>
      {variantList.length > 0 && (
        <ProductVariantSelector
          productTitle={product.model}
          variants={variantList}
          defaultVariantId={selectedVariantId}
          onVariantChange={setSelectedVariantId}
        />
      )}

      <ProductHero
        product={currentProduct}
        onReserve={() => setModalOpen(true)}
        selectedInstallments={selectedInstallments}
        onInstallmentSelect={handleInstallmentSelect}
        installmentCalculation={installmentCalculation}
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
    </>
  );
}
