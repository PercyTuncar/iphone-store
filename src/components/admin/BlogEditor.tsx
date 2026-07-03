'use client';

/**
 * BlogEditor — TipTap WYSIWYG editor for blog articles.
 * PRD §16.2: bold, italic, headings H2/H3, lists, blockquote,
 * links, image upload, table, auto-save every 30s.
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CharacterCount from '@tiptap/extension-character-count';
import { clsx } from 'clsx';
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Quote, Link2, ImageIcon, Table2, Minus, RotateCcw, RotateCw,
} from 'lucide-react';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { uploadBlogImage } from '@/lib/firebase/storage';
import { useRef } from 'react';

interface BlogEditorProps {
  postId?: string;
  initialContent?: string;
  onChange: (html: string) => void;
  onAutoSave?: (html: string) => Promise<void>;
  placeholder?: string;
}

export function BlogEditor({
  postId,
  initialContent = '',
  onChange,
  onAutoSave,
  placeholder = 'Escribe el contenido del artículo…',
}: BlogEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CharacterCount,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[400px] px-5 py-4 focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  // Auto-save every 30s
  const { status: saveStatus, lastSavedAt } = useAutoSave<string>(
    async (html) => { if (onAutoSave) await onAutoSave(html); },
    editor?.getHTML() ?? '',
    30_000
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const url = await uploadBlogImage(postId ?? 'temp', file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch {
      console.error('Image upload failed');
    }
    e.target.value = '';
  };

  if (!editor) return (
    <div className="h-64 skeleton rounded-[14px]" aria-label="Cargando editor…" />
  );

  const ToolBtn = ({
    onClick, active = false, disabled = false, title, children,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        'p-2 rounded-lg transition-colors',
        active
          ? 'bg-accent text-white'
          : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary',
        disabled && 'opacity-30 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-border rounded-[14px] overflow-hidden bg-bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-border bg-bg-secondary">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Negrita (Ctrl+B)">
          <Bold size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Cursiva (Ctrl+I)">
          <Italic size={15} />
        </ToolBtn>

        <div className="w-px h-5 bg-border mx-1" aria-hidden="true" />

        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Título H2">
          <Heading2 size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Título H3">
          <Heading3 size={15} />
        </ToolBtn>

        <div className="w-px h-5 bg-border mx-1" aria-hidden="true" />

        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Lista con viñetas">
          <List size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Lista numerada">
          <ListOrdered size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')} title="Cita">
          <Quote size={15} />
        </ToolBtn>

        <div className="w-px h-5 bg-border mx-1" aria-hidden="true" />

        <ToolBtn
          onClick={() => {
            const url = window.prompt('URL del enlace:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive('link')} title="Insertar enlace">
          <Link2 size={15} />
        </ToolBtn>

        <ToolBtn onClick={() => fileRef.current?.click()} title="Insertar imagen">
          <ImageIcon size={15} />
        </ToolBtn>
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />

        <ToolBtn
          onClick={() =>
            editor.chain().focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          title="Insertar tabla">
          <Table2 size={15} />
        </ToolBtn>

        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Separador">
          <Minus size={15} />
        </ToolBtn>

        <div className="w-px h-5 bg-border mx-1" aria-hidden="true" />

        <ToolBtn onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()} title="Deshacer">
          <RotateCcw size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()} title="Rehacer">
          <RotateCw size={15} />
        </ToolBtn>

        {/* Auto-save indicator */}
        {onAutoSave && (
          <span className="ml-auto text-caption text-text-tertiary">
            {saveStatus === 'saving' && 'Guardando…'}
            {saveStatus === 'saved' && lastSavedAt && `Guardado ${lastSavedAt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`}
            {saveStatus === 'error' && '⚠ Error al guardar'}
          </span>
        )}
      </div>

      {/* Editor content area */}
      <EditorContent editor={editor} />

      {/* Character count */}
      <div className="px-5 py-2 border-t border-border text-caption text-text-tertiary text-right">
        {editor.storage.characterCount?.words() ?? 0} palabras ·{' '}
        {editor.storage.characterCount?.characters() ?? 0} caracteres
      </div>
    </div>
  );
}
