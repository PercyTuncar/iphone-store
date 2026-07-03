import type { InsurancePlan } from '@/types/insurance';

/**
 * Default insurance plan definitions.
 * Actual prices are stored per-product in Firestore.
 * These are the base descriptions used in the UI.
 */
export const INSURANCE_PLANS: InsurancePlan[] = [
  {
    months: 1,
    price: 49,            // standard price (overridden by product.insurancePlan1Month)
    checkoutPrice: 29,    // checkout discount (overridden by product.insuranceCheckoutDiscount1Month)
    label: '1 mes de prórroga',
    description: 'Cubre 1 cuota vencida. Disponible en checkout por precio especial.',
  },
  {
    months: 2,
    price: 89,
    checkoutPrice: 89,    // no checkout discount for 2-month plan
    label: '2 meses de prórroga',
    description: 'Cubre hasta 2 cuotas vencidas durante todo el plan.',
  },
  {
    months: 3,
    price: 99,
    checkoutPrice: 99,
    label: '3 meses de prórroga',
    description: 'La máxima protección: cubre hasta 3 cuotas vencidas.',
  },
];
