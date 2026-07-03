'use server';

/**
 * Server Actions for the insurance extension system (Fase 7).
 */

import { revalidatePath } from 'next/cache';
import { purchaseInsurance, useInsuranceMonth } from '@/lib/firebase/insurance';
import { coverWithInsurance } from '@/lib/firebase/payments';
import { updateOrder } from '@/lib/firebase/orders';
import { Timestamp } from 'firebase/firestore';
import type { InsurancePlanMonths } from '@/types/insurance';

/**
 * Customer: purchase an insurance plan from the dashboard.
 * Validates that the purchase happens before the active due date.
 */
export async function actionPurchaseInsurance(
  orderId: string,
  plan: InsurancePlanMonths,
  purchasedAtCheckout: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await purchaseInsurance(orderId, plan, purchasedAtCheckout);
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/pedido/${orderId}`);
    return { success: true };
  } catch (err) {
    console.error('[actionPurchaseInsurance]', err);
    return { success: false, error: 'No se pudo activar el seguro.' };
  }
}

/**
 * System: automatically cover an overdue installment with the active insurance.
 * Called when a payment due date passes and the order has insurance remaining.
 *
 * What it does:
 *  1. Changes payment status → "insured"
 *  2. Increments order.insurance.monthsUsed
 *  3. Sets a new due date 1 month later on the payment document
 */
export async function actionAutoApplyInsurance(
  orderId: string,
  paymentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Mark the payment as insured
    await coverWithInsurance(paymentId);

    // Record the used month on the order
    await useInsuranceMonth(orderId);

    // Extend the payment due date by 1 month
    const newDue = new Date();
    newDue.setMonth(newDue.getMonth() + 1);
    await updateOrder(orderId, {
      [`payments.${paymentId}.dueDate`]: Timestamp.fromDate(newDue),
    });

    revalidatePath(`/dashboard/pedido/${orderId}`);
    return { success: true };
  } catch (err) {
    console.error('[actionAutoApplyInsurance]', err);
    return { success: false, error: 'No se pudo aplicar el seguro.' };
  }
}
