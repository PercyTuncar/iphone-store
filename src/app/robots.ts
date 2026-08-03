import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iphoneencuotas.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/pago-exitoso/',
          '/login',
          '/auth-callback',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
