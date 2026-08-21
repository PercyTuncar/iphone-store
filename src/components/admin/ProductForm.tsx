'use client';

/**
 * ProductForm — Complete product creation/editing form.
 * 8 sections organized in tabs:
 * 1. Información Básica
 * 2. Imágenes
 * 3. Precios y Cuotas
 * 4. Penalidades y Seguros
 * 5. Métodos de Pago
 * 6. Especificaciones Técnicas
 * 7. Contenido de la Página
 * 8. SEO y Visibilidad
 */

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Info, Image as ImageIcon, DollarSign, ShieldAlert, CreditCard,
  Cpu, FileText, Search, Plus, Trash2, GripVertical, Upload,
  Check, Save, Globe, ChevronLeft, ChevronRight, Download,
} from 'lucide-react';
import { clsx } from 'clsx';

import { serverTimestamp } from 'firebase/firestore';
import { createProduct, updateProduct } from '@/lib/firebase/products';
import { uploadProductImage } from '@/lib/firebase/storage';
import { IPHONE_MODELS, STORAGE_OPTIONS } from '@/lib/constants/iphone-models';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import type { Product, ProductCondition, ProductGrade, StorageCapacity, BatteryHealth } from '@/types/product';

// ─── Types ──────────────────────────────────────────────────
type TabId = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

interface ImageItem {
  url: string;
  file?: File;
  uploading?: boolean;
  tempId?: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FormState {
  // Section 1 – Basic Info
  title: string;
  slug: string;
  model: string;
  storage: StorageCapacity;
  color: string;
  condition: ProductCondition;
  grade: ProductGrade | '';
  stock: number;
  // Section 1 – SEO/Schema fields (nuevos)
  sku: string;
  mpn: string;
  gtin: string;
  category: string;
  googleProductCategoryId: string;
  productGroupId: string;
  // Section 2 – Images (handled separately)
  // Section 3 – Pricing
  priceTotal: number;
  installments: number;
  interestRate: number;
  downPayment: number;
  // Section 4 – Penalties & Insurance
  penaltyTier1Days: number;
  penaltyTier1Amount: number;
  penaltyTier2Days: number;
  penaltyTier2Amount: number;
  penaltyTier3Days: number;
  penaltyTier3Amount: number;
  insurancePlan1Month: number;
  insurancePlan2Months: number;
  insurancePlan3Months: number;
  insuranceCheckoutDiscount1Month: number;
  // Section 5 – Payment methods
  yapeNumber: string;
  transferAccountHolder: string;
  transferBank: string;
  transferAccountNumber: string;
  transferCci: string;
  onlinePaymentLink: string;
  isYapeEnabled: boolean;
  isOnlinePaymentEnabled: boolean;
  // Section 6 – Specs
  specDisplay: string;
  specChip: string;
  specCamera: string;
  specBattery: string;
  specConnectivity: string;
  specOs: string;
  // Section 7 – Page Content
  heroHeadline: string;
  heroSubheadline: string;
  howItWorks: string;
  faqItems: FaqItem[];
  // Section 8 – SEO
  metaTitle: string;
  metaDescription: string;
  h1: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  schemaOverride: string;
}

const DEFAULT_STATE: FormState = {
  title: '', slug: '', model: 'iPhone 15 Pro Max', storage: '256GB',
  color: '', condition: 'new', grade: '', stock: 1,
  sku: '', mpn: '', gtin: '', category: 'Celulares y Smartphones > iPhone',
  googleProductCategoryId: '267', productGroupId: '',
  priceTotal: 0, installments: 12, interestRate: 5, downPayment: 0,
  penaltyTier1Days: 5, penaltyTier1Amount: 59,
  penaltyTier2Days: 10, penaltyTier2Amount: 79,
  penaltyTier3Days: 15, penaltyTier3Amount: 99,
  insurancePlan1Month: 49, insurancePlan2Months: 89,
  insurancePlan3Months: 99, insuranceCheckoutDiscount1Month: 29,
  yapeNumber: '', transferAccountHolder: '', transferBank: '',
  transferAccountNumber: '', transferCci: '', onlinePaymentLink: '',
  isYapeEnabled: true, isOnlinePaymentEnabled: false,
  specDisplay: '', specChip: '', specCamera: '', specBattery: '',
  specConnectivity: '', specOs: '',
  heroHeadline: '', heroSubheadline: '', howItWorks: '', faqItems: [],
  metaTitle: '', metaDescription: '', h1: '', canonicalUrl: '',
  ogTitle: '', ogDescription: '', ogImage: '',
  twitterTitle: '', twitterDescription: '', schemaOverride: '',
};

// ─── Helpers ────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function calcInstallmentAmount(
  total: number,
  rate: number,
  count: number,
  downPayment: number
): number {
  if (!total || !count) return 0;

  // Si hay enganche, ese es la primera cuota
  // Entonces restamos el enganche del total y dividimos entre las cuotas restantes
  const remainingAmount = downPayment > 0 ? total - downPayment : total;
  const remainingInstallments = downPayment > 0 ? count - 1 : count;

  if (remainingInstallments <= 0) return 0;

  // Si no hay interés, división simple
  if (rate === 0) {
    return Math.round((remainingAmount / remainingInstallments) * 100) / 100;
  }

  // Si hay interés, usar fórmula de amortización francesa (Sistema Francés)
  // Cuota = P * [i * (1 + i)^n] / [(1 + i)^n - 1]
  // Donde:
  // P = Principal (monto a financiar)
  // i = Tasa de interés mensual (en decimal, ej: 10% = 0.10)
  // n = Número de cuotas

  const i = rate / 100; // Convertir porcentaje a decimal
  const n = remainingInstallments;
  const P = remainingAmount;

  // Calcular (1 + i)^n
  const onePlusIToN = Math.pow(1 + i, n);

  // Aplicar fórmula: P * [i * (1 + i)^n] / [(1 + i)^n - 1]
  const cuota = P * (i * onePlusIToN) / (onePlusIToN - 1);

  // Redondear a 2 decimales (centavos)
  return Math.round(cuota * 100) / 100;
}

// ─── Props ──────────────────────────────────────────────────
interface ProductFormProps {
  initialProduct?: Product | null;
}

// ─── Tab Config ─────────────────────────────────────────────
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: '1', label: 'Info Básica',   icon: Info        },
  { id: '2', label: 'Imágenes',      icon: ImageIcon   },
  { id: '3', label: 'Precios',       icon: DollarSign  },
  { id: '4', label: 'Penalidades',   icon: ShieldAlert },
  { id: '5', label: 'Pagos',         icon: CreditCard  },
  { id: '6', label: 'Specs',         icon: Cpu         },
  { id: '7', label: 'Contenido',     icon: FileText    },
  { id: '8', label: 'SEO',           icon: Search      },
];

// ─── Main Component ─────────────────────────────────────────
export function ProductForm({ initialProduct }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialProduct;

  // Form state
  const [form, setForm] = useState<FormState>(() => {
    if (!initialProduct) return DEFAULT_STATE;
    return {
      title:          initialProduct.title,
      slug:           initialProduct.slug,
      model:          initialProduct.model,
      storage:        initialProduct.storage,
      color:          initialProduct.color,
      condition:      initialProduct.condition,
      grade:          initialProduct.grade ?? '',
      stock:          initialProduct.stock,
      // Nuevos campos SEO/Schema (con fallbacks)
      sku:            (initialProduct as any).sku || initialProduct.slug || '',
      mpn:            (initialProduct as any).mpn || '',
      gtin:           (initialProduct as any).gtin || '',
      category:       (initialProduct as any).category || 'Celulares y Smartphones > iPhone',
      googleProductCategoryId: (initialProduct as any).googleProductCategoryId || '267',
      productGroupId: (initialProduct as any).productGroupId || slugify(initialProduct.model),
      priceTotal:     initialProduct.priceTotal,
      installments:   initialProduct.installments,
      interestRate:   initialProduct.interestRate * 100,
      downPayment:    initialProduct.downPayment,
      penaltyTier1Days:   initialProduct.penaltyTier1Days,
      penaltyTier1Amount: initialProduct.penaltyTier1Amount,
      penaltyTier2Days:   initialProduct.penaltyTier2Days,
      penaltyTier2Amount: initialProduct.penaltyTier2Amount,
      penaltyTier3Days:   initialProduct.penaltyTier3Days,
      penaltyTier3Amount: initialProduct.penaltyTier3Amount,
      insurancePlan1Month: initialProduct.insurancePlan1Month,
      insurancePlan2Months: initialProduct.insurancePlan2Months,
      insurancePlan3Months: initialProduct.insurancePlan3Months,
      insuranceCheckoutDiscount1Month: initialProduct.insuranceCheckoutDiscount1Month,
      yapeNumber:       initialProduct.yapeNumber,
      transferAccountHolder: initialProduct.transferAccountHolder,
      transferBank:    initialProduct.transferBank,
      transferAccountNumber: initialProduct.transferAccountNumber,
      transferCci:     initialProduct.transferCci,
      onlinePaymentLink: initialProduct.onlinePaymentLink,
      isYapeEnabled:   initialProduct.isYapeEnabled ?? true,
      isOnlinePaymentEnabled: initialProduct.isOnlinePaymentEnabled ?? false,
      specDisplay: initialProduct.specs?.display  ?? '',
      specChip:    initialProduct.specs?.chip     ?? '',
      specCamera:  initialProduct.specs?.camera   ?? '',
      specBattery: initialProduct.specs?.battery  ?? '',
      specConnectivity: initialProduct.specs?.connectivity ?? '',
      specOs:      initialProduct.specs?.os       ?? '',
      heroHeadline:   initialProduct.pageContent?.heroHeadline    ?? '',
      heroSubheadline: initialProduct.pageContent?.heroSubheadline ?? '',
      howItWorks:     initialProduct.pageContent?.howItWorks      ?? '',
      faqItems: (initialProduct.pageContent?.faqItems ?? []).map((f, i) => ({
        id: String(i), question: f.question, answer: f.answer,
      })),
      metaTitle:        initialProduct.seo?.metaTitle        ?? '',
      metaDescription:  initialProduct.seo?.metaDescription  ?? '',
      h1:               initialProduct.seo?.h1               ?? '',
      canonicalUrl:     initialProduct.seo?.canonicalUrl     ?? '',
      ogTitle:          initialProduct.seo?.ogTitle          ?? '',
      ogDescription:    initialProduct.seo?.ogDescription    ?? '',
      ogImage:          initialProduct.seo?.ogImage          ?? '',
      twitterTitle:     initialProduct.seo?.twitterTitle     ?? '',
      twitterDescription: initialProduct.seo?.twitterDescription ?? '',
      schemaOverride:   initialProduct.seo?.schemaOverride   ?? '',
    };
  });

  const [images, setImages] = useState<ImageItem[]>(() =>
    (initialProduct?.images ?? []).map(url => ({ url }))
  );
  const [activeTab, setActiveTab]   = useState<TabId>('1');
  const [saving, setSaving]         = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [productId, setProductId]   = useState<string>(initialProduct?.id ?? '');

  // Auto-save timer
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-slug from title
  const setField = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'title' && typeof val === 'string') {
        next.slug = slugify(val);
        // Auto-generar SKU desde slug
        next.sku = next.slug;
        if (!next.metaTitle)  next.metaTitle  = val as string;
        if (!next.h1)         next.h1         = val as string;
        if (!next.ogTitle)    next.ogTitle    = val as string;
        if (!next.twitterTitle) next.twitterTitle = val as string;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.iphoneencuotas.com';
        next.canonicalUrl = `${siteUrl}/iphone/${next.slug}`;
      }
      // Auto-generar productGroupId desde model
      if (key === 'model' && typeof val === 'string') {
        next.productGroupId = slugify(val);
      }
      return next;
    });
    // Queue auto-save (debounce 30s)
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => handleAutoSave(), 30000);
  }, []); // eslint-disable-line

  const installmentAmount = calcInstallmentAmount(
    form.priceTotal,
    form.interestRate,
    form.installments,
    form.downPayment
  );

  // ── Auto-save ──
  const handleAutoSave = useCallback(async () => {
    if (!form.title) return;
    try {
      const data = buildProductData(form, images, 'draft');
      if (productId) {
        await updateProduct(productId, data);
      } else {
        const id = await createProduct({
          ...data,
          status: 'draft',
          averageRating: 0,
          reviewCount: 0,
          publishedAt: null,
        });
        setProductId(id);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch { setSaveStatus('error'); }
  }, [form, images, productId]); // eslint-disable-line

  // ── Submit ──
  const handleSubmit = async (status: 'draft' | 'published') => {
    // Validación básica (siempre requerida)
    if (!form.title.trim()) { toast.error('El título es obligatorio.'); setActiveTab('1'); return; }
    if (!form.slug.trim())  { toast.error('El slug es obligatorio.'); setActiveTab('1'); return; }
    if (form.priceTotal <= 0) { toast.error('El precio total debe ser mayor a 0.'); setActiveTab('3'); return; }

    // Validación completa SOLO al publicar (Bug #4 fix)
    if (status === 'published') {
      // Validar imágenes (mínimo 3, todas propias)
      const validImages = images.filter(img =>
        img.url && (
          img.url.includes('firebasestorage.googleapis.com') ||
          img.url.includes('storage.googleapis.com')
        )
      );

      if (validImages.length < 3) {
        toast.error('Debes subir al menos 3 imágenes propias (alojadas en Firebase Storage) antes de publicar.');
        setActiveTab('2');
        return;
      }

      // Validar URLs externas (Apple)
      const hasExternalImages = images.some(img =>
        img.url && (img.url.includes('apple.com') || img.url.includes('cdsassets.apple.com'))
      );
      if (hasExternalImages) {
        toast.error('No puedes publicar con imágenes de Apple. Sube imágenes propias a Firebase Storage.');
        setActiveTab('2');
        return;
      }

      // Validar campos SEO obligatorios
      if (!form.metaTitle.trim()) {
        toast.error('El Meta Title es obligatorio para publicar.');
        setActiveTab('8');
        return;
      }
      if (form.metaTitle.length > 60) {
        toast.error('El Meta Title debe tener máximo 60 caracteres.');
        setActiveTab('8');
        return;
      }
      if (!form.metaDescription.trim()) {
        toast.error('La Meta Description es obligatoria para publicar.');
        setActiveTab('8');
        return;
      }
      if (form.metaDescription.length > 160) {
        toast.error('La Meta Description debe tener máximo 160 caracteres.');
        setActiveTab('8');
        return;
      }
      if (!form.h1.trim()) {
        toast.error('El H1 es obligatorio para publicar.');
        setActiveTab('8');
        return;
      }
      if (!form.canonicalUrl.trim()) {
        toast.error('La Canonical URL es obligatoria para publicar.');
        setActiveTab('8');
        return;
      }
      if (!form.ogImage.trim()) {
        toast.error('La Open Graph Image es obligatoria para publicar.');
        setActiveTab('8');
        return;
      }

      // Validar FAQ (mínimo 2 preguntas)
      if (form.faqItems.length < 2) {
        toast.error('Debes agregar al menos 2 preguntas frecuentes antes de publicar.');
        setActiveTab('7');
        return;
      }
    }

    setSaving(true);
    try {
      // Upload pending images
      const uploadedImages = await uploadPendingImages(images, productId || 'temp');
      setImages(uploadedImages);

      const data = buildProductData(form, uploadedImages, status);

      if (isEditing && productId) {
        // Al editar, solo actualizar publishedAt si cambiamos de draft a published
        if (initialProduct && initialProduct.status !== 'published' && status === 'published') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await updateProduct(productId, { ...data, publishedAt: serverTimestamp() as any });
        } else {
          await updateProduct(productId, { ...data });
        }
        toast.success(status === 'published' ? 'Producto publicado.' : 'Cambios guardados.');
      } else {
        // Al crear, siempre incluir publishedAt si se publica directamente
        const newProductData = {
          ...data,
          status,
          averageRating: 0,
          reviewCount: 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          publishedAt: status === 'published' ? (serverTimestamp() as any) : null,
        };
        const id = await createProduct(newProductData);
        setProductId(id);
        toast.success(status === 'published' ? 'Producto publicado.' : 'Guardado como borrador.');
      }
      router.push('/admin/productos');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-section-title mb-0.5">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
          {form.slug && (
            <p className="text-label text-text-secondary">/{form.slug}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-label text-success">
              <Check size={14} aria-hidden="true" /> Auto-guardado
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => handleSubmit('draft')} disabled={saving}>
            <Save size={15} aria-hidden="true" />
            Guardar borrador
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleSubmit('published')} disabled={saving} loading={saving}>
            <Globe size={15} aria-hidden="true" />
            Publicar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-label border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-accent text-accent font-semibold'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                )}
              >
                <Icon size={14} aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab panels */}
      <div className="card p-6">
        {activeTab === '1' && (
          <Section1BasicInfo form={form} setField={setField} />
        )}
        {activeTab === '2' && (
          <Section2Images images={images} setImages={setImages} productId={productId} />
        )}
        {activeTab === '3' && (
          <Section3Pricing
            form={form} setField={setField}
            installmentAmount={installmentAmount}
          />
        )}
        {activeTab === '4' && (
          <Section4Penalties form={form} setField={setField} />
        )}
        {activeTab === '5' && (
          <Section5Payments form={form} setField={setField} />
        )}
        {activeTab === '6' && (
          <Section6Specs form={form} setField={setField} />
        )}
        {activeTab === '7' && (
          <Section7Content form={form} setField={setField} />
        )}
        {activeTab === '8' && (
          <Section8Seo form={form} setField={setField} />
        )}
      </div>

      {/* Bottom save buttons */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="ghost" onClick={() => handleSubmit('draft')} disabled={saving}>
          <Save size={16} aria-hidden="true" /> Guardar borrador
        </Button>
        <Button variant="primary" onClick={() => handleSubmit('published')} disabled={saving} loading={saving}>
          <Globe size={16} aria-hidden="true" /> Publicar ahora
        </Button>
      </div>
    </div>
  );
}

// ─── Build product data from form ───────────────────────────
function buildProductData(
  form: FormState,
  images: ImageItem[],
  status: 'draft' | 'published'
) {
  const imageUrls = images.map(i => i.url).filter(Boolean);
  return {
    slug:      form.slug,
    status,
    title:     form.title,
    model:     form.model,
    storage:   form.storage as StorageCapacity,
    color:     form.color,
    condition: form.condition,
    grade:     form.grade || null,
    stock:     form.stock,
    // Nuevos campos SEO/Schema
    sku:       form.sku,
    mpn:       form.mpn || null,
    gtin:      form.gtin || null,
    category:  form.category,
    googleProductCategoryId: form.googleProductCategoryId,
    productGroupId: form.productGroupId,
    // NUEVO: Campos de sistema de variantes (Fase 1)
    batteryHealth: (form.condition === 'new' ? null : 90) as BatteryHealth | null, // null para nuevos, 90 para reacondicionados
    isVariant: false, // Por ahora todos son productos tradicionales (Fase 2 permitirá crear variantes)
    masterProductId: null, // null = no es variante de nadie
    images:    imageUrls,
    thumbnailUrl: imageUrls[0] ?? '',
    priceTotal:   form.priceTotal,
    installments: form.installments,
    installmentAmount: calcInstallmentAmount(
      form.priceTotal,
      form.interestRate,
      form.installments,
      form.downPayment
    ),
    interestRate: form.interestRate / 100,
    downPayment:  form.downPayment,
    penaltyTier1Days:   form.penaltyTier1Days,
    penaltyTier1Amount: form.penaltyTier1Amount,
    penaltyTier2Days:   form.penaltyTier2Days,
    penaltyTier2Amount: form.penaltyTier2Amount,
    penaltyTier3Days:   form.penaltyTier3Days,
    penaltyTier3Amount: form.penaltyTier3Amount,
    insurancePlan1Month: form.insurancePlan1Month,
    insurancePlan2Months: form.insurancePlan2Months,
    insurancePlan3Months: form.insurancePlan3Months,
    insuranceCheckoutDiscount1Month: form.insuranceCheckoutDiscount1Month,
    yapeNumber: form.yapeNumber,
    transferAccountHolder: form.transferAccountHolder,
    transferBank: form.transferBank,
    transferAccountNumber: form.transferAccountNumber,
    transferCci: form.transferCci,
    onlinePaymentLink: form.onlinePaymentLink,
    isYapeEnabled: form.isYapeEnabled,
    isOnlinePaymentEnabled: form.isOnlinePaymentEnabled,
    specs: {
      display: form.specDisplay,
      chip:    form.specChip,
      camera:  form.specCamera,
      battery: form.specBattery,
      connectivity: form.specConnectivity,
      os:      form.specOs,
    },
    seo: {
      metaTitle:       form.metaTitle,
      metaDescription: form.metaDescription,
      h1:              form.h1,
      canonicalUrl:    form.canonicalUrl,
      ogTitle:         form.ogTitle,
      ogDescription:   form.ogDescription,
      ogImage:         form.ogImage || imageUrls[0] || '',
      twitterTitle:    form.twitterTitle,
      twitterDescription: form.twitterDescription,
      schemaOverride:  form.schemaOverride || null,
    },
    pageContent: {
      heroHeadline:    form.heroHeadline,
      heroSubheadline: form.heroSubheadline,
      howItWorks:      form.howItWorks,
      faqItems: form.faqItems.map(f => ({ question: f.question, answer: f.answer })),
    },
    // NO incluir publishedAt aquí - se maneja en handleSubmit para no sobrescribir fecha original
  };
}

// ─── Upload pending images ───────────────────────────────────
async function uploadPendingImages(images: ImageItem[], productId: string): Promise<ImageItem[]> {
  const result: ImageItem[] = [];
  for (const img of images) {
    if (img.file && !img.uploading) {
      try {
        const url = await uploadProductImage(productId, img.file);
        result.push({ url });
      } catch {
        result.push(img); // keep original on error
      }
    } else {
      result.push({ url: img.url });
    }
  }
  return result;
}

// ─── Shared UI helpers ───────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-label font-medium text-text-primary">{children}</label>;
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
      <Icon size={18} className="text-accent" aria-hidden="true" />
      <h2 className="font-semibold text-[17px]">{title}</h2>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 6 — Especificaciones Técnicas
// ═══════════════════════════════════════════════════════════
function Section6Specs({
  form, setField,
}: { form: FormState; setField: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  const specFields = [
    { key: 'specDisplay',      label: 'Pantalla',       placeholder: 'Super Retina XDR OLED, 6.7"' },
    { key: 'specChip',         label: 'Chip',           placeholder: 'Apple A17 Pro' },
    { key: 'specCamera',       label: 'Sistema de cámara', placeholder: 'Triple cámara 48 MP' },
    { key: 'specBattery',      label: 'Batería',        placeholder: 'Hasta 29h de video' },
    { key: 'specConnectivity', label: 'Conectividad',   placeholder: '5G, Wi-Fi 6E, USB-C' },
    { key: 'specOs',           label: 'Sistema Operativo', placeholder: 'iOS 17' },
  ] as const;

  return (
    <div className="space-y-5">
      <SectionHeader title="Especificaciones Técnicas" icon={Cpu} />
      <div className="grid sm:grid-cols-2 gap-4">
        {specFields.map(s => (
          <div key={s.key}>
            <Label>{s.label}</Label>
            <textarea className="input mt-1 resize-none" rows={2}
              value={(form as never)[s.key]}
              onChange={e => setField(s.key, e.target.value)}
              placeholder={s.placeholder} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 7 — Contenido de la Página
// ═══════════════════════════════════════════════════════════
function Section7Content({
  form, setField,
}: { form: FormState; setField: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  const addFaq = () => {
    setField('faqItems', [
      ...form.faqItems,
      { id: Date.now().toString(), question: '', answer: '' },
    ]);
  };
  const updateFaq = (id: string, field: 'question' | 'answer', val: string) => {
    setField('faqItems', form.faqItems.map(f => f.id === id ? { ...f, [field]: val } : f));
  };
  const removeFaq = (id: string) => {
    setField('faqItems', form.faqItems.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Contenido de la Página" icon={FileText} />
      <div className="space-y-4">
        <div>
          <Label>Título principal del Hero</Label>
          <input className="input mt-1" value={form.heroHeadline}
            onChange={e => setField('heroHeadline', e.target.value)}
            placeholder="Tu iPhone 15 Pro Max en cuotas, hoy" />
        </div>
        <div>
          <Label>Subtítulo del Hero</Label>
          <textarea className="input mt-1 resize-none" rows={2}
            value={form.heroSubheadline}
            onChange={e => setField('heroSubheadline', e.target.value)}
            placeholder="Paga en cómodas cuotas con Yape o transferencia…" />
        </div>
        <div>
          <Label>Bloque ¿Cómo funciona? (HTML básico)</Label>
          <textarea className="input mt-1 resize-none font-mono text-[14px]" rows={5}
            value={form.howItWorks}
            onChange={e => setField('howItWorks', e.target.value)}
            placeholder="<p>1. Reserva tu iPhone…</p>" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-label font-semibold">Preguntas Frecuentes (FAQ)</p>
          <Button variant="ghost" size="sm" onClick={addFaq}>
            <Plus size={15} aria-hidden="true" /> Agregar pregunta
          </Button>
        </div>
        <div className="space-y-3">
          {form.faqItems.map((faq, idx) => (
            <div key={faq.id} className="rounded-ios border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-caption text-text-secondary">Pregunta {idx + 1}</span>
                <button onClick={() => removeFaq(faq.id)}
                  className="text-danger hover:opacity-70 p-1" title="Eliminar pregunta">
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
              <div>
                <Label>Pregunta</Label>
                <input className="input mt-1" value={faq.question}
                  onChange={e => updateFaq(faq.id, 'question', e.target.value)}
                  placeholder="¿Qué pasa si me atraso en una cuota?" />
              </div>
              <div>
                <Label>Respuesta</Label>
                <textarea className="input mt-1 resize-none" rows={3}
                  value={faq.answer}
                  onChange={e => updateFaq(faq.id, 'answer', e.target.value)}
                  placeholder="Se aplica una penalidad de…" />
              </div>
            </div>
          ))}
          {form.faqItems.length === 0 && (
            <p className="text-caption text-text-secondary text-center py-4 border border-dashed border-border rounded-ios">
              Sin preguntas aún. Agrega las más frecuentes de tus clientes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 8 — SEO y Visibilidad
// ═══════════════════════════════════════════════════════════
function Section8Seo({
  form, setField,
}: { form: FormState; setField: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  const metaTitleLen = form.metaTitle.length;
  const metaDescLen  = form.metaDescription.length;

  return (
    <div className="space-y-6">
      <SectionHeader title="SEO y Visibilidad" icon={Search} />

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <Label>Meta Title *</Label>
            <span className={`text-caption ${metaTitleLen > 60 ? 'text-danger' : 'text-text-secondary'}`}>
              {metaTitleLen}/60
            </span>
          </div>
          <input className={`input ${metaTitleLen > 60 ? 'input-error' : ''}`}
            value={form.metaTitle}
            onChange={e => setField('metaTitle', e.target.value)}
            placeholder="Comprar iPhone 15 Pro Max en Cuotas | iPhone en Cuotas" />
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <Label>Meta Description *</Label>
            <span className={`text-caption ${metaDescLen > 160 ? 'text-danger' : 'text-text-secondary'}`}>
              {metaDescLen}/160
            </span>
          </div>
          <textarea className={`input mt-0 resize-none ${metaDescLen > 160 ? 'input-error' : ''}`}
            rows={3}
            value={form.metaDescription}
            onChange={e => setField('metaDescription', e.target.value)}
            placeholder="Compra el iPhone 15 Pro Max en 12 cuotas sin tarjeta. Paga con Yape…" />
        </div>

        <div className="sm:col-span-2">
          <Label>H1 de la página *</Label>
          <input className="input mt-1" value={form.h1}
            onChange={e => setField('h1', e.target.value)}
            placeholder="Comprar iPhone 15 Pro Max en Cuotas Sin Tarjeta" />
        </div>

        <div>
          <Label>URL Canónica</Label>
          <input className="input mt-1 font-mono text-[14px]" value={form.canonicalUrl}
            onChange={e => setField('canonicalUrl', e.target.value)}
            placeholder="https://iphoneencuotas.com/iphone/slug" />
        </div>

        <div>
          <Label>Open Graph Image URL</Label>
          <input className="input mt-1" value={form.ogImage}
            onChange={e => setField('ogImage', e.target.value)}
            placeholder="https://…/og-image.jpg (1200×630)" />
        </div>

        <div>
          <Label>OG Title</Label>
          <input className="input mt-1" value={form.ogTitle}
            onChange={e => setField('ogTitle', e.target.value)} />
        </div>

        <div>
          <Label>OG Description</Label>
          <input className="input mt-1" value={form.ogDescription}
            onChange={e => setField('ogDescription', e.target.value)} />
        </div>

        <div>
          <Label>Twitter Card Title</Label>
          <input className="input mt-1" value={form.twitterTitle}
            onChange={e => setField('twitterTitle', e.target.value)} />
        </div>

        <div>
          <Label>Twitter Card Description</Label>
          <input className="input mt-1" value={form.twitterDescription}
            onChange={e => setField('twitterDescription', e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <Label>Schema JSON-LD personalizado (opcional — sobreescribe el auto-generado)</Label>
          <textarea className="input mt-1 resize-none font-mono text-[13px]" rows={6}
            value={form.schemaOverride}
            onChange={e => setField('schemaOverride', e.target.value)}
            placeholder='{"@context":"https://schema.org","@type":"Product",...}' />
        </div>
      </div>

      {/* Google preview */}
      {(form.metaTitle || form.slug) && (
        <div className="rounded-ios border border-border p-4 bg-bg-secondary">
          <p className="text-caption text-text-secondary mb-3 font-semibold uppercase tracking-wide">
            Vista previa en Google
          </p>
          <p className="text-[12px] text-[#006621] mb-0.5">
            iphoneencuotas.com › iphone › {form.slug || 'slug'}
          </p>
          <p className={`text-[18px] text-[#1a0dab] leading-tight mb-1 ${metaTitleLen > 60 ? 'text-danger' : ''}`}>
            {form.metaTitle || 'Título del producto'}
          </p>
          <p className="text-[14px] text-[#545454] leading-snug line-clamp-2">
            {form.metaDescription || 'Descripción del producto…'}
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 4 — Penalidades y Seguros
// ═══════════════════════════════════════════════════════════
function Section4Penalties({
  form, setField,
}: { form: FormState; setField: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Penalidades y Seguros" icon={ShieldAlert} />

      {/* Penalty tiers */}
      <div>
        <p className="text-label font-semibold mb-3">Niveles de penalidad por mora</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-text-secondary font-medium">Nivel</th>
                <th className="text-left py-2 pr-4 text-text-secondary font-medium">Días de atraso</th>
                <th className="text-left py-2 text-text-secondary font-medium">Penalidad adicional (S/)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {([
                { label: 'Nivel 1', daysKey: 'penaltyTier1Days', amtKey: 'penaltyTier1Amount' },
                { label: 'Nivel 2', daysKey: 'penaltyTier2Days', amtKey: 'penaltyTier2Amount' },
                { label: 'Nivel 3', daysKey: 'penaltyTier3Days', amtKey: 'penaltyTier3Amount' },
              ] as const).map(tier => (
                <tr key={tier.label}>
                  <td className="py-2.5 pr-4 font-medium text-text-primary">{tier.label}</td>
                  <td className="py-2.5 pr-4">
                    <input type="number" min="1" className="input py-1.5 w-24"
                      value={(form as never)[tier.daysKey]}
                      onChange={e => setField(tier.daysKey, parseInt(e.target.value) || 0)} />
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-text-secondary">S/</span>
                      <input type="number" min="0" className="input py-1.5 w-24"
                        value={(form as never)[tier.amtKey]}
                        onChange={e => setField(tier.amtKey, parseFloat(e.target.value) || 0)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-caption text-text-secondary mt-2">
          Más de {form.penaltyTier3Days} días → cancelación automática del pedido.
        </p>
      </div>

      {/* Insurance plans */}
      <div>
        <p className="text-label font-semibold mb-3">Planes de Seguro de Prórroga</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {([
            { label: '1 mes de prórroga (precio estándar)', key: 'insurancePlan1Month' },
            { label: '2 meses de prórroga', key: 'insurancePlan2Months' },
            { label: '3 meses de prórroga', key: 'insurancePlan3Months' },
            { label: '1 mes — precio especial checkout', key: 'insuranceCheckoutDiscount1Month' },
          ] as const).map(plan => (
            <div key={plan.key}>
              <Label>{plan.label}</Label>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-text-secondary">S/</span>
                <input type="number" min="0" className="input"
                  value={(form as never)[plan.key]}
                  onChange={e => setField(plan.key, parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-caption text-text-secondary mt-2">
          El precio especial de checkout solo está disponible al momento de la reserva inicial.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 5 — Métodos de Pago
// ═══════════════════════════════════════════════════════════
function Section5Payments({
  form, setField,
}: { form: FormState; setField: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Métodos de Pago" icon={CreditCard} />

      {/* Yape / Plin */}
      <div className="rounded-ios border border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-label font-semibold">Yape / Plin</p>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              className={`w-10 h-6 rounded-full transition-colors duration-200 ${form.isYapeEnabled ? 'bg-accent' : 'bg-border'}`}
              onClick={() => setField('isYapeEnabled', !form.isYapeEnabled)}
              role="switch"
              aria-checked={form.isYapeEnabled}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setField('isYapeEnabled', !form.isYapeEnabled)}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform duration-200 ${form.isYapeEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="text-label text-text-secondary">{form.isYapeEnabled ? 'Activo' : 'Inactivo'}</span>
          </label>
        </div>
        {form.isYapeEnabled && (
          <div>
            <Label>Número de Yape / Plin</Label>
            <input className="input mt-1" value={form.yapeNumber}
              onChange={e => setField('yapeNumber', e.target.value)}
              placeholder="987654321" />
          </div>
        )}
      </div>

      {/* Bank transfer */}
      <div className="rounded-ios border border-border p-4 space-y-4">
        <p className="text-label font-semibold">Transferencia Bancaria</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {([
            { key: 'transferBank',          label: 'Banco',              placeholder: 'BCP' },
            { key: 'transferAccountHolder', label: 'Titular de la cuenta', placeholder: 'Nombre completo' },
            { key: 'transferAccountNumber', label: 'Número de cuenta',   placeholder: '194-123456789-0-12' },
            { key: 'transferCci',           label: 'Código CCI',         placeholder: '00219400123456789012' },
          ] as const).map(f => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <input className="input mt-1" value={(form as never)[f.key]}
                onChange={e => setField(f.key, e.target.value)}
                placeholder={f.placeholder} />
            </div>
          ))}
        </div>
      </div>

      {/* Online payment */}
      <div className="rounded-ios border border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-label font-semibold">Pago Online (link externo)</p>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              className={`w-10 h-6 rounded-full transition-colors duration-200 ${form.isOnlinePaymentEnabled ? 'bg-accent' : 'bg-border'}`}
              onClick={() => setField('isOnlinePaymentEnabled', !form.isOnlinePaymentEnabled)}
              role="switch"
              aria-checked={form.isOnlinePaymentEnabled}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setField('isOnlinePaymentEnabled', !form.isOnlinePaymentEnabled)}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform duration-200 ${form.isOnlinePaymentEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="text-label text-text-secondary">{form.isOnlinePaymentEnabled ? 'Activo' : 'Inactivo'}</span>
          </label>
        </div>
        {form.isOnlinePaymentEnabled && (
          <div>
            <Label>Link de pago externo (Mercado Pago, Culqi, etc.)</Label>
            <input className="input mt-1" value={form.onlinePaymentLink}
              onChange={e => setField('onlinePaymentLink', e.target.value)}
              placeholder="https://mpago.la/..." type="url" />
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 1 — Información Básica
// ═══════════════════════════════════════════════════════════
function Section1BasicInfo({
  form, setField,
}: { form: FormState; setField: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <div className="space-y-5">
      <SectionHeader title="Información Básica" icon={Info} />
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label>Título del producto *</Label>
          <input className="input mt-1" value={form.title}
            onChange={e => setField('title', e.target.value)}
            placeholder="iPhone 15 Pro Max 256GB Titanio Natural" />
        </div>
        <div>
          <Label>Slug (URL) *</Label>
          <input className="input mt-1 font-mono text-[15px]" value={form.slug}
            onChange={e => setField('slug', slugify(e.target.value))}
            placeholder="iphone-15-pro-max-256gb" />
          <p className="text-caption text-text-secondary mt-1">
            URL: /iphone/{form.slug || 'slug-del-producto'}
          </p>
        </div>
        <div>
          <Label>SKU (auto-generado)</Label>
          <input className="input mt-1 font-mono text-[15px] bg-bg-secondary"
            value={form.sku}
            readOnly
            placeholder="Se genera automáticamente desde el slug" />
          <p className="text-caption text-text-secondary mt-1">
            Identificador único para Merchant Center
          </p>
        </div>
        <div>
          <Label>Modelo</Label>
          <select className="input mt-1" value={form.model}
            onChange={e => setField('model', e.target.value)}>
            {IPHONE_MODELS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Almacenamiento</Label>
          <select className="input mt-1" value={form.storage}
            onChange={e => setField('storage', e.target.value as StorageCapacity)}>
            {STORAGE_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Color</Label>
          <input className="input mt-1" value={form.color}
            onChange={e => setField('color', e.target.value)}
            placeholder="Titanio Natural" />
        </div>
        <div>
          <Label>Condición</Label>
          <select className="input mt-1" value={form.condition}
            onChange={e => setField('condition', e.target.value as ProductCondition)}>
            <option value="new">Nuevo</option>
            <option value="refurbished">Reacondicionado</option>
          </select>
        </div>
        {form.condition === 'refurbished' && (
          <div>
            <Label>Grado de calidad</Label>
            <select className="input mt-1" value={form.grade}
              onChange={e => setField('grade', e.target.value as ProductGrade)}>
              <option value="">Seleccionar…</option>
              <option value="A+">A+ (Como nuevo)</option>
              <option value="A">A (Excelente)</option>
              <option value="B">B (Bueno)</option>
            </select>
          </div>
        )}
        <div>
          <Label>Stock disponible</Label>
          <input type="number" min="0" className="input mt-1" value={form.stock}
            onChange={e => setField('stock', parseInt(e.target.value) || 0)} />
        </div>

        {/* Campos SEO/Schema (nuevos) */}
        <div className="sm:col-span-2 border-t border-border pt-4 mt-2">
          <h3 className="text-[15px] font-semibold mb-3">Datos para Google Shopping</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Categoría Google *</Label>
              <input className="input mt-1" value={form.category}
                onChange={e => setField('category', e.target.value)}
                placeholder="Celulares y Smartphones > iPhone" />
              <p className="text-caption text-text-secondary mt-1">
                Categoría de producto para feed de Merchant Center
              </p>
            </div>
            <div>
              <Label>Google Product Category ID</Label>
              <input className="input mt-1 font-mono text-[15px]" value={form.googleProductCategoryId}
                onChange={e => setField('googleProductCategoryId', e.target.value)}
                placeholder="267" />
              <p className="text-caption text-text-secondary mt-1">
                ID de taxonomía de Google (267 = Mobile Phones)
              </p>
            </div>
            <div>
              <Label>Product Group ID (auto-generado)</Label>
              <input className="input mt-1 font-mono text-[15px] bg-bg-secondary"
                value={form.productGroupId}
                readOnly
                placeholder="Se genera desde el modelo" />
              <p className="text-caption text-text-secondary mt-1">
                Agrupa variantes del mismo modelo (color/almacenamiento)
              </p>
            </div>
            <div>
              <Label>MPN (Manufacturer Part Number)</Label>
              <input className="input mt-1 font-mono text-[15px]" value={form.mpn}
                onChange={e => setField('mpn', e.target.value)}
                placeholder="Opcional - ej: MLX33LL/A" />
              <p className="text-caption text-text-secondary mt-1">
                Número de parte de Apple (opcional)
              </p>
            </div>
            <div>
              <Label>GTIN / EAN / UPC</Label>
              <input className="input mt-1 font-mono text-[15px]" value={form.gtin}
                onChange={e => setField('gtin', e.target.value)}
                placeholder="Opcional - solo si tienes el real" />
              <p className="text-caption text-text-secondary mt-1">
                ⚠️ NO inventes valores - deja vacío si no tienes el código real
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 2 — Imágenes
// ═══════════════════════════════════════════════════════════
function Section2Images({
  images, setImages, productId,
}: {
  images: ImageItem[];
  setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  productId: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState<{[key: string]: number}>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Upload desde URL: descargar y re-subir a Firebase
  const addFromUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed || images.length >= 8) return;

    const tempId = `temp-${Date.now()}`;
    setUrlInput('');

    // Agregar placeholder mientras descarga
    setImages(prev => [...prev, { url: trimmed, tempId }]);
    setUploading(prev => ({ ...prev, [tempId]: 0 }));

    try {
      // Descargar imagen desde URL
      const response = await fetch(trimmed);
      if (!response.ok) throw new Error('No se pudo descargar la imagen');

      const blob = await response.blob();
      const file = new File([blob], `image-${Date.now()}.jpg`, { type: blob.type });

      setUploading(prev => ({ ...prev, [tempId]: 50 }));

      // Subir a Firebase Storage
      const firebaseUrl = await uploadProductImage(productId || 'temp', file);

      setUploading(prev => ({ ...prev, [tempId]: 100 }));

      // Reemplazar con URL de Firebase
      setImages(prev => prev.map(img =>
        img.tempId === tempId ? { url: firebaseUrl } : img
      ));

      toast.success('✓ Imagen descargada y subida a Firebase Storage');

      setTimeout(() => {
        setUploading(prev => {
          const next = { ...prev };
          delete next[tempId];
          return next;
        });
      }, 1000);
    } catch (error) {
      console.error('Error uploading from URL:', error);
      toast.error('Error al descargar/subir la imagen desde URL');
      setImages(prev => prev.filter(img => img.tempId !== tempId));
      setUploading(prev => {
        const next = { ...prev };
        delete next[tempId];
        return next;
      });
    }
  };

  // Upload desde archivo: subir directamente a Firebase
  const addFromFile = async (files: FileList | null) => {
    if (!files || !productId) {
      if (!productId) toast.error('Guarda el producto primero antes de subir imágenes');
      return;
    }

    const toAdd = Array.from(files).slice(0, 8 - images.length);

    for (const file of toAdd) {
      const tempId = `file-${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);

      // Agregar preview inmediatamente
      setImages(prev => [...prev, { url: preview, tempId }]);
      setUploading(prev => ({ ...prev, [tempId]: 0 }));

      try {
        // Simular progreso
        setUploading(prev => ({ ...prev, [tempId]: 30 }));

        // Subir a Firebase Storage
        const firebaseUrl = await uploadProductImage(productId, file);

        setUploading(prev => ({ ...prev, [tempId]: 100 }));

        // Reemplazar preview con URL real
        setImages(prev => prev.map(img =>
          img.tempId === tempId ? { url: firebaseUrl } : img
        ));

        // Liberar blob URL
        URL.revokeObjectURL(preview);

        toast.success('✓ Imagen subida a Firebase Storage');

        setTimeout(() => {
          setUploading(prev => {
            const next = { ...prev };
            delete next[tempId];
            return next;
          });
        }, 1000);
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Error al subir la imagen a Firebase');
        setImages(prev => prev.filter(img => img.tempId !== tempId));
        URL.revokeObjectURL(preview);
        setUploading(prev => {
          const next = { ...prev };
          delete next[tempId];
          return next;
        });
      }
    }
  };

  const removeImage = (idx: number) => {
    const img = images[idx];
    if (img.url.startsWith('blob:')) {
      URL.revokeObjectURL(img.url);
    }
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  // Drag and drop para reordenar
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;

    setImages(prev => {
      const arr = [...prev];
      const [draggedItem] = arr.splice(draggedIndex, 1);
      arr.splice(idx, 0, draggedItem);
      return arr;
    });
    setDraggedIndex(idx);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveImage = (from: number, to: number) => {
    setImages(prev => {
      const arr = [...prev];
      const [el] = arr.splice(from, 1);
      arr.splice(to, 0, el);
      return arr;
    });
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Imágenes del Producto" icon={ImageIcon} />
      <p className="text-label text-text-secondary">
        Máximo 8 imágenes. La primera imagen es la imagen principal y la Open Graph.
        Las imágenes se suben automáticamente a Firebase Storage. Arrastra para reordenar.
      </p>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img, idx) => {
            const uploadProgress = img.tempId ? uploading[img.tempId] : undefined;
            const isUploading = uploadProgress !== undefined;

            return (
              <div
                key={img.url + idx}
                draggable={!isUploading}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={clsx(
                  "relative group rounded-[10px] overflow-hidden bg-bg-secondary aspect-square border border-border",
                  !isUploading && "cursor-move",
                  draggedIndex === idx && "opacity-50"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={`Imagen ${idx + 1}`}
                  className="w-full h-full object-contain" />

                {/* Upload progress overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                    <div className="w-3/4 bg-bg-tertiary rounded-full h-2 mb-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-white text-caption font-semibold">
                      {uploadProgress}%
                    </span>
                  </div>
                )}

                {idx === 0 && !isUploading && (
                  <span className="absolute top-1.5 left-1.5 badge badge-accent text-[10px] px-2 py-0.5">
                    Principal
                  </span>
                )}

                {!isUploading && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {idx > 0 && (
                      <button onClick={() => moveImage(idx, idx - 1)}
                        className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center"
                        title="Mover a la izquierda">
                        <ChevronLeft size={18} className="text-text-primary" />
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button onClick={() => moveImage(idx, idx + 1)}
                        className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center"
                        title="Mover a la derecha">
                        <ChevronRight size={18} className="text-text-primary" />
                      </button>
                    )}
                    <button onClick={() => removeImage(idx)}
                      className="w-8 h-8 rounded-full bg-danger/90 hover:bg-danger flex items-center justify-center"
                      title="Eliminar">
                      <Trash2 size={16} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add controls */}
      {images.length < 8 && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://ejemplo.com/imagen.jpg (se descargará y subirá a Firebase)"
              className="input flex-1"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addFromUrl()}
            />
            <button onClick={addFromUrl} className="btn btn-secondary px-4" type="button">
              <Download size={18} className="mr-1.5" />
              Descargar URL
            </button>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => addFromFile(e.target.files)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary px-4"
              type="button"
            >
              <Upload size={18} className="mr-1.5" />
              Subir desde computadora
            </button>
            <p className="text-caption text-text-secondary mt-1.5">
              Las imágenes se suben automáticamente a Firebase Storage
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION 3 — Precios y Cuotas
// ═══════════════════════════════════════════════════════════
function Section3Pricing({
  form, setField, installmentAmount,
}: {
  form: FormState;
  setField: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  installmentAmount: number;
}) {
  return (
    <div className="space-y-5">
      <SectionHeader title="Precios y Cuotas" icon={DollarSign} />
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Precio total (S/)</Label>
          <input type="number" min="0" step="0.01" className="input mt-1"
            value={form.priceTotal || ''}
            onChange={e => setField('priceTotal', parseFloat(e.target.value) || 0)}
            placeholder="2100.00" />
        </div>
        <div>
          <Label>Número de cuotas</Label>
          <input type="number" min="1" max="48" className="input mt-1"
            value={form.installments}
            onChange={e => setField('installments', parseInt(e.target.value) || 12)} />
        </div>
        <div>
          <Label>Tasa de interés mensual (%)</Label>
          <input type="number" min="0" step="0.1" className="input mt-1"
            value={form.interestRate}
            onChange={e => setField('interestRate', parseFloat(e.target.value) || 0)}
            placeholder="5" />
        </div>
        <div>
          <Label>Cuota inicial / enganche (S/)</Label>
          <input type="number" min="0" step="0.01" className="input mt-1"
            value={form.downPayment || ''}
            onChange={e => setField('downPayment', parseFloat(e.target.value) || 0)}
            placeholder="0 (sin enganche)" />
        </div>
      </div>

      {/* Preview box */}
      {form.priceTotal > 0 && (
        <div className="rounded-ios bg-accent/5 border border-accent/20 p-4">
          <p className="text-label font-semibold text-accent mb-2">Vista previa de precios</p>
          <div className="grid sm:grid-cols-3 gap-3 text-[15px]">
            <div>
              <p className="text-caption text-text-secondary">
                {form.downPayment > 0 ? `Cuotas 2-${form.installments}` : 'Por cuota'}
              </p>
              <p className="font-bold text-[22px] text-text-primary">
                S/ {installmentAmount.toFixed(2)}
              </p>
              <p className="text-caption text-text-secondary">
                {form.downPayment > 0
                  ? `${form.installments - 1} cuotas restantes`
                  : `${form.installments} cuotas`}
              </p>
            </div>
            <div>
              <p className="text-caption text-text-secondary">Total con interés</p>
              <p className="font-semibold text-[17px]">
                S/ {(
                  Math.round(
                    (form.downPayment + installmentAmount * (form.downPayment > 0 ? form.installments - 1 : form.installments)) * 100
                  ) / 100
                ).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-caption text-text-secondary">
                {form.downPayment > 0 ? 'Enganche (1ª cuota)' : 'Pago hoy (1ª cuota)'}
              </p>
              <p className="font-semibold text-[17px]">
                S/ {(form.downPayment > 0 ? form.downPayment : installmentAmount).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
