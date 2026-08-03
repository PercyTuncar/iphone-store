import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile photos
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      // TEMPORAL: hasta que todas las imágenes estén migradas
      {
        protocol: 'https',
        hostname: 'www.apple.com',
      },
      {
        protocol: 'https',
        hostname: 'cdsassets.apple.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Permite que los popups de OAuth (Google) funcionen sin advertencias COOP
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Bug #1 fix: Forzar dominio canónico con www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'iphoneencuotas.com',
          },
        ],
        destination: 'https://www.iphoneencuotas.com/:path*',
        permanent: true,
      },
    ];
  },

  // Enable React strict mode for better development warnings
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Power by header removal for security
  poweredByHeader: false,
};

export default nextConfig;
