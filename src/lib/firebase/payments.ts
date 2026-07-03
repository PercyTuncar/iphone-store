/**
 * Firestore CRUD for the `payments` collection
 * Each document represents one installment payment for an order.
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
import type { Payment, PaymentStatus } from '@/types/payment';

const COLLECTION = 'payments';

function toPayment(id: string, data: DocumentData): Payment {
  return { id, ...data } as Payment;
}

/** Create a new payment/installment record */
export async function createPayment(
  data: Omit<Payment, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Get a payment by Firestore ID */
export async function getPaymentById(id: string): Promise<Payment | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return toPayment(snap.id, snap.data());
}

/** Get all installments for an order, sorted by installment number */
export async function getPaymentsByOrder(orderId: string): Promise<Payment[]> {
  const q = query(
    collection(db, COLLECTION),
    where('orderId', '==', orderId),
    orderBy('installmentNumber', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPayment(d.id, d.data()));
}

/** Get all payments with status "pending_approval" — admin queue */
export async function getPendingPayments(): Promise<Payment[]> {
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', 'pending_approval'),
    orderBy('voucherUploadedAt', 'asc') // FIFO — oldest first
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPayment(d.id, d.data()));
}

/**
 * Admin approves a payment.
 * The caller (Server Action) is responsible for:
 * 1. Updating the order status if this is installment 1
 * 2. Creating subsequent installment docs if installment 1
 * 3. Unlocking the next installment
 * 4. Writing to audit_logs
 */
export async function approvePayment(
  paymentId: string,
  adminUid: string
): Promise<void> {
  const ref = doc(db, COLLECTION, paymentId);
  await updateDoc(ref, {
    status: 'approved' as PaymentStatus,
    approvedBy: adminUid,
    approvedAt: serverTimestamp(),
  });
}

/**
 * Admin rejects a payment.
 * Sets a 24-hour resubmit deadline for installments > 1.
 * For installment 1, the order is NOT advanced (process does not start).
 */
export async function rejectPayment(
  paymentId: string,
  reason: string,
  installmentNumber: number
): Promise<void> {
  const ref = doc(db, COLLECTION, paymentId);
  const now = new Date();
  // 24-hour deadline only applies to installments 2+
  const resubmitDeadline =
    installmentNumber > 1
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000)
      : null;

  await updateDoc(ref, {
    status: 'rejected' as PaymentStatus,
    rejectionReason: reason,
    rejectedAt: serverTimestamp(),
    resubmitDeadline: resubmitDeadline,
  });
}

/** Submit a voucher for an existing open payment */
export async function submitVoucher(
  paymentId: string,
  voucherUrl: string,
  uploadedBy: 'customer' | 'admin'
): Promise<void> {
  const ref = doc(db, COLLECTION, paymentId);
  await updateDoc(ref, {
    status: 'pending_approval' as PaymentStatus,
    voucherUrl,
    voucherUploadedAt: serverTimestamp(),
    voucherUploadedBy: uploadedBy,
  });
}

/** Unlock an installment (change from 'locked' to 'open') */
export async function unlockPayment(paymentId: string): Promise<void> {
  const ref = doc(db, COLLECTION, paymentId);
  await updateDoc(ref, { status: 'open' as PaymentStatus });
}

/** Mark an installment as covered by insurance */
export async function coverWithInsurance(paymentId: string): Promise<void> {
  const ref = doc(db, COLLECTION, paymentId);
  await updateDoc(ref, { status: 'insured' as PaymentStatus });
}

/** Partial update on any payment fields */
export async function updatePayment(
  id: string,
  data: Partial<Omit<Payment, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}
