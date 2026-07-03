import { Timestamp } from 'firebase/firestore';

export type InsurancePlanMonths = 1 | 2 | 3;

export interface InsurancePlan {
  months: InsurancePlanMonths;
  price: number;         // standard price in soles
  checkoutPrice: number; // discounted checkout price (only for 1-month plan)
  label: string;         // e.g. "1 mes de prórroga"
  description: string;
}

export interface InsurancePurchase {
  id: string; // Firestore document ID (embedded in Order.insurance)
  orderId: string;
  userId: string;
  plan: InsurancePlanMonths;
  monthsCovered: number;
  monthsUsed: number;
  pricePaid: number;
  purchasedAtCheckout: boolean;
  purchasedAt: Timestamp;
}
