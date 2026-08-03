/**
 * Store-wide settings and policies
 * Used for structured data and shared across all products
 */

export interface ReturnPolicySettings {
  applicableCountry: string; // 'PE'
  returnWindowDays: number; // ej. 30
  returnMethod: string; // 'ReturnByMail' | 'ReturnAtStore'
  returnFees: string; // 'FreeReturn' | 'ReturnShippingFees'
}

export interface ShippingSettings {
  addressCountry: string; // 'PE'
  ratePEN: number; // costo de envío en soles
  handlingDaysMin: number; // días de preparación mínimos
  handlingDaysMax: number; // días de preparación máximos
  transitDaysMin: number; // días de tránsito mínimos
  transitDaysMax: number; // días de tránsito máximos
}

export interface StorePolicy {
  returnPolicy: ReturnPolicySettings;
  shipping: ShippingSettings;
  updatedAt?: any; // Firestore Timestamp
}

export interface SiteSettings {
  storeName: string;
  siteUrl: string;
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
}
