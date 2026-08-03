/**
 * BreadcrumbSchema — renders both a visible breadcrumb nav and
 * the matching JSON-LD BreadcrumbList for Google.
 *
 * Usage:
 *   <BreadcrumbSchema
 *     crumbs={[
 *       { name: 'Inicio', url: '/' },
 *       { name: 'iPhone 15 Pro Max', url: '/iphone/iphone-15-pro-max' },
 *     ]}
 *   />
 */

import Link from 'next/link';
import { JsonLd } from './JsonLd';
import { buildBreadcrumbSchema } from '@/lib/utils/schema';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface Crumb {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  crumbs: Crumb[];
  className?: string;
}

export function BreadcrumbSchema({ crumbs, className }: BreadcrumbSchemaProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iphoneencuotas.com';

  // Build absolute URLs for the schema
  const absoluteCrumbs = crumbs.map((c) => ({
    name: c.name,
    url: c.url.startsWith('http') ? c.url : `${siteUrl}${c.url}`,
  }));

  return (
    <>
      {/* JSON-LD schema (invisible, for Google) */}
      <JsonLd data={buildBreadcrumbSchema(absoluteCrumbs)} />

      {/* Visible breadcrumb nav */}
      <nav
        aria-label="Ruta de navegación"
        className={clsx(
          'pt-[30px] md:pt-[76px] pb-3', // Mobile: 30px | Desktop: 76px (60px navbar + 16px)
          className
        )}
      >
        <ol className="flex items-center flex-wrap gap-1 text-caption text-text-secondary">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={crumb.url} className="flex items-center gap-1">
                {isLast ? (
                  <span aria-current="page" className="text-text-primary font-medium">
                    {crumb.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={crumb.url}
                      className="hover:text-accent transition-colors"
                    >
                      {crumb.name}
                    </Link>
                    <ChevronRight
                      size={12}
                      aria-hidden="true"
                      className="text-text-tertiary flex-shrink-0"
                    />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
