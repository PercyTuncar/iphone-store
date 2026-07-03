'use client';

/**
 * Countdown — displays time remaining until a target date.
 * Used for installment due-date alerts in the client dashboard.
 *
 * Visual states:
 *  > 5 days  → blue (normal)
 *  3–5 days  → orange (warning)
 *  < 3 days  → red with fast pulse (urgent)
 *  expired   → red solid
 */

import { clsx } from 'clsx';
import { useCountdown } from '@/lib/hooks/useCountdown';

interface CountdownProps {
  targetDate: Date;
  label?: string;         // e.g. "Cuota 3 vence en"
  className?: string;
  showDays?: boolean;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function Countdown({
  targetDate,
  label,
  className,
  showDays = true,
}: CountdownProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  const isUrgent  = !isExpired && days === 0 && hours < 24;
  const isWarning = !isExpired && days < 3 && !isUrgent;
  const isNormal  = !isExpired && days >= 3;

  const colorClass = clsx(
    isExpired  && 'text-danger',
    isUrgent   && 'text-danger animate-pulse',
    isWarning  && 'text-warning',
    isNormal   && 'text-accent'
  );

  if (isExpired) {
    return (
      <div className={clsx('text-label text-danger font-semibold', className)}>
        {label && <span className="mr-2">{label}</span>}
        <span>Vencido</span>
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && (
        <span className="text-caption text-text-secondary">{label}</span>
      )}
      <div className={clsx('flex items-center gap-1 font-mono font-semibold tabular-nums', colorClass)}>
        {showDays && days > 0 && (
          <>
            <span className="text-subtitle">{days}d</span>
            <span className="text-text-tertiary mx-1">·</span>
          </>
        )}
        <span className="text-subtitle">{pad(hours)}</span>
        <span className="animate-pulse">:</span>
        <span className="text-subtitle">{pad(minutes)}</span>
        <span className="animate-pulse">:</span>
        <span className="text-subtitle">{pad(seconds)}</span>
      </div>
    </div>
  );
}
