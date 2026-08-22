/**
 * /blog/[slug] — Blog post page (Server Component).
 * PRD §16.3: auto table of contents for posts > 1500 words.
 * PRD §16.4: conversion widget at the end of the article.
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPostBySlug } from '@/lib/firebase/blog';
import { getProductBySlug } from '@/lib/firebase/products';
import { AppImage } from '@/components/ui/AppImage';
import { JsonLd } from '@/components/seo/JsonLd';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { buildBlogSchema } from '@/lib/utils/schema';
import { formatSoles } from '@/lib/utils/currency';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Artículo no encontrado' };
  return {
    title: post.seo.metaTitle,
    description: post.seo.metaDescription,
    alternates: { canonical: post.seo.canonicalUrl },
    openGraph: {
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
      images: [{ url: post.seo.ogImage, width: 1200, height: 630 }],
      type: 'article',
      locale: 'es_PE',
    },
  };
}

/* ── Helpers ──────────────────────────────────────────────────── */

/** Extract H2/H3 headings from HTML for the Table of Contents */
function extractHeadings(html: string): { level: 2 | 3; text: string; id: string }[] {
  const regex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
  const headings: ReturnType<typeof extractHeadings> = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]) as 2 | 3;
    const text  = match[2].replace(/<[^>]+>/g, '').trim();
    const id    = text.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '');
    headings.push({ level, text, id });
  }
  return headings;
}

/** Inject id attributes into H2/H3 tags for anchor links */
function injectHeadingIds(html: string): string {
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h[23]>/gi, (_, level, attrs, content) => {
    const text = content.replace(/<[^>]+>/g, '').trim();
    const id   = text.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '');
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
  });
}

/** Count words in HTML content */
function countWords(html: string): number {
  return html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
}

/* ── Page ─────────────────────────────────────────────────────── */

export default async function BlogPostPage({ params }: Props) {
  const { slug }   = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iphoneencuotas.com';

  // Related product for the conversion widget
  const relatedProduct = post.relatedProductSlug
    ? await getProductBySlug(post.relatedProductSlug).catch(() => null)
    : null;

  const wordCount  = countWords(post.content);
  const showToc    = wordCount > 1500;
  const headings   = showToc ? extractHeadings(post.content) : [];
  const contentWithIds = injectHeadingIds(post.content);

  const publishedStr = post.publishedAt
    ? new Date((post.publishedAt as { toDate(): Date }).toDate())
        .toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <>
      <JsonLd data={buildBlogSchema(post)} />
      <BreadcrumbSchema
        crumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Blog',   url: '/blog' },
          { name: post.title, url: `/blog/${slug}` },
        ]}
        className="container-main max-w-3xl pt-4"
      />

      <article className="min-h-screen bg-bg-primary py-16">
        <div className="container-main max-w-3xl">

          {/* Featured image */}
          {post.featuredImage && (
            <div className="aspect-video rounded-[18px] overflow-hidden mb-10 bg-bg-secondary">
              <AppImage
                src={post.featuredImage}
                alt={post.title}
                width={900}
                height={506}
                priority
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {post.category && (
              <span className="badge badge-accent">{post.category}</span>
            )}
            <span className="text-caption text-text-tertiary">{post.author}</span>
            {publishedStr && (
              <time className="text-caption text-text-tertiary">{publishedStr}</time>
            )}
            <span className="text-caption text-text-tertiary">{wordCount} palabras</span>
          </div>

          {/* Title */}
          <h1 className="text-section-title mb-6">{post.title}</h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-[19px] text-text-secondary leading-relaxed mb-8 pb-8 border-b border-border">
              {post.excerpt}
            </p>
          )}

          {/* Table of Contents — only for articles > 1500 words */}
          {showToc && headings.length > 1 && (
            <nav
              aria-label="Tabla de contenidos"
              className="bg-bg-secondary rounded-[14px] p-5 mb-10"
            >
              <p className="font-semibold text-[15px] mb-3">Tabla de Contenidos</p>
              <ol className="space-y-1.5">
                {headings.map((h) => (
                  <li
                    key={h.id}
                    className={h.level === 3 ? 'ml-4' : ''}
                  >
                    <a
                      href={`#${h.id}`}
                      className="text-[14px] text-accent hover:underline"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Article body */}
          <div
            className="prose max-w-none"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled TipTap HTML
            dangerouslySetInnerHTML={{ __html: contentWithIds }}
          />

          {/* Conversion widget — PRD §16.4 */}
          <div className="mt-16 pt-8 border-t border-border">
            {relatedProduct ? (
              <div className="card p-6 flex gap-5 items-center flex-wrap sm:flex-nowrap">
                <div className="w-20 h-20 rounded-[12px] bg-bg-secondary overflow-hidden flex-shrink-0">
                  <AppImage
                    src={relatedProduct.thumbnailUrl || '/og-default.jpg'}
                    alt={relatedProduct.title}
                    width={80} height={80}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-caption text-accent uppercase tracking-widest mb-1">
                    Disponible en cuotas
                  </p>
                  <p className="font-semibold text-[17px] mb-1">{relatedProduct.title}</p>
                  <p className="text-body text-[15px]">
                    Desde{' '}
                    <strong className="text-text-primary">
                      {relatedProduct.installments} cuotas de {formatSoles(relatedProduct.installmentAmount)}
                    </strong>
                  </p>
                </div>
                <Link
                  href={`/${relatedProduct.slug}`}
                  className="btn btn-primary text-[15px] px-6 py-3 whitespace-nowrap flex-shrink-0"
                >
                  Reservar en Cuotas →
                </Link>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="font-semibold text-[17px] mb-2">
                  ¿Listo para tener tu iPhone?
                </p>
                <p className="text-body mb-5">
                  Elige tu modelo y comienza a pagarlo en cómodas cuotas hoy.
                </p>
                <Link href="/#modelos" className="btn btn-primary px-8 py-3">
                  Ver iPhones disponibles →
                </Link>
              </div>
            )}
          </div>

        </div>
      </article>
    </>
  );
}
