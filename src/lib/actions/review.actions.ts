'use server';

/**
 * Server Actions for review moderation (admin).
 * After approve/reject, recalculates the product's averageRating + reviewCount.
 */

import { revalidatePath } from 'next/cache';
import {
  approveReview,
  rejectReview,
  featureReview,
  getApprovedReviews,
} from '@/lib/firebase/reviews';
import { updateProduct } from '@/lib/firebase/products';
import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/firebase/audit';

async function recalcProductRating(productId: string): Promise<void> {
  const approved = await getApprovedReviews(productId);
  const count = approved.length;
  const avg =
    count > 0
      ? approved.reduce((sum, r) => sum + r.rating, 0) / count
      : 0;

  await updateProduct(productId, {
    averageRating: Math.round(avg * 10) / 10,
    reviewCount: count,
  });
}

export async function actionApproveReview(
  adminId: string,
  adminEmail: string,
  reviewId: string,
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await approveReview(reviewId);
    await recalcProductRating(productId);
    await writeAuditLog({
      adminId,
      adminEmail,
      action: AUDIT_ACTIONS.APPROVE_REVIEW,
      targetId: reviewId,
      targetType: 'review',
      details: { productId },
    });
    revalidatePath('/admin/resenas');
    revalidatePath(`/iphone`);
    return { success: true };
  } catch (err) {
    console.error('[actionApproveReview]', err);
    return { success: false, error: 'No se pudo aprobar la reseña.' };
  }
}

export async function actionRejectReview(
  adminId: string,
  adminEmail: string,
  reviewId: string,
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await rejectReview(reviewId);
    await recalcProductRating(productId);
    await writeAuditLog({
      adminId,
      adminEmail,
      action: AUDIT_ACTIONS.REJECT_REVIEW,
      targetId: reviewId,
      targetType: 'review',
      details: { productId },
    });
    revalidatePath('/admin/resenas');
    return { success: true };
  } catch (err) {
    console.error('[actionRejectReview]', err);
    return { success: false, error: 'No se pudo rechazar la reseña.' };
  }
}

export async function actionFeatureReview(
  adminId: string,
  adminEmail: string,
  reviewId: string,
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await featureReview(reviewId);
    await recalcProductRating(productId);
    await writeAuditLog({
      adminId,
      adminEmail,
      action: AUDIT_ACTIONS.FEATURE_REVIEW,
      targetId: reviewId,
      targetType: 'review',
      details: { productId },
    });
    revalidatePath('/admin/resenas');
    return { success: true };
  } catch (err) {
    console.error('[actionFeatureReview]', err);
    return { success: false, error: 'No se pudo destacar la reseña.' };
  }
}
