/**
 * Página de categoría: /iphone-en-cuotas
 *
 * Sección 2.bis del PRD: página clave para rankear por la keyword de cabecera
 * "iphone en cuotas" con ItemList schema y todos los modelos disponibles.
 *
 * Esta página es fundamental para que Google muestre varios modelos en el SERP.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPublishedProducts } from '@/lib/firebase/products';
import { AppImage } from '@/components/ui/AppImage';
import { Badge } from '@/components/ui/Badge';
import { formatSoles } from '@/lib/utils/currency';
import { JsonLd } from '@/components/seo/JsonLd';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import {
  buildItemListSchema,
  buildCollectionPageSchema,
  buildFAQSchema,
  buildOrganizationSchema,
} from '@/lib/utils/schema';
import type { ProductCard } from '@/types/product';

export const revalidate = 300; // ISR cada 5 minutos

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iphoneencuotas.com';

export const metadata: Metadata = {
  title: 'iPhone en Cuotas — Todos los modelos disponibles en Perú',
  description:
    'Compra tu iPhone en cuotas sin tarjeta de crédito. iPhone 13, 14, 15, 16 y 17 Pro Max disponibles. Paga con Yape, Plin o transferencia. Envío a todo el Perú.',
  alternates: {
    canonical: '/iphone-en-cuotas',
  },
  openGraph: {
    title: 'iPhone en Cuotas — Todos los modelos en Perú',
    description:
      'Todos los modelos de iPhone disponibles en cuotas sin tarjeta. Desde iPhone 13 hasta iPhone 17 Pro Max.',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
    type: 'website',
    locale: 'es_PE',
  },
};

const FAQ_ITEMS = [
  {
    question: '¿Necesito historial crediticio para comprar un iPhone en cuotas?',
    answer:
      'No. A diferencia de los bancos, no revisamos tu historial crediticio. Solo necesitas ser mayor de edad, tener DNI peruano y poder pagar la primera cuota.',
  },
  {
    question: '¿Cuáles son los requisitos para comprar en cuotas?',
    answer:
      'Solo necesitas: (1) Ser mayor de 18 años, (2) DNI peruano vigente, (3) Número de teléfono activo, (4) Poder pagar la primera cuota al momento de la reserva. No pedimos garantías ni avales.',
  },
  {
    question: '¿Qué modelos de iPhone tienen stock disponible ahora?',
    answer:
      'Tenemos disponibles iPhone 13, 14, 15, 16 y 17 Pro Max en diversas capacidades y colores. El stock se actualiza diariamente. Los equipos marcados como "Nuevos" son sellados de fábrica, y los "Reacondicionados" están certificados con garantía.',
  },
  {
    question: '¿Los iPhones son originales de Apple?',
    answer:
      'Sí, todos nuestros equipos son 100% originales Apple. Los iPhone nuevos vienen sellados de fábrica, y los reacondicionados pasan por un proceso de certificación riguroso con pruebas de hardware y software.',
  },
  {
    question: '¿Cómo funciona el pago en cuotas con Yape o Plin?',
    answer:
      'Pagas la primera cuota al reservar (con Yape, Plin, transferencia o tarjeta). Luego recibes acceso a tu dashboard personal donde verás el calendario de las cuotas restantes. Cada mes pagas la cuota desde el dashboard con el método que prefieras.',
  },
  {
    question: '¿Hacen envíos a todo el Perú?',
    answer:
      'Sí, enviamos a todas las regiones del Perú. El costo y tiempo de envío se calcula según tu ubicación. Lima Metropolitana: 1-2 días hábiles. Provincias: 3-5 días hábiles. El envío se coordina una vez aprobada tu primera cuota.',
  },
];

export default async function IPhoneEnCuotasPage() {
  const products = await getAllPublishedProducts().catch(() => [] as ProductCard[]);

  return (
    <>
      {/* Structured data */}
      <JsonLd data={buildOrganizationSchema()} />
      <JsonLd
        data={buildCollectionPageSchema(
          'iPhone en Cuotas — Todos los modelos',
          'Catálogo completo de iPhones disponibles en cuotas sin tarjeta en Perú',
          `${SITE_URL}/iphone-en-cuotas`
        )}
      />
      <JsonLd data={buildItemListSchema(products)} />
      <JsonLd data={buildFAQSchema(FAQ_ITEMS)} />

      <BreadcrumbSchema
        crumbs={[
          { name: 'Inicio', url: SITE_URL },
          { name: 'iPhone en Cuotas', url: `${SITE_URL}/iphone-en-cuotas` },
        ]}
        className="container-main"
      />

      {/* Hero section */}
      <section className="section-gradient pt-20 pb-12">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-display mb-6">
              iPhone en Cuotas — <span className="text-accent">Todos los modelos</span>
            </h1>
            <p className="text-body text-text-secondary text-[19px] leading-relaxed mb-8">
              Compra tu iPhone en cómodas cuotas mensuales sin necesidad de tarjeta de
              crédito. Paga con Yape, Plin o transferencia bancaria. Todos los modelos
              desde iPhone 13 hasta iPhone 17 Pro Max disponibles con entrega a todo el
              Perú.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-label">
              <div className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span>Sin historial crediticio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span>Equipos originales Apple</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span>Envío a todo el Perú</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="section-light" aria-labelledby="productos-title">
        <div className="container-main">
          <h2 id="productos-title" className="text-section-title text-center mb-12">
            Elige tu iPhone
          </h2>

          {products.length === 0 ? (
            <p className="text-center text-body text-text-secondary py-12">
              Próximamente — estamos preparando el catálogo completo.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-gray" aria-labelledby="faq-title">
        <div className="container-main">
          <h2 id="faq-title" className="text-section-title text-center mb-12">
            Preguntas Frecuentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <details
                key={i}
                className="card p-6 group cursor-pointer hover:shadow-elevated transition-shadow"
              >
                <summary className="font-semibold text-[17px] text-text-primary list-none flex items-center justify-between">
                  <span>{item.question}</span>
                  <span className="text-accent group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="text-body text-[15px] mt-4 leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-gradient">
        <div className="container-main text-center">
          <h2 className="text-section-title mb-6">
            ¿Listo para tu nuevo iPhone?
          </h2>
          <p className="text-body text-text-secondary max-w-xl mx-auto mb-8">
            Elige tu modelo, reserva con la primera cuota y recíbelo en tu casa.
            Sin complicaciones, sin bancos, sin esperas.
          </p>
          <Link href="#productos-title" className="btn btn-primary text-[17px] px-8 py-3.5">
            Ver todos los modelos
          </Link>
        </div>
      </section>
    </>
  );
}

/* ─── Product Card Component ──────────────────────────────────── */

function ProductCard({ product }: { product: ProductCard }) {
  return (
    <Link
      href={`/iphone/${product.slug}`}
      className="card p-0 flex flex-col group no-underline hover:shadow-elevated transition-shadow"
      aria-label={`Ver detalles de ${product.title}`}
    >
      {/* Image */}
      <div className="relative bg-bg-secondary rounded-t-[18px] overflow-hidden aspect-[4/3] flex items-center justify-center p-8">
        <AppImage
          src={product.thumbnailUrl || '/og-default.jpg'}
          alt={`${product.title} — vista frontal`}
          width={240}
          height={240}
          className="object-contain group-hover:scale-105 transition-transform duration-500"
        />
        {/* Condition badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={product.condition === 'new' ? 'accent' : 'neutral'}>
            {product.condition === 'new'
              ? 'Nuevo'
              : `Reacondicionado${product.grade ? ` · Grado ${product.grade}` : ''}`}
          </Badge>
        </div>
        {/* Stock warning */}
        {product.stock <= 3 && product.stock > 0 && (
          <div className="absolute top-3 right-3">
            <Badge variant="warning">¡Últimas {product.stock}!</Badge>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-t-[18px]">
            <span className="badge badge-neutral text-[13px]">Sin stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-[17px] text-text-primary mb-1 line-clamp-2">
          {product.title}
        </h3>
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <span className="text-[#FF9F0A] text-[13px]">
              {'★'.repeat(Math.round(product.averageRating))}
            </span>
            <span className="text-caption">({product.reviewCount})</span>
          </div>
        )}
        <div className="mt-auto pt-3 border-t border-border">
          <p className="text-caption text-text-secondary mb-0.5">
            {product.installments} cuotas de
          </p>
          <p className="text-[22px] font-bold text-text-primary">
            {formatSoles(product.installmentAmount)}
          </p>
          <p className="text-caption text-text-tertiary mt-0.5">
            Total: {formatSoles(product.priceTotal)}
          </p>
        </div>
        <div className="mt-4">
          <span className="btn btn-primary w-full text-[15px] py-2.5 text-center block">
            Ver detalles
          </span>
        </div>
      </div>
    </Link>
  );
}
