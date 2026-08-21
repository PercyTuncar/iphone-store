/**
 * Script de Migración: Agregar campos de variantes a productos existentes
 *
 * Este script es NO DESTRUCTIVO:
 * - Solo agrega campos nuevos si no existen
 * - No modifica campos existentes
 * - No elimina nada
 *
 * Uso: npx tsx scripts/migrate-add-variant-fields.ts
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const COLLECTION = 'products';

interface MigrationStats {
  total: number;
  updated: number;
  skipped: number;
  errors: number;
}

async function migrateProducts() {
  console.log('🚀 Iniciando migración de campos de variantes...\n');

  const stats: MigrationStats = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    // Obtener todos los productos
    const snapshot = await db.collection(COLLECTION).get();
    stats.total = snapshot.size;

    console.log(`📦 Total de productos encontrados: ${stats.total}\n`);

    if (stats.total === 0) {
      console.log('⚠️  No hay productos para migrar.');
      return;
    }

    // Procesar cada producto
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const productId = doc.id;

      try {
        // Verificar si ya tiene los nuevos campos
        const hasNewFields =
          'batteryHealth' in data &&
          'isVariant' in data &&
          'masterProductId' in data;

        if (hasNewFields) {
          console.log(`⏭️  [${productId}] Ya tiene los campos nuevos, omitiendo...`);
          stats.skipped++;
          continue;
        }

        // Preparar actualización (solo agregar campos nuevos)
        const updates: any = {
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Agregar batteryHealth solo si no existe
        if (!('batteryHealth' in data)) {
          // Para productos nuevos: null
          // Para reacondicionados sin dato: asumir 90% (valor conservador)
          updates.batteryHealth = data.condition === 'new' ? null : 90;
        }

        // Agregar isVariant solo si no existe
        if (!('isVariant' in data)) {
          // Todos los productos existentes NO son variantes por defecto
          updates.isVariant = false;
        }

        // Agregar masterProductId solo si no existe
        if (!('masterProductId' in data)) {
          updates.masterProductId = null;
        }

        // Aplicar actualización
        await db.collection(COLLECTION).doc(productId).update(updates);

        console.log(`✅ [${productId}] Actualizado: ${data.title || 'Sin título'}`);
        console.log(`   - batteryHealth: ${updates.batteryHealth ?? 'null'}`);
        console.log(`   - isVariant: ${updates.isVariant}`);
        console.log(`   - masterProductId: ${updates.masterProductId ?? 'null'}\n`);

        stats.updated++;

      } catch (error) {
        console.error(`❌ [${productId}] Error al actualizar:`, error);
        stats.errors++;
      }
    }

    // Resumen final
    console.log('\n═══════════════════════════════════════');
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('═══════════════════════════════════════');
    console.log(`Total de productos:     ${stats.total}`);
    console.log(`✅ Actualizados:        ${stats.updated}`);
    console.log(`⏭️  Omitidos (ya tienen): ${stats.skipped}`);
    console.log(`❌ Errores:             ${stats.errors}`);
    console.log('═══════════════════════════════════════\n');

    if (stats.errors > 0) {
      console.log('⚠️  Hubo errores durante la migración. Revisa los logs arriba.');
      process.exit(1);
    } else if (stats.updated > 0) {
      console.log('🎉 Migración completada exitosamente!');
      console.log('✅ Todos los productos ahora tienen los campos de variantes.\n');
    } else {
      console.log('ℹ️  No se realizaron cambios (todos los productos ya estaban actualizados).\n');
    }

  } catch (error) {
    console.error('❌ Error fatal durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateProducts()
  .then(() => {
    console.log('✅ Script finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
