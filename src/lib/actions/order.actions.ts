'use server';

/**
 * Server Actions for order operations.
 */

import { revalidatePath } from 'next/cache';
import { updateOrderStatus, updateOrder } from '@/lib/firebase/orders';
import { incrementStock, decrementStock } from '@/lib/firebase/products';
import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/firebase/audit';
import type { OrderStatus, DeliveryStatus } from '@/types/order';

/** Admin: cancel an order and release stock */
export async function actionCancelOrder(
  adminId: string,
  adminEmail: string,
  orderId: string,
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateOrderStatus(orderId, 'cancelled');
    await incrementStock(productId);
    await writeAuditLog({
      adminId,
      adminEmail,
      action: AUDIT_ACTIONS.CANCEL_ORDER,
      targetId: orderId,
      targetType: 'order',
      details: { productId },
    });
    revalidatePath('/admin/pedidos');
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { success: true };
  } catch (err) {
    console.error('[actionCancelOrder]', err);
    return { success: false, error: 'No se pudo cancelar el pedido.' };
  }
}

/** Admin: update delivery status */
export async function actionUpdateDeliveryStatus(
  adminId: string,
  adminEmail: string,
  orderId: string,
  deliveryStatus: DeliveryStatus,
  estimatedDate?: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateOrder(orderId, {
      'delivery.status': deliveryStatus as never,
      ...(estimatedDate
        ? { 'delivery.estimatedDate': estimatedDate as never }
        : {}),
      ...(deliveryStatus === 'delivered'
        ? { status: 'delivered' as OrderStatus, 'delivery.deliveredAt': new Date() as never }
        : {}),
    });
    await writeAuditLog({
      adminId,
      adminEmail,
      action: AUDIT_ACTIONS.UPDATE_DELIVERY_STATUS,
      targetId: orderId,
      targetType: 'order',
      details: { deliveryStatus },
    });
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { success: true };
  } catch (err) {
    console.error('[actionUpdateDeliveryStatus]', err);
    return { success: false, error: 'No se pudo actualizar el estado de envío.' };
  }
}
