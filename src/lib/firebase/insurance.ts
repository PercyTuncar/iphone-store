/**
 * Insurance logic — reads/writes the insurance sub-object inside Order documents.
 * Insurance state is stored embedded in the order (not a separate collection)
 * to allow atomic reads with the order data.
 */

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import type { InsurancePlanMonths } from '@/types/insurance';
import type { OrderInsurance } from '@/types/order';

const ORDERS_COLLECTION = 'orders';

/**
 * Record an insurance purchase on the order document.
 * Called when the customer buys insurance at checkout OR from the dashboard.
 */
export async function purchaseInsurance(
  orderId: string,
  plan: InsurancePlanMonths,
  purchasedAtCheckout: boolean
): Promise<void> {
  const insurance: OrderInsurance = {
    hasPurchased: true,
    plan,
    monthsCovered: plan,
    monthsUsed: 0,
    purchasedAt: serverTimestamp() as never,
    purchasedAtCheckout,
  };

  await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
    insurance,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Use one month of insurance coverage on an order.
 * Increments monthsUsed. The payment doc is updated separately.
 */
export async function useInsuranceMonth(orderId: string): Promise<void> {
  // We need to read the current value first — use a transaction in production
  // For now, increment via a direct read-update
  const { getOrderById } = await import('./orders');
  const order = await getOrderById(orderId);
  if (!order) return;

  const current = order.insurance;
  if (!current.hasPurchased) return;
  if (current.monthsUsed >= current.monthsCovered) return;

  await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
    'insurance.monthsUsed': current.monthsUsed + 1,
    updatedAt: serverTimestamp(),
  });
}
