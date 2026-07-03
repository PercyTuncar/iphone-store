'use server';

/**
 * Server Actions for product CRUD operations (admin only).
 * These run exclusively on the server — Firebase credentials are never exposed.
 */

import { revalidatePath } from 'next/cache';
import {
  createProduct,
  updateProduct,
  publishProduct,
  archiveProduct,
  deleteProduct,
} from '@/lib/firebase/products';
import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/firebase/audit';
import type { Product } from '@/types/product';

/** Admin: create a new product draft */
export async function actionCreateProduct(
  adminId: string,
  adminEmail: string,
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const id = await createProduct(data);
    revalidatePath('/admin/productos');
    revalidatePath('/');
    return { success: true, id };
  } catch (err) {
    console.error('[actionCreateProduct]', err);
    return { success: false, error: 'No se pudo crear el producto.' };
  }
}

/** Admin: update a product */
export async function actionUpdateProduct(
  adminId: string,
  adminEmail: string,
  productId: string,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateProduct(productId, data);
    revalidatePath(`/admin/productos/${productId}`);
    revalidatePath('/admin/productos');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('[actionUpdateProduct]', err);
    return { success: false, error: 'No se pudo actualizar el producto.' };
  }
}

/** Admin: publish a product */
export async function actionPublishProduct(
  adminId: string,
  adminEmail: string,
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await publishProduct(productId);
    await writeAuditLog({
      adminId,
      adminEmail,
      action: AUDIT_ACTIONS.PUBLISH_PRODUCT,
      targetId: productId,
      targetType: 'product',
      details: {},
    });
    revalidatePath('/admin/productos');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('[actionPublishProduct]', err);
    return { success: false, error: 'No se pudo publicar el producto.' };
  }
}

/** Admin: archive a product */
export async function actionArchiveProduct(
  adminId: string,
  adminEmail: string,
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await archiveProduct(productId);
    await writeAuditLog({
      adminId,
      adminEmail,
      action: AUDIT_ACTIONS.ARCHIVE_PRODUCT,
      targetId: productId,
      targetType: 'product',
      details: {},
    });
    revalidatePath('/admin/productos');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('[actionArchiveProduct]', err);
    return { success: false, error: 'No se pudo archivar el producto.' };
  }
}

/** Admin: permanently delete a product */
export async function actionDeleteProduct(
  adminId: string,
  adminEmail: string,
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteProduct(productId);
    await writeAuditLog({
      adminId,
      adminEmail,
      action: AUDIT_ACTIONS.DELETE_PRODUCT,
      targetId: productId,
      targetType: 'product',
      details: {},
    });
    revalidatePath('/admin/productos');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('[actionDeleteProduct]', err);
    return { success: false, error: 'No se pudo eliminar el producto.' };
  }
}
