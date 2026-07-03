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

type ProductClient = Omit<Product, 'createdAt' | 'updatedAt' | 'publishedAt'>;

interface ProductPageClientProps {
  product: ProductClient;
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <ProductHero product={product} onReserve={() => setModalOpen(true)} />

      <StickyBuyBar
        productName={product.title}
        installmentAmount={product.installmentAmount}
        installments={product.installments}
        onReserve={() => setModalOpen(true)}
        disabled={product.stock === 0}
      />

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={product}
      />
    </>
  );
}
