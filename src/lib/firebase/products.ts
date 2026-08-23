/**
 * Firestore CRUD for the `products` collection
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from './config';
import type { Product, ProductCard } from '@/types/product';

const COLLECTION = 'products';

function toProduct(id: string, data: DocumentData): Product {
  return { id, ...data } as Product;
}

/** Get a single product by its URL slug */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(
    collection(db, COLLECTION),
    where('slug', '==', slug),
    where('status', '==', 'published')
  );
  const snap: QuerySnapshot = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return toProduct(docSnap.id, docSnap.data());
}

/** Get all published products — used by Home and sitemap */
export async function getAllPublishedProducts(): Promise<ProductCard[]> {
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', 'published'),
    where('isVariant', '==', false), // Solo productos maestros, no variantes
    orderBy('publishedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      slug: data.slug,
      title: data.title,
      model: data.model,
      storage: data.storage,
      condition: data.condition,
      grade: data.grade,
      thumbnailUrl: data.thumbnailUrl,
      priceTotal: data.priceTotal,
      installments: data.installments,
      installmentAmount: data.installmentAmount,
      stock: data.stock,
      averageRating: data.averageRating,
      reviewCount: data.reviewCount,
      status: data.status,
    } as ProductCard;
  });
}

/** Get ALL products (published + drafts + archived) — used by admin */
export async function getAllProducts(): Promise<Product[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toProduct(d.id, d.data()));
}

/** Get a single product by Firestore document ID */
export async function getProductById(id: string): Promise<Product | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toProduct(snap.id, snap.data());
}

/** Create a new product document */
export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update an existing product — partial update */
export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

/** Publish a product: set status to 'published' and record publishedAt */
export async function publishProduct(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    status: 'published',
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Archive a product (removes from public site but keeps data) */
export async function archiveProduct(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    status: 'archived',
    updatedAt: serverTimestamp(),
  });
}

/** Permanently delete a product document */
export async function deleteProduct(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}

/** Get all variants of a master product by master product ID, including drafts */
export async function getAllVariantsByMasterId(masterProductId: string): Promise<Product[]> {
  const q = query(
    collection(db, COLLECTION),
    where('isVariant', '==', true),
    where('masterProductId', '==', masterProductId),
    orderBy('priceTotal', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toProduct(d.id, d.data()));
}

/** Delete a product variant by document ID */
export async function deleteVariant(id: string): Promise<void> {
  await deleteProduct(id);
}

export async function hasVariants(productId: string): Promise<boolean> {
  const q = query(
    collection(db, COLLECTION),
    where('masterProductId', '==', productId),
    where('status', '==', 'published')
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

/** Get all master products (products that are not variants) */
export async function getAllMasterProducts(): Promise<ProductCard[]> {
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', 'published'),
    where('isVariant', '==', false),
    orderBy('publishedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      slug: data.slug,
      title: data.title,
      model: data.model,
      storage: data.storage,
      condition: data.condition,
      grade: data.grade,
      thumbnailUrl: data.thumbnailUrl,
      priceTotal: data.priceTotal,
      installments: data.installments,
      installmentAmount: data.installmentAmount,
      stock: data.stock,
      averageRating: data.averageRating,
      reviewCount: data.reviewCount,
      status: data.status,
    } as ProductCard;
  });
}

/** Decrement stock by 1 when a reservation is created */
export async function decrementStock(id: string): Promise<void> {
  const product = await getProductById(id);
  if (!product || product.stock <= 0) return;
  await updateDoc(doc(db, COLLECTION, id), {
    stock: product.stock - 1,
    updatedAt: serverTimestamp(),
  });
}

/** Increment stock by 1 when a reservation is cancelled */
export async function incrementStock(id: string): Promise<void> {
  const product = await getProductById(id);
  if (!product) return;
  await updateDoc(doc(db, COLLECTION, id), {
    stock: product.stock + 1,
    updatedAt: serverTimestamp(),
  });
}
