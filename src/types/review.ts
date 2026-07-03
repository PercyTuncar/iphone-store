import { Timestamp } from 'firebase/firestore';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'featured';

export interface Review {
  id: string; // Firestore document ID
  productId: string;
  orderId: string;   // Only customers with a "delivered" order can review
  userId: string;
  userName: string;
  userPhoto: string; // Google profile photo URL
  rating: number;    // 1–5
  title: string;
  body: string;
  status: ReviewStatus;
  isSeeded: boolean; // true if loaded by admin as initial seed review
  createdAt: Timestamp;
  approvedAt: Timestamp | null;
}
