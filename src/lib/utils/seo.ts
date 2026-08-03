/**
 * SEO utilities — helpers for building Next.js Metadata objects.
 */

import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iphoneencuotas.com';
const SITE_NAME = 'iPhone en Cuotas';

interface BuildMetadataOptions {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  noIndex?: boolean;
}

/**
 * Build a Next.js Metadata object from SEO fields.
 * Used by pages that don't have a dedicated product/post SEO record.
 */
export function buildMetadata({
  title,
  description,
  canonical,
  ogImage = `${SITE_URL}/og-default.jpg`,
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription,
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: ogTitle ?? title,
      description: ogDescription ?? description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
      locale: 'es_PE',
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle ?? title,
      description: twitterDescription ?? description,
      images: [ogImage],
    },
  };
}

/** Truncate a string for meta title/description with a character warning threshold */
export function truncateMeta(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '…';
}
