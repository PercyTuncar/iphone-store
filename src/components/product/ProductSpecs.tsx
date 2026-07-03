/**
 * ProductSpecs — technical specifications section.
 * Apple-style subsection layout with H2 + H3 hierarchy for SEO.
 */

import { Monitor, Cpu, Camera, Battery, Wifi, Apple } from 'lucide-react';
import type { ProductSpecs as Specs } from '@/types/product';

interface ProductSpecsProps {
  specs: Specs;
}

const SPEC_SECTIONS = [
  { id: 'pantalla',     h3: 'Pantalla y Diseño',   Icon: Monitor, key: 'display'      as const },
  { id: 'chip',         h3: 'Chip y Rendimiento',   Icon: Cpu,     key: 'chip'         as const },
  { id: 'camara',       h3: 'Sistema de Cámara',    Icon: Camera,  key: 'camera'       as const },
  { id: 'bateria',      h3: 'Batería',              Icon: Battery, key: 'battery'      as const },
  { id: 'conectividad', h3: 'Conectividad',         Icon: Wifi,    key: 'connectivity' as const },
  { id: 'software',     h3: 'Software',             Icon: Apple,   key: 'os'           as const },
];

export function ProductSpecs({ specs }: ProductSpecsProps) {
  return (
    <section
      aria-labelledby="specs-title"
      className="py-20"
      style={{ background: 'linear-gradient(160deg, #F5F7FF 0%, #F5F5F7 100%)' }}
    >
      <div className="container-main">
        <h2
          id="specs-title"
          className="text-section-title text-center mb-12"
        >
          Características Técnicas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPEC_SECTIONS.map(({ id, h3, Icon, key }) => {
            const value = specs?.[key];
            if (!value) return null;
            return (
              <div key={id} className="card p-6">
                <div
                  className="w-10 h-10 rounded-[10px] bg-accent/10 flex items-center justify-center mb-4"
                  aria-hidden="true"
                >
                  <Icon size={20} className="text-accent" />
                </div>
                <h3 className="font-semibold text-[17px] text-text-primary mb-2">{h3}</h3>
                <p className="text-body text-[15px] leading-relaxed">{value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
