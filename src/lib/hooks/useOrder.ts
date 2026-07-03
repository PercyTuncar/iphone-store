'use client';

/**
 * useOrder — subscribes to a Firestore order document in real time.
 * When the admin approves a payment, the order status updates instantly
 * without the client needing to reload.
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Order } from '@/types/order';

export function useOrder(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      doc(db, 'orders', orderId),
      (snap) => {
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() } as Order);
        } else {
          setOrder(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('[useOrder] snapshot error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [orderId]);

  return { order, loading, error };
}
