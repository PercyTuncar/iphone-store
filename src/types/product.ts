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

export interface Product {
  id: string; // Firestore document ID
  slug: string;
  status: ProductStatus;

  // Basic Info
  title: string;
  model: string;
  storage: StorageCapacity;
  color: string;
  condition: ProductCondition;
  grade: ProductGrade | null; // null for new devices
  stock: number;

  // SEO & Schema fields (nuevos - requeridos para Google)
  sku: string; // identificador único interno
  mpn: string | null; // Manufacturer Part Number (opcional)
  gtin: string | null; // código de barras global (opcional, no inventar)
  category: string; // ej. "Celulares y Smartphones > iPhone"
  googleProductCategoryId: string; // ej. "267" (Google Product Taxonomy)
  productGroupId: string; // mismo valor para todas las variantes de color/capacidad

  // NUEVO: Sistema de Variantes
  batteryHealth: BatteryHealth | null; // null para nuevos, 100-80 para reacondicionados
  isVariant: boolean; // true si es variante de un maestro, false si es maestro o producto tradicional
  masterProductId: string | null; // ID del producto maestro (null si no es variante)
  masterProductSlug: string | null; // Slug del producto maestro (para construir URLs con ?variant=)

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
