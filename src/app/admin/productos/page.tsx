'use client';

/**
 * /admin/productos — List of all products (published, drafts, archived).
 * Admin can create new, edit, publish, archive, and delete products.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Archive, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import {
  getAllProducts,
  publishProduct,
  archiveProduct,
  deleteProduct,
} from '@/lib/firebase/products';
import { AppImage } from '@/components/ui/AppImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { formatSoles } from '@/lib/utils/currency';
import type { Product } from '@/types/product';

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  draft:     'Borrador',
  archived:  'Archivado',
};
const STATUS_VARIANTS: Record<string, 'success' | 'neutral' | 'warning'> = {
  published: 'success',
  draft:     'neutral',
  archived:  'warning',
};

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllProducts();
      setProducts(all);
    } catch {
      toast.error('Error al cargar productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? products : products.filter(p => p.status === filter);

  const handlePublish = async (id: string) => {
    try {
      await publishProduct(id);
      toast.success('Producto publicado.');
      await load();
    } catch { toast.error('Error al publicar.'); }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveProduct(id);
      toast.success('Producto archivado.');
      await load();
    } catch { toast.error('Error al archivar.'); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteProduct(id);
      toast.success('Producto eliminado.');
      await load();
    } catch { toast.error('Error al eliminar.'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-section-title mb-1">Productos</h1>
          <p className="text-label text-text-secondary">
            {products.length} modelo{products.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button variant="primary" size="sm">
            <Plus size={16} aria-hidden="true" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'published', 'draft', 'archived'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-pill text-label font-medium transition-colors ${
              filter === f
                ? 'bg-accent text-white'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
            }`}
          >
            {f === 'all' ? 'Todos' : STATUS_LABELS[f]}
            <span className="ml-1.5 text-[11px] opacity-70">
              ({f === 'all' ? products.length : products.filter(p => p.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" label="Cargando productos…" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-subtitle mb-2">Sin productos</p>
          <p className="text-body text-text-secondary mb-6">
            {filter === 'all'
              ? 'Crea tu primer producto para comenzar.'
              : `No hay productos con estado "${STATUS_LABELS[filter]}".`}
          </p>
          {filter === 'all' && (
            <Link href="/admin/productos/nuevo">
              <Button variant="primary">Crear primer producto</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(product => (
            <ProductRow
              key={product.id}
              product={product}
              onPublish={handlePublish}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductRow({
  product,
  onPublish,
  onArchive,
  onDelete,
}: {
  product: Product;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}) {
  const variant = STATUS_VARIANTS[product.status] ?? 'neutral';

  return (
    <div className="card p-4 hover:shadow-elevated transition-shadow">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-[10px] bg-bg-secondary overflow-hidden flex-shrink-0">
          <AppImage
            src={product.thumbnailUrl || '/og-default.jpg'}
            alt={product.title}
            width={56}
            height={56}
            className="object-contain w-full h-full"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-[15px] text-text-primary">{product.title}</span>
            <Badge variant={variant}>{STATUS_LABELS[product.status]}</Badge>
            {product.condition === 'refurbished' && product.grade && (
              <Badge variant="info">Grado {product.grade}</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-label text-text-secondary flex-wrap">
            <span>{product.installments} cuotas × {formatSoles(product.installmentAmount)}</span>
            <span>Total: {formatSoles(product.priceTotal)}</span>
            <span>Stock: {product.stock}</span>
            {product.averageRating > 0 && (
              <span className="flex items-center gap-1">
                <Star size={12} className="text-warning fill-warning" aria-hidden="true" />
                {product.averageRating.toFixed(1)} ({product.reviewCount})
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {product.status === 'published' && (
            <Link href={`/${product.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" title="Ver en el sitio">
                <Eye size={15} aria-hidden="true" />
              </Button>
            </Link>
          )}
          <Link href={`/admin/productos/${product.id}`}>
            <Button variant="ghost" size="sm" title="Editar">
              <Edit2 size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </Link>
          {product.status === 'draft' && (
            <Button variant="primary" size="sm" onClick={() => onPublish(product.id)} title="Publicar">
              <Eye size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Publicar</span>
            </Button>
          )}
          {product.status === 'published' && (
            <Button variant="ghost" size="sm" onClick={() => onArchive(product.id)} title="Archivar">
              <EyeOff size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Archivar</span>
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(product.id, product.title)}
            title="Eliminar"
          >
            <Trash2 size={15} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
