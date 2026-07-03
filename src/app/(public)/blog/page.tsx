/**
 * /blog — Blog listing page (Server Component).
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPublishedPosts } from '@/lib/firebase/blog';
import { AppImage } from '@/components/ui/AppImage';
import { Badge } from '@/components/ui/Badge';
import type { BlogPostCard } from '@/types/blog';

export const metadata: Metadata = {
  title: 'Blog — iPhone en Cuotas',
  description: 'Guías, comparativas y novedades sobre iPhones en Perú. Aprende cómo comprar tu iPhone en cuotas sin tarjeta.',
};

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await getAllPublishedPosts().catch(() => [] as BlogPostCard[]);

  return (
    <main className="min-h-screen bg-bg-primary py-20">
      <div className="container-main">
        <div className="text-center mb-14">
          <h1 className="text-section-title mb-4">Blog</h1>
          <p className="text-body max-w-lg mx-auto">
            Guías, comparativas y todo lo que necesitas saber para comprar tu iPhone en cuotas en Perú.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-body text-text-secondary py-12">
            Próximamente — estamos preparando artículos para ti.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function BlogCard({ post }: { post: BlogPostCard }) {
  const dateStr = post.publishedAt
    ? new Date((post.publishedAt as { toDate(): Date }).toDate())
        .toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <Link href={`/blog/${post.slug}`} className="card flex flex-col no-underline group">
      {post.featuredImage && (
        <div className="aspect-video overflow-hidden rounded-t-[18px] bg-bg-secondary">
          <AppImage
            src={post.featuredImage}
            alt={post.title}
            width={600}
            height={340}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        {post.category && (
          <Badge variant="accent" className="mb-3 self-start">{post.category}</Badge>
        )}
        <h2 className="font-semibold text-[17px] text-text-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">
          {post.title}
        </h2>
        <p className="text-body text-[15px] line-clamp-3 flex-1">{post.excerpt}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-caption text-text-tertiary">{post.author}</span>
          {dateStr && <time className="text-caption text-text-tertiary">{dateStr}</time>}
        </div>
      </div>
    </Link>
  );
}
