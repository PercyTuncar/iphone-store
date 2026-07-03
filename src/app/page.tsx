/**
 * Home Page (/)
 *
 * Server Component — fetches published products + featured reviews from Firestore.
 * Sections: Hero · Models Grid · How It Works · Trust Pillars · Testimonials
 */

import type React from 'react';
import Link from 'next/link';
import {
  Smartphone, CreditCard, CheckCircle, Package,
  Search, Lock, Radio, MessageCircle,
} from 'lucide-react';
import { getAllPublishedProducts } from '@/lib/firebase/products';
import { getFeaturedReviews } from '@/lib/firebase/reviews';
import { AppImage } from '@/components/ui/AppImage';
import { Badge } from '@/components/ui/Badge';
import { formatSoles } from '@/lib/utils/currency';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildOrganizationSchema } from '@/lib/utils/schema';
import type { ProductCard } from '@/types/product';
import type { Review } from '@/types/review';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [products, reviews] = await Promise.all([
    getAllPublishedProducts().catch(() => [] as ProductCard[]),
    getFeaturedReviews(3).catch(() => [] as Review[]),
  ]);

  return (
    <>
      <JsonLd data={buildOrganizationSchema()} />

      {/* ══════════════════════════════════════════════
          HERO — 100vh, iPhone image + main CTA
         ══════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center bg-bg-primary overflow-hidden"
        aria-label="Presentación principal"
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(0,113,227,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="container-main w-full pt-20 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div className="order-2 md:order-1">
              <p className="text-label text-accent uppercase tracking-widest mb-4">
                Perú · Sin tarjeta de crédito
              </p>
              <h1 className="text-display mb-6">
                Tu iPhone en cuotas.{' '}
                <span className="text-accent">Hoy.</span>
              </h1>
              <p className="text-body text-text-secondary max-w-md mb-8 text-[19px] leading-relaxed">
                Elige tu modelo, paga en cómodas cuotas con Yape, Plin o
                transferencia, y recíbelo en casa. Sin banco. Sin tarjeta. Sin esperas.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/#modelos"
                  className="btn btn-primary text-[17px] px-8 py-3.5"
                >
                  Ver modelos disponibles
                </Link>
                <Link
                  href="/#como-funciona"
                  className="btn btn-secondary text-[17px] px-8 py-3.5"
                >
                  ¿Cómo funciona?
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 mt-10">
                {[
                  { Icon: CheckCircle, text: 'Equipos verificados' },
                  { Icon: Lock,        text: 'Pagos protegidos'    },
                  { Icon: Package,     text: 'Envío a todo el Perú'},
                ].map((b) => {
                  const Icon = b.Icon;
                  return (
                    <div key={b.text} className="flex items-center gap-2 text-label text-text-secondary">
                      <Icon size={14} className="text-accent flex-shrink-0" aria-hidden="true" />
                      {b.text}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* iPhone hero image */}
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <div
                  className="absolute inset-0 rounded-full bg-accent/8 blur-3xl"
                  aria-hidden="true"
                />
                <AppImage
                  src="https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-17-pro-17-pro-max-hero.png"
                  alt="iPhone 15 Pro Max color Titanio Natural"
                  width={320}
                  height={320}
                  priority
                  preset="none"
                  className="relative z-10 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MODELS GRID
         ══════════════════════════════════════════════ */}
      <section id="modelos" className="section-gradient" aria-labelledby="modelos-title">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 id="modelos-title" className="text-section-title mb-4">
              Modelos Disponibles
            </h2>
            <p className="text-body max-w-xl mx-auto">
              Todos los modelos son originales Apple. Elige tu iPhone favorito y
              empieza a pagarlo en cuotas desde hoy.
            </p>
          </div>

          {products.length === 0 ? (
            <p className="text-center text-body text-text-secondary py-12">
              Próximamente — estamos preparando el catálogo.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
         ══════════════════════════════════════════════ */}
      <section id="como-funciona" className="section-light" aria-labelledby="how-title">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 id="how-title" className="text-section-title mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-body max-w-lg mx-auto">
              Cuatro pasos simples para tener tu iPhone nuevo sin complicaciones.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_STEPS.map((step, i) => {
              const Icon = step.Icon;
              return (
                <div key={step.title} className="text-center">
                  <div
                    className="w-14 h-14 rounded-[14px] bg-accent/10 flex items-center justify-center mx-auto mb-4"
                    aria-hidden="true"
                  >
                    <Icon size={24} className="text-accent" />
                  </div>
                  <p className="text-caption text-accent font-semibold uppercase tracking-widest mb-2">
                    Paso {i + 1}
                  </p>
                  <h3 className="text-subtitle mb-2 text-[18px]">{step.title}</h3>
                  <p className="text-body text-[15px]">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TRUST PILLARS
         ══════════════════════════════════════════════ */}
      <section className="section-gray" aria-labelledby="trust-title">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 id="trust-title" className="text-section-title mb-4">
              ¿Por qué confiar en nosotros?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_PILLARS.map((p) => {
              const Icon = p.Icon;
              return (
                <div
                  key={p.title}
                  className="card p-6 text-center hover:shadow-elevated transition-shadow"
                >
                  <div
                    className="w-12 h-12 rounded-[12px] bg-accent/10 flex items-center justify-center mx-auto mb-4"
                    aria-hidden="true"
                  >
                    <Icon size={22} className="text-accent" />
                  </div>
                  <h3 className="text-subtitle text-[17px] font-semibold mb-2">{p.title}</h3>
                  <p className="text-body text-[15px]">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
         ══════════════════════════════════════════════ */}
      {reviews.length > 0 && (
        <section className="section-light" aria-labelledby="reviews-title">
          <div className="container-main">
            <div className="text-center mb-12">
              <h2 id="reviews-title" className="text-section-title mb-4">
                Lo que dicen nuestros clientes
              </h2>
              <div className="flex items-center justify-center gap-1 text-[#FF9F0A]" aria-label="5 estrellas">
                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <TestimonialCard key={r.id} review={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/* ─── Sub-components ──────────────────────────────────────────── */

function ProductCard({ product }: { product: ProductCard }) {
  return (
    <Link
      href={`/iphone/${product.slug}`}
      className="card p-0 flex flex-col group no-underline"
      aria-label={`Ver ${product.title}`}
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
            {product.condition === 'new' ? 'Nuevo' : `Reacondicionado${product.grade ? ` · Grado ${product.grade}` : ''}`}
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
        <h3 className="font-semibold text-[17px] text-text-primary mb-1 line-clamp-1">
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
            Ver y Reservar
          </span>
        </div>
      </div>
    </Link>
  );
}

function TestimonialCard({ review }: { review: Review }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        {review.userPhoto ? (
          <AppImage
            src={review.userPhoto}
            alt={`Foto de ${review.userName}`}
            width={40}
            height={40}
            preset="avatar"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold">
            {review.userName[0]}
          </div>
        )}
        <div>
          <p className="font-semibold text-[15px]">{review.userName}</p>
          <div className="text-[#FF9F0A] text-[12px]">
            {'★'.repeat(review.rating)}
          </div>
        </div>
      </div>
      {review.title && (
        <p className="font-semibold text-[15px] mb-2">{review.title}</p>
      )}
      <p className="text-body text-[15px] line-clamp-4">{review.body}</p>
    </div>
  );
}

/* ─── Static data ────────────────────────────────────────────── */

const HOW_STEPS: { Icon: React.ElementType; title: string; desc: string }[] = [
  {
    Icon: Smartphone,
    title: 'Elige tu iPhone',
    desc: 'Selecciona el modelo, almacenamiento y condición que más te conviene.',
  },
  {
    Icon: CreditCard,
    title: 'Reserva y paga',
    desc: 'Paga la primera cuota con Yape, Plin, transferencia o tarjeta.',
  },
  {
    Icon: CheckCircle,
    title: 'Aprobación rápida',
    desc: 'Revisamos tu comprobante y confirmamos tu pedido en pocas horas.',
  },
  {
    Icon: Package,
    title: 'Recibe tu iPhone',
    desc: 'Enviamos tu equipo a tu puerta. Las cuotas siguientes, mes a mes.',
  },
];

const TRUST_PILLARS: { Icon: React.ElementType; title: string; desc: string }[] = [
  {
    Icon: Search,
    title: 'Equipos Verificados',
    desc: 'Cada iPhone pasa por un control de calidad antes de ser enviado.',
  },
  {
    Icon: Lock,
    title: 'Pagos Protegidos',
    desc: 'Aceptamos Yape, Plin y tarjeta. Todos tus pagos quedan registrados.',
  },
  {
    Icon: Radio,
    title: 'Seguimiento en Tiempo Real',
    desc: 'Tu dashboard muestra el estado de cada cuota y el envío al instante.',
  },
  {
    Icon: MessageCircle,
    title: 'Soporte por WhatsApp',
    desc: 'Contáctanos directamente. Respondemos rápido, sin bots.',
  },
];
