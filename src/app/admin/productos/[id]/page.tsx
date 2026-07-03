'use client';

/**
 * /admin/productos/[id] — Edit an existing product
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProductById } from '@/lib/firebase/products';
import { ProductForm } from '@/components/admin/ProductForm';
import { Spinner } from '@/components/ui/Spinner';
import type { Product } from '@/types/product';

export default function AdminEditarProductoPage() {
  const params     = useParams();
  const id         = params.id as string;
  const [product,  setProduct]  = useState<Product | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then(p => {
        if (!p) setNotFound(true);
        else setProduct(p);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" label="Cargando producto…" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-20">
        <p className="text-subtitle mb-2">Producto no encontrado</p>
        <p className="text-body text-text-secondary">ID: {id}</p>
      </div>
    );
  }

  return <ProductForm initialProduct={product} />;
}
