import { clsx } from 'clsx';

export type SpinnerSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-7 w-7 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;   // sr-only accessible label
}

export function Spinner({ size = 'md', className, label = 'Cargando…' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={clsx('inline-block', className)}>
      <span
        className={clsx(
          'inline-block rounded-full border-current border-t-transparent animate-spin',
          SIZE_CLASSES[size]
        )}
        aria-hidden="true"
      />
    </span>
  );
}

/** Full-page loading overlay */
export function PageSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm z-50">
      <Spinner size="lg" label="Cargando página…" />
    </div>
  );
}

/** Centered loading block for card/section placeholders */
export function BlockSpinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Spinner size="lg" label={label} />
      <p className="text-label text-text-secondary">{label}</p>
    </div>
  );
}
