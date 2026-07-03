'use client';
/** Global error boundary */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg-primary px-6 text-center">
      <p className="text-label text-danger uppercase tracking-widest mb-4">Error</p>
      <h1 className="text-section-title mb-4">Algo salió mal</h1>
      <p className="text-body text-text-secondary max-w-sm mb-8">{error.message}</p>
      <button onClick={reset} className="inline-flex items-center justify-center px-8 py-3 bg-accent text-white font-semibold rounded-pill hover:bg-accent-hover transition-colors">
        Intentar de nuevo
      </button>
    </main>
  );
}
