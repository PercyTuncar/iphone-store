'use client';

/**
 * /admin/blog — blog post list with create button.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Eye, Edit3 } from 'lucide-react';
import { getAllPosts } from '@/lib/firebase/blog';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import type { BlogPost } from '@/types/blog';

export default function AdminBlogPage() {
  const [posts,   setPosts]   = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPosts().then(setPosts).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-section-title mb-1">Blog</h1>
          <p className="text-body text-text-secondary">{posts.length} artículo{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/blog/nuevo" className="btn btn-primary text-[15px] px-5 py-2.5 flex items-center gap-2">
          <Plus size={16} /> Nuevo artículo
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={36} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-subtitle text-[17px] mb-1">Sin artículos</p>
          <p className="text-body text-text-secondary mb-5">Crea el primer artículo del blog.</p>
          <Link href="/admin/blog/nuevo" className="btn btn-primary px-6 py-2.5">Nuevo artículo</Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden divide-y divide-border">
          {posts.map(post => (
            <div key={post.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-bg-secondary/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] truncate">{post.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant={post.status === 'published' ? 'success' : 'neutral'}>
                    {post.status === 'published' ? 'Publicado' : 'Borrador'}
                  </Badge>
                  {post.category && <span className="text-caption text-text-tertiary">{post.category}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {post.status === 'published' && (
                  <Link href={`/blog/${post.slug}`} target="_blank"
                    className="flex items-center gap-1 text-label text-text-secondary hover:text-accent transition-colors">
                    <Eye size={15} /> Ver
                  </Link>
                )}
                <Link href={`/admin/blog/${post.id}`}
                  className="flex items-center gap-1 text-label text-accent hover:underline">
                  <Edit3 size={15} /> Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
