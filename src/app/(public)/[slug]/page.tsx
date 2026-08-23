/**
 * Product page — /[slug]
 *
 * Server Component with:
 * - generateMetadata() for dynamic meta tags + Open Graph
 * - JSON-LD Product schema (§8.2)
 * - BreadcrumbSchema
 * - ProductHero (client island)
 * - ProductSpecs
 * - "How payment works" section
 * - ReviewSection
 * - FAQ accordion
 * - StickyBuyBar (client island, via ProductPageClient)
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Smartphone, Receipt, Package } from 'lucide-react';
import { getProductBySlug, getAllVariantsByMasterId } from '@/lib/firebase/products';
import { getApprovedReviews } from '@/lib/firebase/reviews';
import { ProductPageClient } from '@/components/product/ProductPageClient';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { ReviewSection } from '@/components/product/ReviewSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { buildProductSchema, buildProductGroupSchema } from '@/lib/utils/schema';
import type { Review } from '@/types/review';
import type { FaqItem, Product } from '@/types/product';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}

// Static routes that should NOT be treated as product slugs
const RESERVED_ROUTES = [
  'blog',
  'iphone-en-cuotas',
  'terminos',
  'politica-devoluciones',
  'dashboard',
  'admin',
  'auth',
  'login',
  'api',
  'pago-exitoso',
];

/* ─── generateStaticParams ────────────────────────────────── */
/**
 * Pre-generates all product pages at build time for optimal SEO.
 * Critical: Without this, Google may not discover dynamic routes.
 * Solo genera páginas para productos maestros, no variantes individuales.
 */
export async function generateStaticParams() {
  try {
    const { getAllPublishedProducts } = await import('@/lib/firebase/products');
    const products = await getAllPublishedProducts();
    // getAllPublishedProducts ya filtra solo maestros (isVariant: false)
    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error('[generateStaticParams] Failed to load products:', error);
    return [];
  }
}

/* ─── generateMetadata ────────────────────────────────────── */
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const variantId = (await searchParams)?.variant;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iphoneencuotas.com';

  let product = await getProductBySlug(slug);
  if (!product) return { title: 'Producto no encontrado' };

  // Si hay parámetro variant, cargar esa variante específica para meta tags
  if (variantId && product && !product.isVariant) {
    const { getProductById } = await import('@/lib/firebase/products');
    const variant = await getProductById(variantId);
    if (variant && variant.masterProductId === product.id && variant.status === 'published') {
      product = variant; // Usar datos de la variante para meta tags
    }
  }

  // Canonical URL incluye ?variant= si está presente
  const canonicalUrl = variantId
    ? `${siteUrl}/${slug}?variant=${variantId}`
    : product.seo.canonicalUrl;

  return {
    title:       product.seo.metaTitle,
    description: product.seo.metaDescription,
    alternates:  { canonical: canonicalUrl },
    openGraph: {
      title:       product.seo.ogTitle,
      description: product.seo.ogDescription,
      images:      [{ url: product.seo.ogImage, width: 1200, height: 630 }],
      type:        'website',
      locale:      'es_PE',
      siteName:    'iPhone en Cuotas',
    },
    twitter: {
      card:        'summary_large_image',
      title:       product.seo.twitterTitle,
      description: product.seo.twitterDescription,
      images:      [product.seo.ogImage],
    },
  };
}

/* ─── Page ────────────────────────────────────────────────── */
export default async function IPhoneProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const variantId = (await searchParams)?.variant;

  // Prevent collision with static routes
  if (RESERVED_ROUTES.includes(slug)) {
    notFound();
  }

  const [product, reviews] = await Promise.all([
    getProductBySlug(slug),
    getApprovedReviews(slug).catch(() => [] as Review[]),
  ]);

  if (!product) notFound();

  const clientProduct = (() => {
    const { createdAt, updatedAt, publishedAt, ...rest } = product;
    return rest;
  })();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iphoneencuotas.com';

  // Usar variantes embebidas en lugar de query separada
  const variantClientProducts = (product.variants || [])
    .filter(v => v.status === 'published')
    .map((variant) => ({
      // Datos de la variante
      id: variant.id,
      storage: variant.storage,
      color: variant.color,
      condition: variant.condition,
      grade: variant.grade,
      batteryHealth: variant.batteryHealth,
      priceTotal: variant.priceTotal,
      stock: variant.stock,
      sku: variant.sku,
      images: variant.images,
      thumbnailUrl: variant.thumbnailUrl,
      status: variant.status,

      // Datos heredados del producto maestro
      slug: product.slug,
      title: `${product.model} ${variant.storage} ${variant.color}`,
      model: product.model,
      category: product.category,
      brand: product.brand,
      googleProductCategoryId: product.googleProductCategoryId,
      productGroupId: product.productGroupId,
      mpn: product.mpn,
      gtin: product.gtin,

      // Pricing del maestro
      installments: product.installments,
      installmentAmount: Math.ceil(variant.priceTotal / product.installments),
      interestRate: product.interestRate,
      downPayment: product.downPayment,

      // Penalties del maestro
      penaltyTier1Days: product.penaltyTier1Days,
      penaltyTier1Amount: product.penaltyTier1Amount,
      penaltyTier2Days: product.penaltyTier2Days,
      penaltyTier2Amount: product.penaltyTier2Amount,
      penaltyTier3Days: product.penaltyTier3Days,
      penaltyTier3Amount: product.penaltyTier3Amount,

      // Insurance del maestro
      insurancePlan1Month: product.insurancePlan1Month,
      insurancePlan2Months: product.insurancePlan2Months,
      insurancePlan3Months: product.insurancePlan3Months,
      insuranceCheckoutDiscount1Month: product.insuranceCheckoutDiscount1Month,

      // Payment methods del maestro
      yapeNumber: product.yapeNumber,
      transferAccountHolder: product.transferAccountHolder,
      transferBank: product.transferBank,
      transferAccountNumber: product.transferAccountNumber,
      transferCci: product.transferCci,
      onlinePaymentLink: product.onlinePaymentLink,
      isYapeEnabled: product.isYapeEnabled,
      isOnlinePaymentEnabled: product.isOnlinePaymentEnabled,

      // Specs del maestro
      specs: product.specs,

      // SEO ajustado por variante
      seo: {
        ...product.seo,
        metaTitle: `${product.model} ${variant.storage} ${variant.color} | iPhone en Cuotas`,
        h1: `${product.model} ${variant.storage} ${variant.color}`,
        canonicalUrl: `${siteUrl}/${product.slug}?variant=${variant.id}`,
      },

      // Page content del maestro
      pageContent: product.pageContent,

      // Reviews
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,

      // Flags
      isVariant: false, // Para el cliente, actúan como productos independientes
      masterProductId: null,
      masterProductSlug: null,
    }));


  // Determinar variante inicial: del query param, o la primera disponible
  const initialVariantId = variantId && variantClientProducts.find(v => v.id === variantId)
    ? variantId
    : undefined;

  const productSchema = variantClientProducts.length > 0
    ? buildProductGroupSchema(product, variantClientProducts.map((variant) => ({
        id: variant.id,
        slug: variant.slug,
        color: variant.color,
        storage: variant.storage,
        priceTotal: variant.priceTotal,
        sku: variant.sku,
        stock: variant.stock,
        condition: variant.condition,
        batteryHealth: variant.batteryHealth,
        masterProductSlug: product.slug,
      })))
    : buildProductSchema(product, reviews);

  return (
    <>
      {/* JSON-LD schemas - CRITICAL for Google indexing */}
      <JsonLd data={productSchema} />
      <BreadcrumbSchema
        crumbs={[
          { name: 'Inicio',   url: siteUrl },
          { name: 'iPhone en Cuotas',  url: `${siteUrl}/iphone-en-cuotas` },
          { name: product.model, url: `${siteUrl}/${slug}` },
        ]}
        className="container-main"
      />

      {/* Interactive hero + sticky bar + payment modal */}
      <ProductPageClient
        product={clientProduct}
        variants={variantClientProducts}
        initialVariantId={initialVariantId}
      />

      {/* ── How payment works ── */}
      <section
        aria-labelledby="payment-how-title"
        className="section-gradient"
      >
        <div className="container-main">
          <h2 id="payment-how-title" className="text-section-title text-center mb-12">
            ¿Cómo funciona el pago en cuotas?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                Icon: Smartphone,
                step: '1',
                title: 'Reserva y elige cómo pagar',
                desc:  'Haz clic en "Reservar", elige Yape, Plin, transferencia o tarjeta y completa el primer pago.',
              },
              {
                Icon: Receipt,
                step: '2',
                title: 'Sube tu comprobante',
                desc:  'Toma una captura de tu pago y súbela desde tu dashboard. Revisamos y aprobamos en pocas horas.',
              },
              {
                Icon: Package,
                step: '3',
                title: 'Recibe tu iPhone',
                desc:  'Una vez aprobado el primer pago, coordinamos el envío. Las cuotas siguientes, mes a mes desde tu dashboard.',
              },
            ].map((s) => {
              const Icon = s.Icon;
              return (
                <div key={s.step} className="text-center">
                  <div className="w-14 h-14 rounded-[14px] bg-accent/10 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                    <Icon size={24} className="text-accent" />
                  </div>
                  <p className="text-caption text-accent font-semibold uppercase tracking-widest mb-2">Paso {s.step}</p>
                  <h3 className="text-[18px] font-semibold mb-2">{s.title}</h3>
                  <p className="text-body text-[15px]">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Technical specs ── */}
      <ProductSpecs specs={product.specs} />

      {/* ── Reviews ── */}
      <ReviewSection
        reviews={reviews}
        averageRating={product.averageRating}
        reviewCount={product.reviewCount}
        productId={product.id}
      />

      {/* ── FAQ ── */}
      {product.pageContent.faqItems.length > 0 && (
        <FaqSection faqItems={product.pageContent.faqItems} />
      )}
    </>
  );
}

/* ─── FAQ Accordion ────────────────────────────────────────── */
function FaqSection({ faqItems }: { faqItems: FaqItem[] }) {
  return (
    <section aria-labelledby="faq-title" className="section-gray">
      <div className="container-main max-w-2xl mx-auto">
        <h2 id="faq-title" className="text-section-title text-center mb-10">
          Preguntas Frecuentes
        </h2>

        {/* Server-rendered accordion — JS-free via details/summary */}
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="card px-6 py-0 group"
            >
              <summary
                className="flex items-center justify-between py-5 cursor-pointer list-none text-[17px] font-semibold select-none"
              >
                <h3 className="text-[17px] font-semibold m-0">{item.question}</h3>
                <span
                  className="ml-4 flex-shrink-0 text-text-secondary transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                >
                  ▾
                </span>
              </summary>
              <div className="pb-5 text-body text-[15px] leading-relaxed border-t border-border pt-4">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
