/**
 * Firestore CRUD for the `orders` collection
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import type { Order, OrderStatus } from '@/types/order';

const COLLECTION = 'orders';

function toOrder(id: string, data: DocumentData): Order {
  return { id, ...data } as Order;
}

/** Create a new order — returns the generated Firestore ID */
export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Get a single order by Firestore ID */
export async function getOrderById(id: string): Promise<Order | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toOrder(snap.id, snap.data());
}

/** Get all orders for a specific customer */
export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toOrder(d.id, d.data()));
}

/** Get all orders — for admin */
export async function getAllOrders(): Promise<Order[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toOrder(d.id, d.data()));
}

/** Get orders by status — for admin filters */
export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toOrder(d.id, d.data()));
}

/** Update an order's status */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

/**
 * Partial update on any order fields.
 * Accepts Firestore dot-notation field paths (e.g. 'delivery.status') as keys.
 */
export async function updateOrder(
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}
