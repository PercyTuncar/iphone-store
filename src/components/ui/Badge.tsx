import { clsx } from 'clsx';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'accent';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  danger:  'badge badge-danger',
  info:    'badge badge-info',
  neutral: 'badge badge-neutral',
  accent:  'badge badge-accent',
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  success: 'bg-[#34C759]',
  warning: 'bg-[#FF9F0A]',
  danger:  'bg-[#FF3B30]',
  info:    'bg-[#5AC8FA]',
  neutral: 'bg-[#AEAEB2]',
  accent:  'bg-[#0071E3]',
};

export function Badge({ variant = 'neutral', children, dot = false, className }: BadgeProps) {
  return (
    <span className={clsx(VARIANT_CLASSES[variant], className)}>
      {dot && (
        <span
          className={clsx('inline-block w-1.5 h-1.5 rounded-full', DOT_COLORS[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

/** Maps an order/payment status string to a Badge variant */
export function statusToBadgeVariant(
  status: string
): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    active: 'success',
    approved: 'success',
    delivered: 'success',
    completed: 'success',
    featured: 'success',
    published: 'success',
    open: 'accent',
    pending_approval: 'warning',
    pending_first_payment: 'warning',
    pending: 'warning',
    overdue: 'danger',
    penalized: 'danger',
    rejected: 'danger',
    cancelled: 'danger',
    defaulted: 'danger',
    payment_rejected_first: 'danger',
    locked: 'neutral',
    draft: 'neutral',
    archived: 'neutral',
    insured: 'info',
    delivering: 'info',
    new: 'accent',
    refurbished: 'neutral',
  };
  return map[status] ?? 'neutral';
}
