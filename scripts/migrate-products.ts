/**
 * Migration script: Add new SEO/Schema fields to existing products
 *
 * Run this once after deploying the new Product type.
 * Usage: node --loader ts-node/esm scripts/migrate-products.ts
 *
 * Adds the following fields to all existing products:
 * - sku (auto-generated from slug)
 * - mpn (null by default)
 * - gtin (null by default)
 * - category (default: "Celulares y Smartphones > iPhone")
 * - googleProductCategoryId (default: "267" - Electronics > Communications > Telephony > Mobile Phones)
 * - productGroupId (derived from model)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar .env.local PRIMERO
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function migrateProducts() {
  console.log('🚀 Starting product migration...\n');

  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();

  if (snapshot.empty) {
    console.log('❌ No products found.');
    return;
  }

  let updatedCount = 0;
  let skippedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const productId = doc.id;

    // Check if product already has new fields
    if (data.sku && data.category && data.googleProductCategoryId && data.productGroupId) {
      console.log(`⏭️  Skipping ${productId} (already migrated)`);
      skippedCount++;
      continue;
    }

    // Generate new fields
    const updates: Record<string, any> = {};

    // SKU: use existing slug or generate from title
    if (!data.sku) {
      updates.sku = data.slug || slugify(data.title || productId);
    }

    // MPN: null by default (admin can fill later with real Apple MPN)
    if (data.mpn === undefined) {
      updates.mpn = null;
    }

    // GTIN: null by default (NEVER auto-generate fake values)
    if (data.gtin === undefined) {
      updates.gtin = null;
    }

    // Category: default for all iPhones
    if (!data.category) {
      updates.category = 'Celulares y Smartphones > iPhone';
    }

    // Google Product Category: 267 = Mobile Phones
    if (!data.googleProductCategoryId) {
      updates.googleProductCategoryId = '267';
    }

    // ProductGroupId: derived from model (all variants of same model share this)
    if (!data.productGroupId) {
      updates.productGroupId = slugify(data.model || data.title || productId);
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      await productsRef.doc(productId).update(updates);
      console.log(`✅ Updated ${productId}:`, updates);
      updatedCount++;
    }
  }

  console.log(`\n✨ Migration complete!`);
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Total:   ${snapshot.size}\n`);
}

// Run migration
migrateProducts()
  .then(() => {
    console.log('✅ Migration finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
