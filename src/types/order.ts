import { Timestamp } from 'firebase/firestore';

export type OrderStatus =
  | 'pending_first_payment'  // Awaiting first payment (24h reservation)
  | 'payment_rejected_first' // First payment rejected — process cancelled
  | 'active'                 // First payment approved, installments ongoing
  | 'completed'              // All installments paid
  | 'delivering'             // Being shipped
  | 'delivered'              // Confirmed delivered by admin
  | 'cancelled'              // Cancelled (expired 24h or cuota cancelled)
  | 'defaulted';             // Missed >15 days — lost device

export type PaymentMethod = 'online' | 'offline';
export type DeliveryStatus = 'not_started' | 'preparing' | 'in_transit' | 'delivered';

export interface ShippingAddress {
  department: string;
  province: string;
  district: string;
  address: string; // street, number, reference
}

export interface OrderInsurance {
  hasPurchased: boolean;
  plan: 1 | 2 | 3 | null;
  monthsCovered: number;
  monthsUsed: number;
  purchasedAt: Timestamp | null;
  purchasedAtCheckout: boolean;
}

export interface OrderDelivery {
  status: DeliveryStatus;
  estimatedDate: Timestamp | null;
  deliveredAt: Timestamp | null;
}

export interface Order {
  id: string; // Firestore document ID

  // References
  userId: string;
  productId: string;
  productSlug: string;
  productTitle: string;    // snapshot at time of purchase
  productThumbnail: string; // snapshot at time of purchase

  // Customer Data
  customerName: string;
  customerDni: string;
  customerEmail: string;
  customerPhone: string;

  // Shipping
  shippingAddress: ShippingAddress;
  shippingCost: number;

  // Financial Configuration
  priceTotal: number;
  installments: number;
  installmentAmount: number;
  downPayment: number;

  // Status
  status: OrderStatus;

  // Insurance
  insurance: OrderInsurance;

  // Delivery
  delivery: OrderDelivery;

  // Metadata
  paymentMethod: PaymentMethod;
  reservedUntil: Timestamp; // 24h deadline for pending_first_payment
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
