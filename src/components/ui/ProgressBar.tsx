'use client';

/**
 * ProgressBar — visual indicator of installment payment progress.
 * Used in the client dashboard to show "X of N cuotas pagadas".
 */

import { clsx } from 'clsx';

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  /** Descriptive label shown above the bar */
  label?: string;
  /** Text shown on the right side (e.g. "8 / 12 cuotas") */
  rightLabel?: string;
  /** Visual height of the bar */
  height?: 'sm' | 'md' | 'lg';
  /** Color variant — defaults to accent blue */
  variant?: 'accent' | 'success' | 'warning' | 'danger';
  animated?: boolean;
  className?: string;
}

const HEIGHT_CLASSES = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const BAR_COLORS = {
  accent:  'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger:  'bg-danger',
};

export function ProgressBar({
  value,
  label,
  rightLabel,
  height = 'md',
  variant = 'accent',
  animated = true,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={clsx('w-full', className)}>
      {(label || rightLabel) && (
        <div className="flex justify-between items-baseline mb-2">
          {label    && <span className="text-label text-text-secondary">{label}</span>}
          {rightLabel && <span className="text-label text-text-primary font-semibold">{rightLabel}</span>}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progreso'}
        className={clsx(
          'w-full rounded-full bg-bg-secondary overflow-hidden',
          HEIGHT_CLASSES[height]
        )}
      >
        <div
          className={clsx(
            'h-full rounded-full',
            BAR_COLORS[variant],
            animated && 'transition-all duration-700 ease-out'
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
