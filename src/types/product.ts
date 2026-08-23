import { Timestamp } from 'firebase/firestore';

export type ProductStatus = 'published' | 'draft' | 'archived';
export type ProductCondition = 'new' | 'refurbished';
export type ProductGrade = 'A+' | 'A' | 'B';
export type StorageCapacity = '64GB' | '128GB' | '256GB' | '512GB' | '1TB';
export type BatteryHealth = 100 | 95 | 90 | 85 | 80;

export interface ProductSpecs {
  display: string;
  chip: string;
  camera: string;
  battery: string;
  connectivity: string;
  os: string;
}

export interface ProductSeo {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  /** Optional: admin-supplied custom JSON-LD that overrides the auto-generated one */
  schemaOverride: string | null;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ProductPageContent {
  heroHeadline: string;
  heroSubheadline: string;
  howItWorks: string; // HTML string
  faqItems: FaqItem[];
}

/**
 * ProductVariant - Datos específicos de cada variante (storage, color, etc.)
 * Embebido como array dentro del producto maestro
 */
export interface ProductVariant {
  id: string; // ID único de la variante (generado automáticamente)
  storage: StorageCapacity;
  color: string;
  condition: ProductCondition;
  grade: ProductGrade | null; // null for new devices
  batteryHealth: BatteryHealth | null; // null para nuevos, 100-80 para reacondicionados

  // Precio y stock específicos
  priceTotal: number;
  stock: number;
  sku: string;

  // Imágenes específicas de esta variante
  images: string[];
  thumbnailUrl: string;

  // Estado
  status: ProductStatus; // Cada variante puede estar publicada o en borrador
}

export interface Product {
  id: string; // Firestore document ID
  slug: string;
  status: ProductStatus;

  // Basic Info (compartido por todas las variantes)
  title: string; // Template: "iPhone 15 Pro"
  model: string;

  // DEPRECATED - Solo para mantener compatibilidad temporal
  // Estos campos se moverán a variants[]
  storage: StorageCapacity;
  color: string;
  condition: ProductCondition;
  grade: ProductGrade | null;
  stock: number;
  batteryHealth: BatteryHealth | null;

  // SEO & Schema fields
  sku: string;
  mpn: string | null;
  gtin: string | null;
  category: string;
  googleProductCategoryId: string;
  productGroupId: string;

  // NUEVO: Array de variantes embebidas
  variants: ProductVariant[];

  // DEPRECATED: Sistema viejo de variantes (mantener temporalmente para migración)
  isVariant: boolean;
  masterProductId: string | null;
  masterProductSlug: string | null;

  // Images
  images: string[];
  thumbnailUrl: string;

  // Pricing & Installments
  priceTotal: number;
  installments: number;
  installmentAmount: number;
  interestRate: number; // decimal, e.g. 0.05 = 5%
  downPayment: number;  // 0 if no down payment

  // Penalty Tiers
  penaltyTier1Days: number;
  penaltyTier1Amount: number;
  penaltyTier2Days: number;
  penaltyTier2Amount: number;
  penaltyTier3Days: number;
  penaltyTier3Amount: number;

  // Insurance Plans
  insurancePlan1Month: number;
  insurancePlan2Months: number;
  insurancePlan3Months: number;
  insuranceCheckoutDiscount1Month: number; // special checkout price

  // Payment Methods
  yapeNumber: string;
  transferAccountHolder: string;
  transferBank: string;
  transferAccountNumber: string;
  transferCci: string;
  onlinePaymentLink: string;
  isYapeEnabled: boolean;
  isOnlinePaymentEnabled: boolean;

  // Technical Specs
  specs: ProductSpecs;

  // SEO
  seo: ProductSeo;

  // Page Content
  pageContent: ProductPageContent;

  // Statistics (denormalized from reviews)
  averageRating: number;
  reviewCount: number;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;
}

/** Client-side product shape used in interactive components */
export type ProductClient = Omit<Product, 'createdAt' | 'updatedAt' | 'publishedAt'>;

/** Lightweight version used in listings / cards */
export type ProductCard = Pick<
  Product,
  | 'id'
  | 'slug'
  | 'title'
  | 'model'
  | 'storage'
  | 'condition'
  | 'grade'
  | 'thumbnailUrl'
  | 'priceTotal'
  | 'installments'
  | 'installmentAmount'
  | 'stock'
  | 'averageRating'
  | 'reviewCount'
  | 'status'
  | 'productGroupId'
  | 'isVariant'
>;
