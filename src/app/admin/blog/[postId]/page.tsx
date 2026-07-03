'use client';

/**
 * /admin/blog/[postId] — Edit an existing blog post.
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, Globe, ArrowLeft, Trash2 } from 'lucide-react';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { getPostById, updatePost, publishPost, deletePost } from '@/lib/firebase/blog';
import Link from 'next/link';
import type { BlogPost } from '@/types/blog';

export default function AdminEditarPostPage() {
  const params  = useParams();
  const postId  = params.postId as string;
  const router  = useRouter();

  const [post,       setPost]       = useState<BlogPost | null>(null);
  const [content,    setContent]    = useState('');
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [meta, setMeta] = useState({
    title: '', slug: '', excerpt: '', category: '',
    author: '', featuredImage: '', relatedProductSlug: '',
    seoTitle: '', seoDescription: '',
  });

  useEffect(() => {
    getPostById(postId).then(p => {
      if (!p) { router.replace('/admin/blog'); return; }
      setPost(p);
      setContent(p.content);
      setMeta({
        title: p.title, slug: p.slug, excerpt: p.excerpt,
        category: p.category, author: p.author,
        featuredImage: p.featuredImage,
        relatedProductSlug: p.relatedProductSlug ?? '',
        seoTitle: p.seo.metaTitle, seoDescription: p.seo.metaDescription,
      });
    }).finally(() => setLoading(false));
  }, [postId, router]);

  const autoSave = useCallback(async (html: string) => {
    if (!meta.title.trim()) return;
    await updatePost(postId, {
      title: meta.title, slug: meta.slug, excerpt: meta.excerpt,
      content: html, category: meta.category, author: meta.author,
      featuredImage: meta.featuredImage,
      relatedProductSlug: meta.relatedProductSlug || null,
      seo: {
        metaTitle: meta.seoTitle || meta.title,
        metaDescription: meta.seoDescription,
        ogImage: meta.featuredImage,
        canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iphoneencuotas.com'}/blog/${meta.slug}`,
      },
    });
  }, [meta, postId]);

  const handleSave = async () => {
    setSaving(true);
    try { await autoSave(content); toast.success('Guardado ✓'); }
    finally { setSaving(false); }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await autoSave(content);
      await publishPost(postId);
      toast.success('Publicado 🎉');
      router.push('/admin/blog');
    } finally { setPublishing(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este artículo? Esta acción es permanente.')) return;
    await deletePost(postId);
    toast.success('Artículo eliminado.');
    router.push('/admin/blog');
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="text-text-secondary hover:text-accent transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-section-title">Editar Artículo</h1>
          {post && (
            <Badge variant={post.status === 'published' ? 'success' : 'neutral'}>
              {post.status === 'published' ? 'Publicado' : 'Borrador'}
            </Badge>
          )}
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button variant="ghost" loading={saving} onClick={handleSave} leftIcon={<Save size={15} />} size="sm">
            Guardar
          </Button>
          {post?.status !== 'published' && (
            <Button variant="primary" loading={publishing} onClick={handlePublish} leftIcon={<Globe size={15} />} size="sm">
              Publicar
            </Button>
          )}
          <Button variant="danger" onClick={handleDelete} leftIcon={<Trash2 size={15} />} size="sm">
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Input label="Título" required value={meta.title}
            onChange={e => setMeta(m => ({ ...m, title: e.target.value }))} />
          <BlogEditor postId={postId} initialContent={content} onChange={setContent} onAutoSave={autoSave} />
        </div>

        <div className="space-y-4">
          <div className="card p-4 space-y-4">
            <h2 className="font-semibold text-[15px]">Ajustes</h2>
            <Input label="Slug" value={meta.slug} onChange={e => setMeta(m => ({ ...m, slug: e.target.value }))} />
            <Input label="Categoría" value={meta.category} onChange={e => setMeta(m => ({ ...m, category: e.target.value }))} />
            <Input label="Autor" value={meta.author} onChange={e => setMeta(m => ({ ...m, author: e.target.value }))} />
            <Input label="Imagen destacada" value={meta.featuredImage} onChange={e => setMeta(m => ({ ...m, featuredImage: e.target.value }))} placeholder="https://..." />
            <Input label="Producto relacionado" value={meta.relatedProductSlug}
              onChange={e => setMeta(m => ({ ...m, relatedProductSlug: e.target.value }))}
              hint="Slug del iPhone para el widget de conversión" placeholder="iphone-15-pro-max" />
          </div>
          <div className="card p-4 space-y-4">
            <h2 className="font-semibold text-[15px]">SEO</h2>
            <Input label="Meta título" value={meta.seoTitle} onChange={e => setMeta(m => ({ ...m, seoTitle: e.target.value }))} />
            <Textarea label="Meta descripción" value={meta.seoDescription}
              onChange={e => setMeta(m => ({ ...m, seoDescription: e.target.value }))} rows={3} />
            <Textarea label="Extracto" value={meta.excerpt}
              onChange={e => setMeta(m => ({ ...m, excerpt: e.target.value }))} rows={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
