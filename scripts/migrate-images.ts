/**
 * Script de migración de imágenes
 *
 * Descarga todas las imágenes de Apple (cdsassets.apple.com, www.apple.com)
 * y las sube a Firebase Storage, actualizando las referencias en Firestore.
 *
 * IMPORTANTE: Ejecutar ANTES de quitar los dominios de Apple de next.config.ts
 *
 * Usage: npx ts-node scripts/migrate-images.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as dotenv from 'dotenv';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Cargar .env.local PRIMERO
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
);

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'iphone-en-cuotas.firebasestorage.app',
});

const db = getFirestore();
const bucket = getStorage().bucket();

interface ImageMigration {
  productId: string;
  oldUrl: string;
  newUrl: string;
  field: 'images' | 'thumbnailUrl';
  index?: number;
}

async function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function uploadToFirebase(
  buffer: Buffer,
  productId: string,
  originalUrl: string
): Promise<string> {
  // Extraer extensión de la URL
  const urlPath = new URL(originalUrl).pathname;
  const ext = path.extname(urlPath) || '.png';

  // Generar nombre único
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const fileName = `products/${productId}/${timestamp}-${random}${ext}`;

  // Subir a Firebase Storage
  const file = bucket.file(fileName);
  await file.save(buffer, {
    metadata: {
      contentType: `image/${ext.replace('.', '')}`,
      metadata: {
        originalUrl,
        migratedAt: new Date().toISOString(),
      },
    },
  });

  // Hacer público
  await file.makePublic();

  // Retornar URL pública
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

async function migrateProductImages() {
  console.log('🚀 Iniciando migración de imágenes...\n');

  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();

  if (snapshot.empty) {
    console.log('❌ No se encontraron productos.');
    return;
  }

  let totalProducts = 0;
  let totalImages = 0;
  let migratedImages = 0;
  let skippedImages = 0;
  let errors = 0;

  const migrations: ImageMigration[] = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const productId = doc.id;
    totalProducts++;

    console.log(`\n📦 Procesando: ${data.title || productId}`);

    // Verificar thumbnailUrl
    if (data.thumbnailUrl) {
      totalImages++;
      const url = data.thumbnailUrl;

      if (url.includes('apple.com') || url.includes('cdsassets.apple.com')) {
        console.log(`  🔄 Migrando thumbnail: ${url.substring(0, 60)}...`);

        try {
          const buffer = await downloadImage(url);
          const newUrl = await uploadToFirebase(buffer, productId, url);

          migrations.push({
            productId,
            oldUrl: url,
            newUrl,
            field: 'thumbnailUrl',
          });

          migratedImages++;
          console.log(`  ✅ Thumbnail migrado`);
        } catch (error) {
          console.error(`  ❌ Error migrando thumbnail:`, error);
          errors++;
        }
      } else {
        console.log(`  ⏭️  Thumbnail ya está en Firebase Storage`);
        skippedImages++;
      }
    }

    // Verificar array de images
    if (data.images && Array.isArray(data.images)) {
      for (let i = 0; i < data.images.length; i++) {
        const url = data.images[i];
        totalImages++;

        if (url.includes('apple.com') || url.includes('cdsassets.apple.com')) {
          console.log(`  🔄 Migrando imagen ${i + 1}/${data.images.length}: ${url.substring(0, 60)}...`);

          try {
            const buffer = await downloadImage(url);
            const newUrl = await uploadToFirebase(buffer, productId, url);

            migrations.push({
              productId,
              oldUrl: url,
              newUrl,
              field: 'images',
              index: i,
            });

            migratedImages++;
            console.log(`  ✅ Imagen ${i + 1} migrada`);
          } catch (error) {
            console.error(`  ❌ Error migrando imagen ${i + 1}:`, error);
            errors++;
          }
        } else {
          console.log(`  ⏭️  Imagen ${i + 1} ya está en Firebase Storage`);
          skippedImages++;
        }
      }
    }
  }

  // Aplicar migraciones a Firestore
  console.log('\n\n📝 Actualizando referencias en Firestore...\n');

  const productUpdates: { [productId: string]: any } = {};

  for (const migration of migrations) {
    if (!productUpdates[migration.productId]) {
      const doc = await productsRef.doc(migration.productId).get();
      productUpdates[migration.productId] = doc.data();
    }

    const product = productUpdates[migration.productId];

    if (migration.field === 'thumbnailUrl') {
      product.thumbnailUrl = migration.newUrl;
    } else if (migration.field === 'images' && migration.index !== undefined) {
      product.images[migration.index] = migration.newUrl;
    }
  }

  // Guardar actualizaciones
  for (const [productId, data] of Object.entries(productUpdates)) {
    await productsRef.doc(productId).update({
      thumbnailUrl: data.thumbnailUrl,
      images: data.images,
      updatedAt: new Date(),
    });
    console.log(`✅ Actualizado producto: ${productId}`);
  }

  // Resumen final
  console.log('\n\n' + '='.repeat(60));
  console.log('✨ MIGRACIÓN COMPLETADA');
  console.log('='.repeat(60));
  console.log(`📦 Productos procesados:      ${totalProducts}`);
  console.log(`🖼️  Total imágenes:            ${totalImages}`);
  console.log(`✅ Imágenes migradas:         ${migratedImages}`);
  console.log(`⏭️  Imágenes ya migradas:      ${skippedImages}`);
  console.log(`❌ Errores:                   ${errors}`);
  console.log('='.repeat(60));

  if (migratedImages > 0) {
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   1. Verifica que las imágenes se vean correctamente en el sitio');
    console.log('   2. Solo después, quita los dominios de Apple de next.config.ts:');
    console.log('      - Elimina: { hostname: "www.apple.com" }');
    console.log('      - Elimina: { hostname: "cdsassets.apple.com" }');
  }
}

// Ejecutar migración
migrateProductImages()
  .then(() => {
    console.log('\n✅ Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
