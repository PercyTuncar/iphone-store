/**
 * Date helpers for installment calculations and overdue detection.
 * Uses date-fns for reliability with Peruvian locale (America/Lima).
 */

import {
  addMonths,
  differenceInCalendarDays,
  isAfter,
  isBefore,
  format,
  formatDistanceToNow,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { Timestamp } from 'firebase/firestore';

/** Convert a Firestore Timestamp to a JS Date */
export function toDate(ts: Timestamp): Date {
  return ts.toDate();
}

/**
 * Calculate the due date for installment N.
 * @param approvedAt — date the first payment was approved
 * @param installmentNumber — 1-based installment index
 */
export function calcDueDate(approvedAt: Date, installmentNumber: number): Date {
  // Installment 1 is already paid — installment 2 is due 1 month later, etc.
  return addMonths(approvedAt, installmentNumber - 1);
}

/**
 * Returns the number of days overdue for a payment.
 * Returns 0 if the payment is not yet overdue.
 */
export function daysOverdue(dueDate: Date): number {
  const now = new Date();
  if (!isAfter(now, dueDate)) return 0;
  return differenceInCalendarDays(now, dueDate);
}

/** Returns true if the payment due date has already passed */
export function isOverdue(dueDate: Date): boolean {
  return isAfter(new Date(), dueDate);
}

/** Returns true if the due date is within the next N days (inclusive) */
export function isDueSoon(dueDate: Date, withinDays: number): boolean {
  const now = new Date();
  const threshold = addMonths(now, 0); // start from now
  threshold.setDate(threshold.getDate() + withinDays);
  return !isOverdue(dueDate) && isBefore(dueDate, threshold);
}

/**
 * Format a date for display in the UI.
 * formatDueDate(date) → "20 de julio, 2025"
 */
export function formatDueDate(date: Date): string {
  return format(date, "d 'de' MMMM, yyyy", { locale: es });
}

/**
 * Returns a human-readable relative time string.
 * relativeTime(pastDate) → "hace 3 días"
 */
export function relativeTime(date: Date): string {
  return formatDistanceToNow(date, { locale: es, addSuffix: true });
}

/**
 * Returns milliseconds until the given date (for countdown timers).
 * Returns 0 if the date has already passed.
 */
export function msUntil(date: Date): number {
  const diff = date.getTime() - Date.now();
  return Math.max(0, diff);
}
