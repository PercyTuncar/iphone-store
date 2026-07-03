/**
 * Firestore CRUD for the `shipping_rates` collection.
 * Single document: shipping_rates/peru_rates
 */

import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from './config';
import { DEFAULT_SHIPPING_RATES } from '@/lib/constants/departments';
import type { ShippingRates } from '@/types/shipping';

const DOC_PATH = 'shipping_rates/peru_rates';

/** Get the current shipping rates. Falls back to defaults if document doesn't exist. */
export async function getShippingRates(): Promise<ShippingRates> {
  const snap = await getDoc(doc(db, DOC_PATH));
  if (!snap.exists()) {
    // Return defaults — admin hasn't configured rates yet
    return { rates: { ...DEFAULT_SHIPPING_RATES } };
  }
  return snap.data() as ShippingRates;
}

/** Get the shipping cost for a specific department (in soles) */
export async function getShippingCost(department: string): Promise<number> {
  const { rates } = await getShippingRates();
  return rates[department] ?? 50; // fallback to 50 if dept not found
}

/** Admin: update rates for all departments at once */
export async function updateShippingRates(
  rates: Record<string, number>
): Promise<void> {
  await setDoc(doc(db, DOC_PATH), { rates }, { merge: true });
}
