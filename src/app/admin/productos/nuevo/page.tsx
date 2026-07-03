'use client';

/**
 * /admin/productos/nuevo — Create a new product
 */

import { ProductForm } from '@/components/admin/ProductForm';

export default function AdminNuevoProductoPage() {
  return (
    <div>
      <ProductForm initialProduct={null} />
    </div>
  );
}
