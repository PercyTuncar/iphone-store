/**
 * Migration Script: Add masterProductSlug to existing variants
 *
 * Este script actualiza todas las variantes existentes para agregar el campo
 * masterProductSlug, que es necesario para construir URLs de variantes correctamente.
 *
 * Uso:
 *   npx tsx scripts/add-master-slug-to-variants.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Inicializar Firebase Admin
if (getApps().length === 0) {
  const serviceAccountPath = path.join(process.cwd(), 'service-account-key.json');
  initializeApp({
    credential: cert(serviceAccountPath),
  });
}

const db = getFirestore();

async function migrateVariants() {
  console.log('🚀 Iniciando migración de variantes...\n');

  try {
    // 1. Obtener todas las variantes (productos donde isVariant === true)
    const variantsSnapshot = await db
      .collection('products')
      .where('isVariant', '==', true)
      .get();

    if (variantsSnapshot.empty) {
      console.log('✅ No se encontraron variantes para migrar.');
      return;
    }

    console.log(`📦 Se encontraron ${variantsSnapshot.size} variantes para procesar.\n`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // 2. Para cada variante, obtener el slug del producto maestro
    for (const variantDoc of variantsSnapshot.docs) {
      const variant = variantDoc.data();
      const variantId = variantDoc.id;

      console.log(`🔍 Procesando variante: ${variantId} (${variant.title})`);

      // Si ya tiene masterProductSlug, saltar
      if (variant.masterProductSlug) {
        console.log(`   ⏭️  Ya tiene masterProductSlug: ${variant.masterProductSlug}\n`);
        skippedCount++;
        continue;
      }

      // Verificar que tenga masterProductId
      if (!variant.masterProductId) {
        console.log(`   ⚠️  ADVERTENCIA: No tiene masterProductId, saltando...\n`);
        errorCount++;
        continue;
      }

      try {
        // Obtener el producto maestro
        const masterDoc = await db.collection('products').doc(variant.masterProductId).get();

        if (!masterDoc.exists) {
          console.log(`   ❌ ERROR: Producto maestro ${variant.masterProductId} no existe\n`);
          errorCount++;
          continue;
        }

        const masterProduct = masterDoc.data();
        const masterSlug = masterProduct?.slug;

        if (!masterSlug) {
          console.log(`   ❌ ERROR: Producto maestro no tiene slug\n`);
          errorCount++;
          continue;
        }

        // Actualizar la variante con masterProductSlug
        await db.collection('products').doc(variantId).update({
          masterProductSlug: masterSlug,
        });

        console.log(`   ✅ Actualizado con masterProductSlug: ${masterSlug}\n`);
        successCount++;
      } catch (error) {
        console.log(`   ❌ ERROR al procesar: ${error}\n`);
        errorCount++;
      }
    }

    // 3. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Exitosas:    ${successCount}`);
    console.log(`⏭️  Saltadas:     ${skippedCount} (ya tenían masterProductSlug)`);
    console.log(`❌ Errores:      ${errorCount}`);
    console.log(`📦 Total:        ${variantsSnapshot.size}`);
    console.log('='.repeat(60) + '\n');

    if (errorCount > 0) {
      console.log('⚠️  Algunas variantes tuvieron errores. Revisar el log arriba.');
    } else {
      console.log('🎉 Migración completada exitosamente!');
    }
  } catch (error) {
    console.error('💥 Error fatal durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateVariants()
  .then(() => {
    console.log('\n✨ Script finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error no capturado:', error);
    process.exit(1);
  });
