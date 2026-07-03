/**
 * Penalty calculation — re-exported from constants for convenience.
 * This module is the single import point for penalty logic across the app.
 */

export { getPenaltyAmount, DEFAULT_PENALTY_TIERS, MAX_OVERDUE_DAYS } from '@/lib/constants/penalty-tiers';
export type { PenaltyTier } from '@/lib/constants/penalty-tiers';

/**
 * Returns a human-readable penalty description for display in the UI.
 * getPenaltyLabel(3) → "S/ 59 por atraso (1–5 días)"
 */
export function getPenaltyLabel(daysOverdue: number): string {
  if (daysOverdue <= 0) return '';
  if (daysOverdue > 15) return 'Pedido cancelado — más de 15 días de atraso';
  if (daysOverdue <= 5) return 'Penalidad: S/ 59 adicionales (1–5 días de atraso)';
  if (daysOverdue <= 10) return 'Penalidad: S/ 79 adicionales (6–10 días de atraso)';
  return 'Penalidad: S/ 99 adicionales (11–15 días de atraso)';
}
