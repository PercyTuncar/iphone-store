/** Default penalty tiers for late payments — admin can override per product */
export interface PenaltyTier {
  minDays: number;
  maxDays: number;
  amount: number; // additional soles added to the installment
  label: string;
}

export const DEFAULT_PENALTY_TIERS: PenaltyTier[] = [
  {
    minDays: 1,
    maxDays: 5,
    amount: 59,
    label: '1–5 días de atraso',
  },
  {
    minDays: 6,
    maxDays: 10,
    amount: 79,
    label: '6–10 días de atraso',
  },
  {
    minDays: 11,
    maxDays: 15,
    amount: 99,
    label: '11–15 días de atraso',
  },
];

/** After this many days overdue the order is auto-cancelled (no refund) */
export const MAX_OVERDUE_DAYS = 15;

/**
 * Returns the penalty amount for a given number of overdue days.
 * Returns null if days is 0.
 * Returns 'cancel' if days > MAX_OVERDUE_DAYS (order must be cancelled).
 */
export function getPenaltyAmount(
  daysOverdue: number
): number | null | 'cancel' {
  if (daysOverdue <= 0) return null;
  if (daysOverdue > MAX_OVERDUE_DAYS) return 'cancel';

  const tier = DEFAULT_PENALTY_TIERS.find(
    (t) => daysOverdue >= t.minDays && daysOverdue <= t.maxDays
  );

  return tier?.amount ?? null;
}
