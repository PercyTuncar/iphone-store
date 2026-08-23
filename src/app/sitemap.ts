import type { MetadataRoute } from 'next';
import { getAllPublishedProducts } from '@/lib/firebase/products';
import { getAllPublishedPosts } from '@/lib/firebase/blog';

export const revalidate = 3600; // regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iphoneencuotas.com';

  // Static URLs always present
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/iphone-en-cuotas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
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

  // Product pages — master products + all their variants
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const products = await getAllPublishedProducts();

    // Para cada producto, agregar:
    // 1. URL del producto maestro o la variante sin parámetro
    // 2. Si es un producto maestro con variantes, agregar URLs de cada variante
    for (const p of products) {
      // URL principal del producto
      productUrls.push({
        url: `${siteUrl}/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      });

      // Si es un producto maestro con productGroupId, obtener todas sus variantes
      if (p.productGroupId && !p.isVariant) {
        // Importar la función para obtener variantes
        const { getAllVariantsByMasterId } = await import('@/lib/firebase/products');
        try {
          const variants = await getAllVariantsByMasterId(p.id);

          // Agregar URL de cada variante con parámetro ?variant=ID
          for (const variant of variants) {
            productUrls.push({
              url: `${siteUrl}/${p.slug}?variant=${variant.id}`,
              lastModified: new Date(),
              changeFrequency: 'weekly' as const,
              priority: 0.85, // Ligeramente menor que el maestro
            });
          }
        } catch (err) {
          console.warn(`[sitemap] Could not load variants for product ${p.id}`);
        }
      }
    }
  } catch {
    // Graceful fallback — Firebase may be unavailable at build time
    console.warn('[sitemap] Could not load products');
  }

  // Blog post pages
  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllPublishedPosts();
    blogUrls = posts
      .map((p) => {
        const publishedAt = p.publishedAt && typeof p.publishedAt === 'object' && 'toDate' in p.publishedAt
          ? (p.publishedAt as { toDate(): Date }).toDate()
          : new Date();
        return {
          url: `${siteUrl}/blog/${p.slug}`,
          lastModified: publishedAt,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        };
      });
  } catch {
    console.warn('[sitemap] Could not load blog posts');
  }

  return [...staticUrls, ...productUrls, ...blogUrls];
}
