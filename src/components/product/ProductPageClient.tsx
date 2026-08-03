'use client';

/**
 * ProductPageClient — interactive wrapper for the product page.
 * Connects ProductHero + StickyBuyBar + real PaymentModal (Phase 6).
 */

import { useState } from 'react';
import { ProductHero } from '@/components/product/ProductHero';
import { StickyBuyBar } from '@/components/layout/StickyBuyBar';
import { PaymentModal } from '@/components/product/PaymentModal';
import type { Product } from '@/types/product';
import type { InstallmentCalculation } from '@/lib/utils/installments';

type ProductClient = Omit<Product, 'createdAt' | 'updatedAt' | 'publishedAt'>;

interface ProductPageClientProps {
  product: ProductClient;
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInstallments, setSelectedInstallments] = useState(product.installments);
  const [installmentCalculation, setInstallmentCalculation] = useState<InstallmentCalculation | null>(null);

  const handleInstallmentSelect = (installments: number, calculation: InstallmentCalculation) => {
    setSelectedInstallments(installments);
    setInstallmentCalculation(calculation);
  };

  return (
    <>
      <ProductHero
        product={product}
        onReserve={() => setModalOpen(true)}
        selectedInstallments={selectedInstallments}
        onInstallmentSelect={handleInstallmentSelect}
      />

      <StickyBuyBar
        productName={product.title}
        installmentAmount={installmentCalculation?.installmentAmount ?? product.installmentAmount}
        installments={selectedInstallments}
        onReserve={() => setModalOpen(true)}
        disabled={product.stock === 0}
      />

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={product}
        selectedInstallments={selectedInstallments}
        installmentCalculation={installmentCalculation}
      />
    </>
  );
}
