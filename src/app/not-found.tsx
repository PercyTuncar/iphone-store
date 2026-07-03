/**
 * 404 page — Apple-style, minimal and clean
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg-primary px-6 text-center">
      <p className="text-label text-text-tertiary uppercase tracking-widest mb-4">
        Error 404
      </p>
      <h1 className="text-section-title mb-4">Página no encontrada</h1>
      <p className="text-body max-w-sm mb-10">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-8 py-3 bg-accent text-white font-semibold rounded-pill hover:bg-accent-hover transition-colors duration-200"
      >
        Ir al inicio
      </Link>
    </main>
  );
}
