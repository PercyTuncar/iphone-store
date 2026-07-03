/**
 * Audit log writer for admin actions.
 * Every significant admin action creates a document in `audit_logs`.
 *
 * This is a write-only helper — reads happen in the admin UI.
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './config';

export type AuditTargetType = 'payment' | 'order' | 'product' | 'review';

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;     // e.g. "APPROVE_PAYMENT", "PUBLISH_PRODUCT"
  targetId: string;   // Firestore document ID of the affected resource
  targetType: AuditTargetType;
  details: Record<string, unknown>;
  timestamp: ReturnType<typeof serverTimestamp>;
}

const COLLECTION = 'audit_logs';

/** Write an audit log entry */
export async function writeAuditLog(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<void> {
  await addDoc(collection(db, COLLECTION), {
    ...entry,
    timestamp: serverTimestamp(),
  });
}

/** Get audit logs — for admin /admin/auditoria page */
export async function getAuditLogs(
  filters: {
    targetType?: AuditTargetType;
    targetId?: string;
    adminId?: string;
  } = {}
): Promise<AuditLogEntry[]> {
  let q = query(collection(db, COLLECTION), orderBy('timestamp', 'desc'));

  if (filters.targetType) {
    q = query(q, where('targetType', '==', filters.targetType));
  }
  if (filters.targetId) {
    q = query(q, where('targetId', '==', filters.targetId));
  }
  if (filters.adminId) {
    q = query(q, where('adminId', '==', filters.adminId));
  }

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as DocumentData),
  })) as AuditLogEntry[];
}

// ─── Typed action constants ──────────────────────────────────────────────────
export const AUDIT_ACTIONS = {
  APPROVE_PAYMENT: 'APPROVE_PAYMENT',
  REJECT_PAYMENT: 'REJECT_PAYMENT',
  PUBLISH_PRODUCT: 'PUBLISH_PRODUCT',
  ARCHIVE_PRODUCT: 'ARCHIVE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  APPROVE_REVIEW: 'APPROVE_REVIEW',
  REJECT_REVIEW: 'REJECT_REVIEW',
  FEATURE_REVIEW: 'FEATURE_REVIEW',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
  UPDATE_DELIVERY_STATUS: 'UPDATE_DELIVERY_STATUS',
  SEND_ABANDONMENT_NOTIFICATION: 'SEND_ABANDONMENT_NOTIFICATION',
  CANCEL_ORDER: 'CANCEL_ORDER',
  DEFAULT_ORDER: 'DEFAULT_ORDER',
} as const;
