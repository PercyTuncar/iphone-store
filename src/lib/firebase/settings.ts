/**
 * Firebase functions for store settings and policies
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import type { StorePolicy, SiteSettings } from '@/types/settings';

const STORE_POLICY_DOC = 'settings/store-policy';
const SITE_SETTINGS_DOC = 'settings/site-settings';

/**
 * Get store policy (return policy + shipping settings)
 * Used for structured data in schema.ts
 */
export async function getStorePolicy(): Promise<StorePolicy | null> {
  try {
    const docRef = doc(db, STORE_POLICY_DOC);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Return default policy if not configured yet
      return getDefaultStorePolicy();
    }

    return docSnap.data() as StorePolicy;
  } catch (error) {
    console.error('[getStorePolicy] Error:', error);
    return getDefaultStorePolicy();
  }
}

/**
 * Update store policy
 */
export async function updateStorePolicy(policy: Omit<StorePolicy, 'updatedAt'>): Promise<void> {
  const docRef = doc(db, STORE_POLICY_DOC);
  await setDoc(docRef, {
    ...policy,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get site settings (contact info, social media, etc.)
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const docRef = doc(db, SITE_SETTINGS_DOC);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return getDefaultSiteSettings();
    }

    return docSnap.data() as SiteSettings;
  } catch (error) {
    console.error('[getSiteSettings] Error:', error);
    return getDefaultSiteSettings();
  }
}

/**
 * Update site settings
 */
export async function updateSiteSettings(settings: SiteSettings): Promise<void> {
  const docRef = doc(db, SITE_SETTINGS_DOC);
  await setDoc(docRef, settings);
}

/**
 * Default store policy (used when not configured yet)
 */
function getDefaultStorePolicy(): StorePolicy {
  return {
    returnPolicy: {
      applicableCountry: 'PE',
      returnWindowDays: 30,
      returnMethod: 'ReturnByMail',
      returnFees: 'ReturnShippingFees',
    },
    shipping: {
      addressCountry: 'PE',
      ratePEN: 20,
      handlingDaysMin: 1,
      handlingDaysMax: 3,
      transitDaysMin: 1,
      transitDaysMax: 5,
    },
  };
}

/**
 * Default site settings
 */
function getDefaultSiteSettings(): SiteSettings {
  return {
    storeName: 'iPhone en Cuotas',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iphoneencuotas.com',
    contactPhone: '+51-944-784-488',
    contactEmail: 'contacto@iphoneencuotas.com',
    whatsappNumber: '51944784488',
    socialMedia: {
      instagram: '',
      facebook: '',
      tiktok: '',
    },
  };
}
