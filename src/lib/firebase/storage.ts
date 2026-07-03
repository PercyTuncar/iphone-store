/**
 * Firebase Storage helpers for uploading and deleting files.
 *
 * Storage paths used:
 *   products/{productId}/{filename}    — product images
 *   vouchers/{orderId}/cuota-{n}.jpg   — payment vouchers
 *   blog/{postId}/{filename}           — blog images
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './config';

/** Upload a product image — returns the public download URL */
export async function uploadProductImage(
  productId: string,
  file: File
): Promise<string> {
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const storageRef = ref(storage, `products/${productId}/${filename}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

/** Upload a payment voucher — returns the public download URL */
export async function uploadVoucher(
  orderId: string,
  installmentNumber: number,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `vouchers/${orderId}/cuota-${installmentNumber}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

/** Upload an image for a blog post */
export async function uploadBlogImage(
  postId: string,
  file: File
): Promise<string> {
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const storageRef = ref(storage, `blog/${postId}/${filename}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

/** Delete a file by its full storage path (gs:// or https URL) */
export async function deleteImage(urlOrPath: string): Promise<void> {
  try {
    const storageRef = ref(storage, urlOrPath);
    await deleteObject(storageRef);
  } catch {
    // File may already be deleted — ignore the error silently
    console.warn(`[storage] Could not delete ${urlOrPath}`);
  }
}
