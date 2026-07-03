'use client';

/**
 * /admin/blog/nuevo — Create a new blog post with TipTap editor.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Globe } from 'lucide-react';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { createPost, publishPost, updatePost } from '@/lib/firebase/blog';
import type { BlogPost } from '@/types/blog';

export default function AdminNuevoPostPage() {
  const router = useRouter();
  const [postId,   setPostId]   = useState<string | null>(null);
  const [content,  setContent]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [meta, setMeta] = useState({
    title: '', slug: '', excerpt: '', category: '',
    author: 'iPhone en Cuotas', featuredImage: '',
    relatedProductSlug: '',
    seoTitle: '', seoDescription: '',
  });

  /** Auto-generate slug from title */
  const handleTitleChange = (title: string) => {
    const slug = title.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-');
    setMeta(m => ({ ...m, title, slug }));
  };

  /** Auto-save draft to Firestore every 30s */
  const autoSave = useCallback(async (html: string) => {
    if (!meta.title.trim()) return;
    const data: Partial<Omit<BlogPost, 'id'>> = {
      title:   meta.title,
      slug:    meta.slug,
      excerpt: meta.excerpt,
      content: html,
      status:  'draft',
      category: meta.category,
      author:   meta.author,
      featuredImage: meta.featuredImage,
      relatedProductSlug: meta.relatedProductSlug || null,
      seo: {
        metaTitle:       meta.seoTitle       || meta.title,
        metaDescription: meta.seoDescription || meta.excerpt,
        ogImage:         meta.featuredImage  || '',
        canonicalUrl:    `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iphoneencuotas.com'}/blog/${meta.slug}`,
      },
      publishedAt: null,
    };
    if (postId) {
      await updatePost(postId, data);
    } else {
      const id = await createPost(data as Omit<BlogPost, 'id' | 'createdAt'>);
      setPostId(id);
    }
  }, [meta, postId]);

  const handleSave = async () => {
    if (!meta.title.trim()) { toast.error('El título es obligatorio.'); return; }
    setSaving(true);
    try {
      await autoSave(content);
      toast.success('Borrador guardado ✓');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!meta.title.trim() || !content.trim()) {
      toast.error('Completa el título y el contenido antes de publicar.');
      return;
    }
    setPublishing(true);
    try {
      await autoSave(content);
      const id = postId ?? (await createPost({
        title: meta.title, slug: meta.slug, excerpt: meta.excerpt,
        content, status: 'draft', category: meta.category,
        author: meta.author, featuredImage: meta.featuredImage,
        relatedProductSlug: meta.relatedProductSlug || null,
        seo: { metaTitle: meta.seoTitle || meta.title, metaDescription: meta.seoDescription, ogImage: meta.featuredImage, canonicalUrl: '' },
        publishedAt: null,
      }));
      await publishPost(id);
      toast.success('¡Artículo publicado! 🎉');
      router.push('/admin/blog');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-section-title">Nuevo Artículo</h1>
        <div className="flex gap-3">
          <Button variant="ghost" loading={saving} onClick={handleSave} leftIcon={<Save size={15} />}>
            Guardar borrador
          </Button>
          <Button variant="primary" loading={publishing} onClick={handlePublish} leftIcon={<Globe size={15} />}>
            Publicar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor — 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <Input
            label="Título"
            required
            value={meta.title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Cómo comprar un iPhone en cuotas sin tarjeta"
          />
          <BlogEditor
            postId={postId ?? undefined}
            onChange={setContent}
            onAutoSave={autoSave}
          />
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-4">
          <div className="card p-4 space-y-4">
            <h2 className="font-semibold text-[15px]">Ajustes del artículo</h2>
            <Input label="Slug (URL)" value={meta.slug}
              onChange={e => setMeta(m => ({ ...m, slug: e.target.value }))}
              placeholder="como-comprar-iphone" />
            <Input label="Categoría" value={meta.category}
              onChange={e => setMeta(m => ({ ...m, category: e.target.value }))}
              placeholder="Guías" />
            <Input label="Autor" value={meta.author}
              onChange={e => setMeta(m => ({ ...m, author: e.target.value }))} />
            <Input label="Imagen destacada (URL)" value={meta.featuredImage}
              onChange={e => setMeta(m => ({ ...m, featuredImage: e.target.value }))}
              placeholder="https://..." />
            <Input label="Producto relacionado (slug)" value={meta.relatedProductSlug}
              onChange={e => setMeta(m => ({ ...m, relatedProductSlug: e.target.value }))}
              hint="Slug del iPhone para el widget de conversión"
              placeholder="iphone-15-pro-max" />
          </div>

          <div className="card p-4 space-y-4">
            <h2 className="font-semibold text-[15px]">SEO</h2>
            <Input label="Meta título" value={meta.seoTitle}
              onChange={e => setMeta(m => ({ ...m, seoTitle: e.target.value }))}
              placeholder="Mismo que el título si se deja vacío" />
            <Textarea label="Meta descripción" value={meta.seoDescription}
              onChange={e => setMeta(m => ({ ...m, seoDescription: e.target.value }))}
              placeholder="Descripción para Google (máx. 160 caracteres)" rows={3} />
            <Textarea label="Extracto (para cards)" value={meta.excerpt}
              onChange={e => setMeta(m => ({ ...m, excerpt: e.target.value }))}
              placeholder="Resumen corto del artículo" rows={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
