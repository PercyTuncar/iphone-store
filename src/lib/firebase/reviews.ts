/**
 * Firestore CRUD for the `reviews` collection
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
import type { Review, ReviewStatus } from '@/types/review';

const COLLECTION = 'reviews';

function toReview(id: string, data: DocumentData): Review {
  return { id, ...data } as Review;
}

/** Get all approved reviews for a product */
export async function getApprovedReviews(productId: string): Promise<Review[]> {
  const q = query(
    collection(db, COLLECTION),
    where('productId', '==', productId),
    where('status', 'in', ['approved', 'featured']),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toReview(d.id, d.data()));
}

/** Get all pending reviews — for admin moderation queue */
export async function getPendingReviews(): Promise<Review[]> {
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc') // oldest first
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toReview(d.id, d.data()));
}

/** Check if a user already has a review for a product */
export async function getUserReviewForProduct(
  userId: string,
  productId: string
): Promise<Review | null> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('productId', '==', productId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return toReview(snap.docs[0].id, snap.docs[0].data());
}

/** Create a new review (status: "pending" by default) */
export async function createReview(
  data: Omit<Review, 'id' | 'createdAt' | 'approvedAt' | 'status'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    status: 'pending' as ReviewStatus,
    createdAt: serverTimestamp(),
    approvedAt: null,
  });
  return ref.id;
}

/** Admin approves a review */
export async function approveReview(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: 'approved' as ReviewStatus,
    approvedAt: serverTimestamp(),
  });
}

/** Admin rejects a review */
export async function rejectReview(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: 'rejected' as ReviewStatus,
  });
}

/** Admin features a review (shows first in listing) */
export async function featureReview(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: 'featured' as ReviewStatus,
    approvedAt: serverTimestamp(),
  });
}

/** Get a review by ID */
export async function getReviewById(id: string): Promise<Review | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return toReview(snap.id, snap.data());
}

/** Get last N featured/approved reviews for homepage testimonials */
export async function getFeaturedReviews(limit = 3): Promise<Review[]> {
  const q = query(
    collection(db, COLLECTION),
    where('status', 'in', ['featured', 'approved']),
    where('rating', '==', 5),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.slice(0, limit).map((d) => toReview(d.id, d.data()));
}
