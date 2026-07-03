/**
 * JSON-LD schema builders — used by product and blog pages.
 * Each function returns a plain JS object that gets serialized to JSON-LD.
 */

import type { Product } from '@/types/product';
import type { BlogPost } from '@/types/blog';
import type { Review } from '@/types/review';

const SITE_NAME = 'iPhone en Cuotas';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iphoneencuotas.com';

/** Schema.org Product schema for iPhone product pages */
export function buildProductSchema(product: Product, reviews: Review[] = []) {
  const availability =
    product.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: product.images,
    description: product.seo.metaDescription,
    brand: {
      '@type': 'Brand',
      name: 'Apple',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/iphone/${product.slug}`,
      priceCurrency: 'PEN',
      price: product.priceTotal.toFixed(2),
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      )
        .toISOString()
        .split('T')[0],
      availability,
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
  };

  // Add aggregateRating only when there are reviews
  if (product.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating.toFixed(1),
      reviewCount: String(product.reviewCount),
    };
  }

  // Add last 3 reviews
  if (reviews.length > 0) {
    schema.review = reviews.slice(0, 3).map((r) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(r.rating),
      },
      name: r.title,
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

/** Schema.org BlogPosting schema for blog article pages */
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

/** Schema.org Organization schema for site-wide use */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-default.jpg`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Spanish',
    },
  };
}

/** BreadcrumbList schema for navigation */
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
