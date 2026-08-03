/**
 * Footer — global footer for the public site.
 * Dark background (#1D1D1F), Apple-style layout.
 * Server Component — no client state needed.
 */

import Link from 'next/link';
import { IPHONE_MODELS } from '@/lib/constants/iphone-models';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '51944784488';

const FEATURED_MODELS = [
  { label: 'iPhone 17 Pro Max', slug: 'iphone-17-pro-max' },
  { label: 'iPhone 16 Pro Max', slug: 'iphone-16-pro-max' },
  { label: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max' },
  { label: 'iPhone 15 Pro',     slug: 'iphone-15-pro' },
  { label: 'iPhone 15',         slug: 'iphone-15' },
  { label: 'iPhone 14 Pro Max', slug: 'iphone-14-pro-max' },
  { label: 'iPhone 13',         slug: 'iphone-13' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bg-dark text-text-inverted" aria-label="Pie de página">
      <div className="container-main py-16">
        {/* ── Top grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-semibold text-[17px] mb-3">iPhone en Cuotas</p>
            <p className="text-[14px] text-[#86868B] leading-relaxed max-w-[220px] mb-4">
              Tu iPhone nuevo en cómodas cuotas. Sin banco. Sin tarjeta de crédito.
            </p>
            <address className="text-[13px] text-[#86868B] not-italic leading-relaxed mb-4">
              Av. Santo Toribio 163<br />
              San Isidro, Lima 15073<br />
              Perú
            </address>
            <a
              href={`https://wa.me/${WHATSAPP}?text=Hola, quiero consultar sobre los iPhones en cuotas`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 text-[14px] text-[#34C759] hover:text-white transition-colors"
            >
              {/* WhatsApp icon (inline SVG) */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.11 1.523 5.842L0 24l6.344-1.501A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 01-5.046-1.378l-.362-.215-3.755.888.938-3.648-.236-.374A9.9 9.9 0 012.1 12C2.1 6.534 6.534 2.1 12 2.1S21.9 6.534 21.9 12 17.466 21.9 12 21.9z"/>
              </svg>
              Contáctanos por WhatsApp
            </a>
          </div>

          {/* Models */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-[#86868B] mb-4">
              iPhones
            </h3>
            <ul className="space-y-2.5">
              {FEATURED_MODELS.map((m) => (
                <li key={m.slug}>
                  <Link
                    href={`/iphone/${m.slug}`}
                    className="text-[14px] text-[#A1A1A6] hover:text-white transition-colors"
                  >
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-[#86868B] mb-4">
              Información
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Cómo funciona',        href: '/#como-funciona' },
                { label: 'Blog',                  href: '/blog' },
                { label: 'Términos y condiciones',href: '/terminos' },
                { label: 'Preguntas frecuentes',  href: '/#faq' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[14px] text-[#A1A1A6] hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment methods */}
          <div>
            <h3 className="text-[12px] font-semibold uppercase tracking-widest text-[#86868B] mb-4">
              Métodos de Pago
            </h3>
            <div className="flex flex-wrap gap-3">
              {/* Yape */}
              <span className="inline-flex items-center gap-1.5 bg-[#2C2C2E] px-3 py-1.5 rounded-lg text-[13px] text-white">
                <span className="w-4 h-4 rounded-full bg-[#7E2DFF] flex-shrink-0" aria-hidden="true" />
                Yape
              </span>
              {/* Plin */}
              <span className="inline-flex items-center gap-1.5 bg-[#2C2C2E] px-3 py-1.5 rounded-lg text-[13px] text-white">
                <span className="w-4 h-4 rounded-full bg-[#00C896] flex-shrink-0" aria-hidden="true" />
                Plin
              </span>
              {/* Transferencia */}
              <span className="inline-flex items-center gap-1.5 bg-[#2C2C2E] px-3 py-1.5 rounded-lg text-[13px] text-white">
                🏦 Transferencia
              </span>
              {/* Tarjeta */}
              <span className="inline-flex items-center gap-1.5 bg-[#2C2C2E] px-3 py-1.5 rounded-lg text-[13px] text-white">
                💳 Tarjeta
              </span>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-[#3A3A3C] pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-[13px] text-[#86868B]">
              © {year} iPhone en Cuotas. Todos los derechos reservados.
            </p>
            <p className="text-[13px] text-[#86868B]">
              Hecho en{' '}
              <span aria-label="Perú" role="img">🇵🇪</span>{' '}
              Perú
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
