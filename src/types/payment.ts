import { Timestamp } from 'firebase/firestore';

export type PaymentStatus =
  | 'locked'            // Future installment — not yet active
  | 'open'              // Active, awaiting payment
  | 'pending_approval'  // Voucher uploaded, awaiting admin approval
  | 'approved'          // Approved by admin
  | 'rejected'          // Voucher rejected by admin
  | 'overdue'           // Passed due date without payment
  | 'penalized'         // Penalty applied
  | 'insured';          // Covered by insurance extension

export type VoucherUploader = 'customer' | 'admin';

export interface Payment {
  id: string; // Firestore document ID

  orderId: string;
  userId: string;
  installmentNumber: number; // 1, 2, 3 ... N
  amount: number;            // expected amount in soles
  dueDate: Timestamp;

  // Voucher
  voucherUrl: string | null;
  voucherUploadedAt: Timestamp | null;
  voucherUploadedBy: VoucherUploader | null;

  // Status
  status: PaymentStatus;

  // Penalties
  penaltyApplied: boolean;
  penaltyAmount: number | null;
  penaltyAppliedAt: Timestamp | null;

  // Rejection
  rejectionReason: string | null;
  rejectedAt: Timestamp | null;
  resubmitDeadline: Timestamp | null; // 24h after rejection

  // Approval
  approvedBy: string | null; // admin UID
  approvedAt: Timestamp | null;

  createdAt: Timestamp;
}
