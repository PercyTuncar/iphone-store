import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { NavbarWrapper } from '@/components/layout/NavbarWrapper';
import { FooterWrapper } from '@/components/layout/FooterWrapper';
import { BottomTabBar } from '@/components/layout/BottomTabBar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iphoneencuotas.com'
  ),
  title: {
    default: 'iPhone en Cuotas — Compra tu iPhone en cuotas sin tarjeta en Perú',
    template: '%s | iPhone en Cuotas',
  },
  description:
    'Compra iPhones desde el 13 hasta el 17 Pro Max en cómodas cuotas. Paga con Yape, Plin o transferencia bancaria. Entrega a todo el Perú.',
  keywords: [
    'iphone en cuotas',
    'comprar iphone peru',
    'iphone sin tarjeta',
    'iphone a plazos',
    'iphone cuotas yape',
  ],
  openGraph: {
    siteName: 'iPhone en Cuotas',
    locale: 'es_PE',
    type: 'website',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'iPhone en Cuotas' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased bg-bg-primary text-text-primary">
        <AuthProvider>
          {/* Desktop / tablet navbar — hides itself on /admin and /dashboard */}
          <NavbarWrapper />

          {/* Page content */}
          <main>{children}</main>

          {/* Footer — hides on /admin, /dashboard, /login */}
          <FooterWrapper />

          {/* Mobile bottom tab bar — always visible on mobile, hidden md+ */}
          <BottomTabBar />

          {/* Global toast notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1D1D1F',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '500',
                padding: '12px 20px',
              },
              success: { iconTheme: { primary: '#34C759', secondary: '#FFFFFF' } },
              error:   { iconTheme: { primary: '#FF3B30', secondary: '#FFFFFF' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
