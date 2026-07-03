'use server';

/**
 * Server Actions for payment approval/rejection (admin).
 *
 * When installment 1 is approved:
 *   - order status → "active"
 *   - creates installment docs 2..N with status "locked"
 *   - unlocks installment 2 immediately
 *
 * When installment 1 is rejected:
 *   - payment stays "rejected", order stays "pending_first_payment"
 *   - stock is released back
 *
 * When installment 2+ is approved:
 *   - unlocks the next installment
 *   - if it was the last one → order status → "completed"
 */

import { revalidatePath } from 'next/cache';
import {
  approvePayment,
  rejectPayment,
  unlockPayment,
  createPayment,
  getPaymentsByOrder,
} from '@/lib/firebase/payments';
import { updateOrderStatus, getOrderById } from '@/lib/firebase/orders';
import { incrementStock } from '@/lib/firebase/products';
import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/firebase/audit';
import { calcDueDate } from '@/lib/utils/dates';
import type { Timestamp } from 'firebase/firestore';
import { Timestamp as FBTimestamp } from 'firebase/firestore';

export async function actionApprovePayment(
  adminId: string,
  adminEmail: string,
  paymentId: string,
  orderId: string,
  installmentNumber: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await approvePayment(paymentId, adminId);

    const order = await getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    if (installmentNumber === 1) {
      // Activate the order
      await updateOrderStatus(orderId, 'active');

      // Create remaining installment documents (2..N) all as "locked"
      const approvedAt = new Date();
      const existingPayments = await getPaymentsByOrder(orderId);
      const existingNumbers = new Set(existingPayments.map((p) => p.installmentNumber));

      for (let n = 2; n <= order.installments; n++) {
        if (existingNumbers.has(n)) continue;
        const dueDate = calcDueDate(approvedAt, n);
        await createPayment({
          orderId,
          userId: order.userId,
          installmentNumber: n,
          amount: order.installmentAmount,
          dueDate: FBTimestamp.fromDate(dueDate) as unknown as Timestamp,
          voucherUrl: null,
          voucherUploadedAt: null,
          voucherUploadedBy: null,
          status: 'locked',
          penaltyApplied: false,
          penaltyAmount: null,
          penaltyAppliedAt: null,
          rejectionReason: null,
          rejectedAt: null,
          resubmitDeadline: null,
          approvedBy: null,
          approvedAt: null,
        });
      }

      // Unlock installment 2
      const refreshed = await getPaymentsByOrder(orderId);
      const inst2 = refreshed.find((p) => p.installmentNumber === 2);
      if (inst2) await unlockPayment(inst2.id);
    } else {
      // Unlock the next installment if it exists
      const allPayments = await getPaymentsByOrder(orderId);
      const next = allPayments.find((p) => p.installmentNumber === installmentNumber + 1);
      if (next && next.status === 'locked') {
        await unlockPayment(next.id);
      }

      // If this was the last installment, mark order as completed
      const allApproved = allPayments
        .filter((p) => p.installmentNumber !== installmentNumber)
        .every((p) => p.status === 'approved');
      const isLast = installmentNumber === order.installments;
      if (isLast && allApproved) {
        await updateOrderStatus(orderId, 'completed');
      }
    }

    await writeAuditLog({
      adminId,
      adminEmail,
      action: AUDIT_ACTIONS.APPROVE_PAYMENT,
      targetId: paymentId,
      targetType: 'payment',
      details: { orderId, installmentNumber },
    });

    revalidatePath('/admin/pagos');
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { success: true };
  } catch (err) {
    console.error('[actionApprovePayment]', err);
    return { success: false, error: 'No se pudo aprobar el pago.' };
  }
}

export async function actionRejectPayment(
  adminId: string,
  adminEmail: string,
  paymentId: string,
  orderId: string,
  installmentNumber: number,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await rejectPayment(paymentId, reason, installmentNumber);

    // For installment 1 — release the reserved stock
    if (installmentNumber === 1) {
      const order = await getOrderById(orderId);
      if (order) await incrementStock(order.productId);
    }

    await writeAuditLog({
      adminId,
      adminEmail,
      action: AUDIT_ACTIONS.REJECT_PAYMENT,
      targetId: paymentId,
      targetType: 'payment',
      details: { orderId, installmentNumber, reason },
    });

    revalidatePath('/admin/pagos');
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { success: true };
  } catch (err) {
    console.error('[actionRejectPayment]', err);
    return { success: false, error: 'No se pudo rechazar el pago.' };
  }
}
