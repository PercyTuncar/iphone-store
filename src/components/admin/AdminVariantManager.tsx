'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, X, Save } from 'lucide-react';
import { createProduct, deleteVariant, getAllVariantsByMasterId, updateProduct } from '@/lib/firebase/products';
import { toast } from '@/components/ui/Toast';
import type { Product, ProductCondition, ProductGrade, StorageCapacity, BatteryHealth, ProductStatus } from '@/types/product';

interface VariantDraft {
  storage: StorageCapacity;
  color: string;
  condition: ProductCondition;
  grade: ProductGrade | '';
  batteryHealth: BatteryHealth | null;
  stock: number;
  priceTotal: number;
  slugSuffix: string;
}

interface AdminVariantManagerProps {
  masterProduct: Product | null;
  onCreated?: () => void;
}

const STORAGE_ORDER: StorageCapacity[] = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const BATTERY_OPTIONS: BatteryHealth[] = [100, 95, 90, 85, 80];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function calcInstallmentAmount(total: number, rate: number, installments: number, downPayment: number) {
  if (!total || !installments) return 0;
  const remainingAmount = downPayment > 0 ? total - downPayment : total;
  const remainingInstallments = downPayment > 0 ? installments - 1 : installments;
  if (remainingInstallments <= 0) return 0;
  if (rate === 0) return Math.round((remainingAmount / remainingInstallments) * 100) / 100;
  const factor = Math.pow(1 + rate, remainingInstallments);
  return Math.round(((remainingAmount * rate * factor) / (factor - 1)) * 100) / 100;
}

function buildVariantKey(input: Pick<VariantDraft, 'storage' | 'color' | 'grade' | 'batteryHealth' | 'condition'>) {
  return [input.storage, input.color, input.grade || '-', input.batteryHealth ?? '-', input.condition].join('|').toLowerCase();
}

function buildVariantSku(master: Product, draft: VariantDraft) {
  return [master.model, draft.storage, draft.color, draft.grade || draft.condition].join('-').replace(/\s+/g, '-').toUpperCase();
}

function buildVariantTitle(master: Product, draft: VariantDraft) {
  const grade = draft.grade ? ` Grado ${draft.grade}` : '';
  const battery = draft.batteryHealth ? ` ${draft.batteryHealth}%` : '';
  return `${master.model} ${draft.storage} ${draft.color}${grade}${battery}`.trim();
}

function draftFromProduct(product: Product): VariantDraft {
  return {
    storage: product.storage,
    color: product.color,
    condition: product.condition,
    grade: product.grade ?? '',
    batteryHealth: product.batteryHealth,
    stock: product.stock,
    priceTotal: product.priceTotal,
    slugSuffix: product.slug,
  };
}

function createVariantPayload(masterProduct: Product, draft: VariantDraft, title: string, slug: string, status: ProductStatus = 'draft') {
  return {
    title,
    slug,
    model: masterProduct.model,
    storage: draft.storage,
    color: draft.color,
    condition: draft.condition,
    grade: draft.grade || null,
    stock: draft.stock,
    sku: buildVariantSku(masterProduct, draft),
    mpn: null,
    gtin: null,
    category: masterProduct.category,
    googleProductCategoryId: masterProduct.googleProductCategoryId,
    productGroupId: masterProduct.productGroupId,
    batteryHealth: draft.batteryHealth,
    isVariant: true,
    masterProductId: masterProduct.id,
    images: masterProduct.images,
    thumbnailUrl: masterProduct.thumbnailUrl,
    priceTotal: draft.priceTotal,
    installments: masterProduct.installments,
    installmentAmount: calcInstallmentAmount(draft.priceTotal, masterProduct.interestRate, masterProduct.installments, masterProduct.downPayment),
    interestRate: masterProduct.interestRate,
    downPayment: masterProduct.downPayment,
    penaltyTier1Days: masterProduct.penaltyTier1Days,
    penaltyTier1Amount: masterProduct.penaltyTier1Amount,
    penaltyTier2Days: masterProduct.penaltyTier2Days,
    penaltyTier2Amount: masterProduct.penaltyTier2Amount,
    penaltyTier3Days: masterProduct.penaltyTier3Days,
    penaltyTier3Amount: masterProduct.penaltyTier3Amount,
    insurancePlan1Month: masterProduct.insurancePlan1Month,
    insurancePlan2Months: masterProduct.insurancePlan2Months,
    insurancePlan3Months: masterProduct.insurancePlan3Months,
    insuranceCheckoutDiscount1Month: masterProduct.insuranceCheckoutDiscount1Month,
    yapeNumber: masterProduct.yapeNumber,
    transferAccountHolder: masterProduct.transferAccountHolder,
    transferBank: masterProduct.transferBank,
    transferAccountNumber: masterProduct.transferAccountNumber,
    transferCci: masterProduct.transferCci,
    onlinePaymentLink: masterProduct.onlinePaymentLink,
    isYapeEnabled: masterProduct.isYapeEnabled,
    isOnlinePaymentEnabled: masterProduct.isOnlinePaymentEnabled,
    specs: masterProduct.specs,
    seo: {
      ...masterProduct.seo,
      metaTitle: title,
      h1: title,
      ogTitle: title,
      twitterTitle: title,
    },
    pageContent: masterProduct.pageContent,
    averageRating: 0,
    reviewCount: 0,
    status,
    publishedAt: status === 'published' ? new Date() : null,
  };
}

function VariantFields({
  draft,
  onChange,
}: {
  draft: VariantDraft;
  onChange: (key: keyof VariantDraft, value: string | number | ProductCondition | ProductGrade | BatteryHealth | null) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <label className="block">
        <span className="text-caption text-text-secondary">Capacidad</span>
        <select className="input mt-1" value={draft.storage} onChange={(e) => onChange('storage', e.target.value as StorageCapacity)}>
          {STORAGE_ORDER.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="text-caption text-text-secondary">Color</span>
        <input className="input mt-1" value={draft.color} onChange={(e) => onChange('color', e.target.value)} />
      </label>
      <label className="block">
        <span className="text-caption text-text-secondary">Condición</span>
        <select className="input mt-1" value={draft.condition} onChange={(e) => onChange('condition', e.target.value as ProductCondition)}>
          <option value="new">Nuevo</option>
          <option value="refurbished">Reacondicionado</option>
        </select>
      </label>
      <label className="block">
        <span className="text-caption text-text-secondary">Grado</span>
        <select className="input mt-1" value={draft.grade} onChange={(e) => onChange('grade', e.target.value as ProductGrade | '')}>
          <option value="">—</option>
          <option value="A+">A+</option>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>
      </label>
      <label className="block">
        <span className="text-caption text-text-secondary">Batería</span>
        <select className="input mt-1" value={draft.batteryHealth ?? ''} onChange={(e) => onChange('batteryHealth', e.target.value ? (Number(e.target.value) as BatteryHealth) : null)}>
          <option value="">—</option>
          {BATTERY_OPTIONS.map((value) => <option key={value} value={value}>{value}%</option>)}
        </select>
      </label>
      <label className="block">
        <span className="text-caption text-text-secondary">Stock</span>
        <input className="input mt-1" type="number" min="0" value={draft.stock} onChange={(e) => onChange('stock', parseInt(e.target.value, 10) || 0)} />
      </label>
      <label className="block lg:col-span-2">
        <span className="text-caption text-text-secondary">Precio total</span>
        <input className="input mt-1" type="number" min="0" step="0.01" value={draft.priceTotal} onChange={(e) => onChange('priceTotal', parseFloat(e.target.value) || 0)} />
      </label>
      <label className="block lg:col-span-2">
        <span className="text-caption text-text-secondary">Slug / sufijo</span>
        <input className="input mt-1" value={draft.slugSuffix} onChange={(e) => onChange('slugSuffix', e.target.value)} />
      </label>
    </div>
  );
}

export function AdminVariantManager({ masterProduct, onCreated }: AdminVariantManagerProps) {
  const [variants, setVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [drafts, setDrafts] = useState<VariantDraft[]>([]);
  const [editingDrafts, setEditingDrafts] = useState<Record<string, VariantDraft>>({});
  const [savingVariantId, setSavingVariantId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!masterProduct || masterProduct.isVariant) return;
    setLoading(true);
    getAllVariantsByMasterId(masterProduct.id)
      .then(setVariants)
      .catch(() => setVariants([]))
      .finally(() => setLoading(false));
  }, [masterProduct?.id, masterProduct?.isVariant]);

  useEffect(() => {
    if (!masterProduct || drafts.length) return;
    setDrafts([draftFromProduct(masterProduct)]);
  }, [masterProduct?.id, drafts.length]);

  const existingKeys = useMemo(() => new Map(variants.map((variant) => [variant.id, buildVariantKey({
    storage: variant.storage,
    color: variant.color,
    grade: variant.grade ?? '',
    batteryHealth: variant.batteryHealth,
    condition: variant.condition,
  })])), [variants]);

  if (!masterProduct || masterProduct.isVariant) return null;

  const refreshVariants = async () => {
    const refreshed = await getAllVariantsByMasterId(masterProduct.id);
    setVariants(refreshed);
  };

  const updateDraft = (index: number, key: keyof VariantDraft, value: string | number | ProductCondition | ProductGrade | BatteryHealth | null) => {
    setDrafts((prev) => prev.map((draft, i) => (i === index ? { ...draft, [key]: value } : draft)));
  };

  const updateEditingDraft = (variantId: string, key: keyof VariantDraft, value: string | number | ProductCondition | ProductGrade | BatteryHealth | null) => {
    setEditingDrafts((prev) => ({ ...prev, [variantId]: { ...prev[variantId], [key]: value } }));
  };

  const addDraft = () => {
    setDrafts((prev) => [...prev, { ...draftFromProduct(masterProduct), slugSuffix: `${masterProduct.slug}-${prev.length + 1}` }]);
  };

  const removeDraft = (index: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  };

  const startEdit = (variant: Product) => {
    setEditingDrafts((prev) => ({ ...prev, [variant.id]: draftFromProduct(variant) }));
  };

  const cancelEdit = (variantId: string) => {
    setEditingDrafts((prev) => {
      const next = { ...prev };
      delete next[variantId];
      return next;
    });
  };

  const hasDuplicate = (draft: VariantDraft, ignoreId?: string) => {
    return variants.some((variant) => variant.id !== ignoreId && buildVariantKey({
      storage: variant.storage,
      color: variant.color,
      grade: variant.grade ?? '',
      batteryHealth: variant.batteryHealth,
      condition: variant.condition,
    }) === buildVariantKey(draft));
  };

  const createVariants = async () => {
    const duplicateDraft = drafts.find((draft) => hasDuplicate(draft));
    if (duplicateDraft) {
      toast.error('Hay una variante duplicada. Cambia la combinación antes de crearla.');
      return;
    }

    setCreating(true);
    try {
      for (const draft of drafts) {
        const title = buildVariantTitle(masterProduct, draft);
        const slug = slugify(draft.slugSuffix || title);
        await createProduct(createVariantPayload(masterProduct, draft, title, slug) as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
      }
      toast.success('Variantes creadas correctamente');
      onCreated?.();
      await refreshVariants();
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron crear las variantes');
    } finally {
      setCreating(false);
    }
  };

  const saveVariant = async (variant: Product) => {
    const draft = editingDrafts[variant.id];
    if (!draft) return;
    if (hasDuplicate(draft, variant.id)) {
      toast.error('Esa combinación ya existe en otra variante.');
      return;
    }

    setSavingVariantId(variant.id);
    try {
      const title = buildVariantTitle(masterProduct, draft);
      const slug = slugify(draft.slugSuffix || title);
      await updateProduct(variant.id, {
        ...createVariantPayload(masterProduct, draft, title, slug, variant.status),
        averageRating: variant.averageRating,
        reviewCount: variant.reviewCount,
        publishedAt: variant.publishedAt ?? null,
      } as Partial<Omit<Product, 'id' | 'createdAt'>>);
      toast.success('Variante actualizada');
      cancelEdit(variant.id);
      await refreshVariants();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo guardar la variante');
    } finally {
      setSavingVariantId(null);
    }
  };

  const toggleVariantStatus = async (variant: Product) => {
    const nextStatus: ProductStatus = variant.status === 'published' ? 'draft' : 'published';
    setSavingVariantId(variant.id);
    try {
      await updateProduct(variant.id, {
        status: nextStatus,
        publishedAt: nextStatus === 'published' ? new Date() : null,
      } as Partial<Omit<Product, 'id' | 'createdAt'>>);
      toast.success(nextStatus === 'published' ? 'Variante publicada' : 'Variante pasada a borrador');
      await refreshVariants();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cambiar el estado de la variante');
    } finally {
      setSavingVariantId(null);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (pendingDeleteId !== variantId) {
      setPendingDeleteId(variantId);
      toast.info('Presiona eliminar otra vez para confirmar.');
      return;
    }

    try {
      await deleteVariant(variantId);
      setVariants((prev) => prev.filter((variant) => variant.id !== variantId));
      toast.success('Variante eliminada');
      cancelEdit(variantId);
      setPendingDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar la variante');
    }
  };

  return (
    <section className="card p-5 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-[18px] font-semibold">Variantes del producto maestro</h3>
          <p className="text-body text-text-secondary text-[15px]">
            Crea, revisa, edita, publica y elimina combinaciones hijas de este modelo.
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={addDraft}>
          <Plus size={16} /> Agregar variante
        </button>
      </div>

      <div className="grid gap-4">
        {drafts.map((draft, index) => {
          const duplicate = [...existingKeys.values()].includes(buildVariantKey(draft));
          return (
            <div key={`${draft.slugSuffix}-${index}`} className={`rounded-[16px] border p-4 space-y-4 ${duplicate ? 'border-danger' : 'border-border'}`}>
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold">Nueva variante {index + 1}</h4>
                <button type="button" className="text-danger text-label flex items-center gap-1" onClick={() => removeDraft(index)}>
                  <Trash2 size={14} /> Eliminar borrador
                </button>
              </div>
              <VariantFields draft={draft} onChange={(key, value) => updateDraft(index, key, value)} />
              {duplicate && <p className="text-caption text-danger">Esta combinación ya existe en una variante guardada.</p>}
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-caption text-text-secondary">
            Variantes guardadas: {loading ? 'cargando…' : variants.length}
          </p>
          <button type="button" className="btn btn-primary" onClick={createVariants} disabled={creating || !drafts.length}>
            <Plus size={16} /> {creating ? 'Creando…' : 'Crear variantes'}
          </button>
        </div>

        <div className="grid gap-3">
          {variants.map((variant) => {
            const editing = Boolean(editingDrafts[variant.id]);
            const currentDraft = editingDrafts[variant.id] ?? draftFromProduct(variant);
            return (
              <div key={variant.id} className="rounded-[14px] border border-border px-4 py-3 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-medium">{variant.title}</p>
                    <p className="text-caption text-text-secondary">
                      {variant.storage} · {variant.color} · Stock {variant.stock} · {variant.status} · cuota S/ {variant.installmentAmount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button type="button" className="btn btn-secondary" disabled={savingVariantId === variant.id} onClick={() => toggleVariantStatus(variant)}>
                      {variant.status === 'published' ? 'Pasar a borrador' : 'Publicar'}
                    </button>
                    {editing ? (
                      <>
                        <button type="button" className="btn btn-secondary" onClick={() => cancelEdit(variant.id)}>
                          <X size={14} /> Cancelar
                        </button>
                        <button type="button" className="btn btn-primary" disabled={savingVariantId === variant.id} onClick={() => saveVariant(variant)}>
                          <Save size={14} /> {savingVariantId === variant.id ? 'Guardando…' : 'Guardar'}
                        </button>
                      </>
                    ) : (
                      <button type="button" className="btn btn-secondary" onClick={() => startEdit(variant)}>
                        <Pencil size={14} /> Editar
                      </button>
                    )}
                    <button type="button" className="text-danger text-label flex items-center gap-1" onClick={() => handleDeleteVariant(variant.id)}>
                      <Trash2 size={14} /> {pendingDeleteId === variant.id ? 'Confirmar' : 'Eliminar'}
                    </button>
                  </div>
                </div>

                {editing && (
                  <div className="pt-2 border-t border-border">
                    <VariantFields draft={currentDraft} onChange={(key, value) => updateEditingDraft(variant.id, key, value)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
