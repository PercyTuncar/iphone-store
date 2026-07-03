'use client';

/**
 * useInsuranceCoverage — watches the active payment and automatically
 * triggers insurance coverage when the due date passes.
 *
 * PRD §10.3 + §11 Regla 6:
 * "El seguro cubre automáticamente: cuando el seguro está activo y una
 *  cuota vence, el sistema la cubre sin que el cliente deba hacer nada."
 *
 * This hook runs on the client (dashboard page) and calls the server
 * action when: payment is "open", insurance is available, and due date
 * has just passed.
 */

import { useEffect, useRef } from 'react';
import { actionAutoApplyInsurance } from '@/lib/actions/insurance.actions';
import type { Order } from '@/types/order';
import type { Payment } from '@/types/payment';

interface UseInsuranceCoverageOptions {
  order: Order;
  activePayment: Payment | null;
  /** Called after insurance is successfully applied */
  onCovered?: () => void;
}

export function useInsuranceCoverage({
  order,
  activePayment,
  onCovered,
}: UseInsuranceCoverageOptions) {
  const triggeredRef = useRef(false);

  useEffect(() => {
    // Reset the trigger flag when the active payment changes
    triggeredRef.current = false;
  }, [activePayment?.id]);

  useEffect(() => {
    if (triggeredRef.current) return;

    // Only run if the order has active insurance with months remaining
    const ins = order.insurance;
    if (!ins.hasPurchased) return;
    if (ins.monthsUsed >= ins.monthsCovered) return;

    // Only cover an "open" or "overdue" payment
    if (!activePayment) return;
    if (activePayment.status !== 'open' && activePayment.status !== 'overdue') return;

    // Check if the due date has passed
    const dueDate = activePayment.dueDate
      ? (activePayment.dueDate as { toDate(): Date }).toDate()
      : null;

    if (!dueDate || dueDate > new Date()) return;

    // Mark as triggered to prevent double-coverage
    triggeredRef.current = true;

    actionAutoApplyInsurance(order.id, activePayment.id)
      .then((result) => {
        if (result.success) {
          onCovered?.();
        } else {
          triggeredRef.current = false; // allow retry on next render
        }
      })
      .catch(() => {
        triggeredRef.current = false;
      });
  }, [order, activePayment, onCovered]);
}
