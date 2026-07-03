import type { MetadataRoute } from 'next';
import { getAllPublishedProducts } from '@/lib/firebase/products';
import { getAllPublishedPosts } from '@/lib/firebase/blog';

export const revalidate = 3600; // regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iphoneencuotas.com';

  // Static URLs always present
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/terminos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Product pages — one URL per published model
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const products = await getAllPublishedProducts();
    productUrls = products.map((p) => ({
      url: `${siteUrl}/iphone/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch {
    // Graceful fallback — Firebase may be unavailable at build time
    console.warn('[sitemap] Could not load products');
  }

  // Blog post pages
  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllPublishedPosts();
    blogUrls = posts
      .filter((p) => p.publishedAt)
      .map((p) => ({
        url: `${siteUrl}/blog/${p.slug}`,
        lastModified: (p.publishedAt as { toDate(): Date }).toDate(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
  } catch {
    console.warn('[sitemap] Could not load blog posts');
  }

  return [...staticUrls, ...productUrls, ...blogUrls];
}
