/**
 * JSON-LD schema builders — used by product and blog pages.
 * Each function returns a plain JS object that gets serialized to JSON-LD.
 *
 * Implementación completa según PRD v3 (secciones 1.1-1.11)
 */

import type { Product, ProductCard } from '@/types/product';
import type { BlogPost } from '@/types/blog';
import type { Review } from '@/types/review';
import type { StorePolicy } from '@/types/settings';

const SITE_NAME = 'iPhone en Cuotas';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iphoneencuotas.com';

/**
 * Schema.org Product schema for iPhone product pages
 * Sección 1.1-1.4 del PRD: Product completo con todos los campos recomendados
 *
 * CRITICAL for Google Merchant Center & Search Console:
 * - Includes all required Merchant Listing fields
 * - Provides shippingDetails and hasMerchantReturnPolicy
 * - Adds availability at both Product and Offer levels
 * - Each variant gets its own complete Product schema with unique URL
 */
export function buildProductSchema(
  product: Product,
  reviews: Review[] = [],
  policy?: StorePolicy
) {
  const availability =
    product.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  // Bug #7 fix: mapeo de condition a itemCondition
  const itemCondition = product.condition === 'new'
    ? 'https://schema.org/NewCondition'
    : 'https://schema.org/RefurbishedCondition';

  // Para variantes, construir URL con parámetro ?variant=ID
  const productUrl = product.isVariant && product.masterProductSlug
    ? `${SITE_URL}/${product.masterProductSlug}?variant=${product.id}`
    : `${SITE_URL}/${product.slug}`;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    description: product.seo.metaDescription,
    url: productUrl,

    // Imágenes (mínimo 3 requeridas por Merchant Center)
    image: product.images,

    // Identificadores (Sección 1.1) - CRITICAL for Merchant Listings
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Apple',
    },

    // NUEVO: Fabricante (recomendado por Google)
    manufacturer: {
      '@type': 'Organization',
      name: 'Apple Inc.',
    },

    // NUEVO: Número de modelo (si existe)
    ...(product.mpn && { model: product.mpn }),

    // Categoría
    category: product.category,

    // Condición del producto (Bug #7 fix)
    itemCondition,

    // NUEVO: availability a nivel de producto (recomendado por Google)
    availability,

    // Color y especificaciones
    color: product.color,

    // CRITICAL: Para variantes, agregar size (storage) y additionalProperty
    ...(product.isVariant && {
      size: product.storage,
      additionalProperty: [
        ...(product.batteryHealth
          ? [{
              '@type': 'PropertyValue',
              name: 'Salud de Batería',
              value: `${product.batteryHealth}%`,
            }]
          : []),
        {
          '@type': 'PropertyValue',
          name: 'Condición',
          value: product.condition === 'new' ? 'Nuevo' : 'Reacondicionado',
        },
        ...(product.grade
          ? [{
              '@type': 'PropertyValue',
              name: 'Grado',
              value: product.grade,
            }]
          : []),
      ],
    }),

    // Relación con ProductGroup (variantes)
    ...(product.productGroupId && {
      isVariantOf: {
        '@type': 'ProductGroup',
        '@id': `${SITE_URL}/#productgroup-${product.productGroupId}`,
        productGroupID: product.productGroupId,
        name: product.model,
      },
      inProductGroupWithID: product.productGroupId,
    }),

    // MPN y GTIN (opcionales, solo si existen)
    ...(product.mpn && { mpn: product.mpn }),
    ...(product.gtin && { gtin: product.gtin }),

    // Offer (Sección 1.3) - ENHANCED with all Merchant Listing fields
    offers: {
      '@type': 'Offer',
      '@id': `${productUrl}#offer`,
      url: productUrl,
      priceCurrency: 'PEN',
      price: product.priceTotal.toFixed(2),

      // NUEVO: Validez del precio (6 meses desde hoy)
      priceValidUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],

      availability, // CRITICAL: Required by Google Merchant Center
      itemCondition,
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },

      // NUEVO: Límite de cantidad (1 por pedido)
      eligibleQuantity: {
        '@type': 'QuantitativeValue',
        value: 1,
        maxValue: product.stock > 0 ? Math.min(product.stock, 3) : 1,
      },

      // CRITICAL: Always include shipping and return policy references
      // These fields fix Google Search Console warnings
      hasMerchantReturnPolicy: {
        '@id': `${SITE_URL}/#returnpolicy`,
      },
      shippingDetails: {
        '@id': `${SITE_URL}/#shippingpolicy`,
      },
    },
  };

  // Add aggregateRating only when there are reviews (Sección 1.4)
  if (product.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating.toFixed(1),
      reviewCount: String(product.reviewCount),
      bestRating: '5',
      worstRating: '1',
    };
  }

  // Add reviews (Sección 1.4)
  if (reviews.length > 0) {
    schema.review = reviews.slice(0, 3).map((r) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(r.rating),
        bestRating: '5',
      },
      name: r.title,
      reviewBody: r.body,
      author: {
        '@type': 'Person',
        name: r.userName,
      },
      datePublished: r.approvedAt
        ? (r.approvedAt as { toDate(): Date }).toDate().toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    }));
  }

  return schema;
}

/**
 * Schema.org ProductGroup para variantes de producto
 * Sección 1.2 del PRD
 *
 * CRITICAL for Google Search Console & Merchant Center:
 * - Each variant must have complete Product schema with unique URL
 * - Prices must match exactly between ProductGroup and individual Product pages
 * - All required fields (sku, brand, offers, availability) must be present
 */
export function buildProductGroupSchema(
  variant: Product,
  siblings: Pick<Product, 'id' | 'slug' | 'color' | 'storage' | 'priceTotal' | 'sku' | 'stock' | 'condition' | 'batteryHealth' | 'masterProductSlug'>[]
) {
  // Si las variantes tienen masterProductSlug, usarlo; si no, usar el slug de la variante actual
  const masterSlug = siblings[0]?.masterProductSlug || variant.masterProductSlug || variant.slug;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    '@id': `${SITE_URL}/#productgroup-${variant.productGroupId}`,
    productGroupID: variant.productGroupId,
    name: variant.model,
    url: `${SITE_URL}/${masterSlug}`,
    variesBy: ['https://schema.org/color', 'https://schema.org/size', 'https://schema.org/condition'],
    hasVariant: siblings.map((s) => ({
      '@type': 'Product',
      '@id': `${SITE_URL}/${masterSlug}?variant=${s.id}#product`,
      name: `${variant.model} ${s.storage} ${s.color}${s.condition === 'refurbished' ? ' Reacondicionado' : ''}${s.batteryHealth ? ` ${s.batteryHealth}%` : ''}`,
      url: `${SITE_URL}/${masterSlug}?variant=${s.id}`,
      sku: s.sku,
      brand: {
        '@type': 'Brand',
        name: 'Apple',
      },
      color: s.color,
      size: s.storage,
      itemCondition: s.condition === 'new'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/RefurbishedCondition',
      additionalProperty: [
        ...(s.batteryHealth
          ? [{
              '@type': 'PropertyValue',
              name: 'Salud de Batería',
              value: `${s.batteryHealth}%`,
            }]
          : []),
        {
          '@type': 'PropertyValue',
          name: 'Condición',
          value: s.condition === 'new' ? 'Nuevo' : 'Reacondicionado',
        },
      ],
      offers: {
        '@type': 'Offer',
        '@id': `${SITE_URL}/${masterSlug}?variant=${s.id}#offer`,
        url: `${SITE_URL}/${masterSlug}?variant=${s.id}`,
        price: s.priceTotal.toFixed(2),
        priceCurrency: 'PEN',
        availability: s.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: s.condition === 'new'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/RefurbishedCondition',
      },
    })),
  };
}

/**
 * Schema.org FAQPage
 * Sección 1.5 del PRD
 */
export function buildFAQSchema(faqItems: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Schema.org Organization schema for site-wide use
 * Sección 1.7 del PRD: Organization completa con políticas globales
 *
 * CRITICAL: Always includes default shipping and return policies
 * These are referenced by Product offers via @id
 */
export function buildOrganizationSchema(policy?: StorePolicy) {
  const baseSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/og-default.jpg`,
      width: 1200,
      height: 630,
    },
    image: `${SITE_URL}/og-default.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Santo Toribio 163',
      addressLocality: 'San Isidro',
      addressRegion: 'Lima',
      postalCode: '15073',
      addressCountry: 'PE',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+51-944-784-488',
      availableLanguage: 'Spanish',
      areaServed: 'PE',
    },
    sameAs: [
      'https://wa.me/51944784488',
      // Agregar redes sociales reales cuando estén disponibles
    ],
  };

  // CRITICAL: Always provide default policies even without StorePolicy object
  // Google Merchant Center requires these for all products
  if (policy) {
    baseSchema.hasMerchantReturnPolicy = {
      '@type': 'MerchantReturnPolicy',
      '@id': `${SITE_URL}/#returnpolicy`,
      applicableCountry: policy.returnPolicy.applicableCountry,
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: policy.returnPolicy.returnWindowDays,
      returnMethod: policy.returnPolicy.returnMethod,
      returnFees: policy.returnPolicy.returnFees,
    };

    baseSchema.shippingDetails = {
      '@type': 'OfferShippingDetails',
      '@id': `${SITE_URL}/#shippingpolicy`,
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: policy.shipping.ratePEN,
        currency: 'PEN',
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: policy.shipping.addressCountry,
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: policy.shipping.handlingDaysMin,
          maxValue: policy.shipping.handlingDaysMax,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: policy.shipping.transitDaysMin,
          maxValue: policy.shipping.transitDaysMax,
          unitCode: 'DAY',
        },
      },
    };
  } else {
    // Fallback: Provide default policies when StorePolicy is not available
    baseSchema.hasMerchantReturnPolicy = {
      '@type': 'MerchantReturnPolicy',
      '@id': `${SITE_URL}/#returnpolicy`,
      applicableCountry: 'PE',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 0, // No returns after first payment approved
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/FreeReturn',
      url: `${SITE_URL}/politica-devoluciones`,
    };

    baseSchema.shippingDetails = {
      '@type': 'OfferShippingDetails',
      '@id': `${SITE_URL}/#shippingpolicy`,
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: '0',
        currency: 'PEN',
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'PE',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 2,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 5,
          unitCode: 'DAY',
        },
      },
    };
  }

  return baseSchema;
}

/**
 * Schema.org WebSite con SearchAction
 * Sección 1.10 del PRD
 */
export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/buscar?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Schema.org ItemList para páginas de categoría/listado
 * Sección 1.9 del PRD
 */
export function buildItemListSchema(products: ProductCard[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/${p.slug}`,
      name: p.title,
      item: {
        '@type': 'Product',
        name: p.title,
        url: `${SITE_URL}/${p.slug}`,
        image: p.thumbnailUrl,
        offers: {
          '@type': 'Offer',
          price: p.priceTotal.toFixed(2),
          priceCurrency: 'PEN',
        },
      },
    })),
  };
}

/**
 * CollectionPage schema para páginas de categoría
 * Sección 2.bis del PRD
 */
export function buildCollectionPageSchema(
  title: string,
  description: string,
  url: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
  };
}

/**
 * BreadcrumbList schema for navigation
 * Sección 1.6 del PRD
 */
export function buildBreadcrumbSchema(
  crumbs: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * Schema.org BlogPosting schema for blog article pages
 */
export function buildBlogSchema(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.featuredImage,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    datePublished: post.publishedAt
      ? (post.publishedAt as { toDate(): Date }).toDate().toISOString()
      : new Date().toISOString(),
    dateModified: post.publishedAt
      ? (post.publishedAt as { toDate(): Date }).toDate().toISOString()
      : new Date().toISOString(),
    description: post.seo.metaDescription,
    url: `${SITE_URL}/blog/${post.slug}`,
  };
}
