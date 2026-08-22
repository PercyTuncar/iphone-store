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
 */
export async function generateStaticParams() {
  try {
    const { getAllPublishedProducts } = await import('@/lib/firebase/products');
    const products = await getAllPublishedProducts();
    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error('[generateStaticParams] Failed to load products:', error);
    return [];
  }
}

/* ─── generateMetadata ────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Producto no encontrado' };

  return {
    title:       product.seo.metaTitle,
    description: product.seo.metaDescription,
    alternates:  { canonical: product.seo.canonicalUrl },
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
export default async function IPhoneProductPage({ params }: Props) {
  const { slug } = await params;

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
  const hasVariantChildren = product.isVariant === false
    ? await getAllVariantsByMasterId(product.id).catch(() => [])
    : [];

  const variantClientProducts = hasVariantChildren.map((variant) => {
    const { createdAt, updatedAt, publishedAt, ...rest } = variant;
    return rest;
  });

  const productSchema = hasVariantChildren.length > 0
    ? buildProductGroupSchema(product, hasVariantChildren.map((variant) => ({
        slug: variant.slug,
        color: variant.color,
        storage: variant.storage,
        priceTotal: variant.priceTotal,
        sku: variant.sku,
        stock: variant.stock,
        condition: variant.condition,
        batteryHealth: variant.batteryHealth,
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
      <ProductPageClient product={clientProduct} variants={variantClientProducts} />

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
