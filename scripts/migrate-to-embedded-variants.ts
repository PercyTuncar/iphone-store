/**
 * Migración: De productos separados a variantes embebidas
 *
 * ANTES: 3 documentos en products collection
 *   - 9alYt7c7jXxWRqKBf893 (maestro, isVariant: false)
 *   - CfqbEcHktAwYAd6bCGAy (variante 1, isVariant: true)
 *   - P98ritvQxAjmcAL7dBpM (variante 2, isVariant: true)
 *
 * DESPUÉS: 1 documento con array variants[]
 *   - 9alYt7c7jXxWRqKBf893 (maestro con variants: [{...}, {...}])
 *   - CfqbEcHktAwYAd6bCGAy (se elimina)
 *   - P98ritvQxAjmcAL7dBpM (se elimina)
 *
 * Uso: npx tsx scripts/migrate-to-embedded-variants.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

if (getApps().length === 0) {
  const serviceAccountPath = path.join(process.cwd(), 'service-account-key.json');
  initializeApp({
    credential: cert(serviceAccountPath),
  });
}

const db = getFirestore();

async function migrateToEmbeddedVariants() {
  console.log('🚀 Iniciando migración a variantes embebidas...\n');

  try {
    // 1. Obtener todos los productos maestros (isVariant: false)
    const mastersSnapshot = await db
      .collection('products')
      .where('isVariant', '==', false)
      .get();

    if (mastersSnapshot.empty) {
      console.log('⚠️  No se encontraron productos maestros.');
      return;
    }

    console.log(`📦 Encontrados ${mastersSnapshot.size} productos maestros\n`);

    let processedCount = 0;
    let errorCount = 0;

    for (const masterDoc of mastersSnapshot.docs) {
      const masterId = masterDoc.id;
      const master = masterDoc.data();

      console.log(`\n${'='.repeat(70)}`);
      console.log(`📱 Procesando: ${master.model} (${masterId})`);
      console.log(`${'='.repeat(70)}`);

      // 2. Buscar variantes hijas de este maestro
      const variantsSnapshot = await db
        .collection('products')
        .where('isVariant', '==', true)
        .where('masterProductId', '==', masterId)
        .get();

      console.log(`   Variantes encontradas: ${variantsSnapshot.size}`);

      if (variantsSnapshot.empty) {
        console.log('   ⏭️  Sin variantes, saltando...');
        continue;
      }

      // 3. Construir array de variantes
      const variantsArray = [];

      for (const variantDoc of variantsSnapshot.docs) {
        const variant = variantDoc.data();
        const variantId = variantDoc.id;

        console.log(`\n   📦 Variante: ${variant.storage} ${variant.color}`);
        console.log(`      ID original: ${variantId}`);
        console.log(`      Stock: ${variant.stock}`);
        console.log(`      Precio: S/ ${variant.priceTotal}`);

        // Construir objeto de variante embebida
        const embeddedVariant = {
          id: variantId, // Mantener el ID original para URLs
          storage: variant.storage,
          color: variant.color,
          condition: variant.condition,
          grade: variant.grade || null,
          batteryHealth: variant.batteryHealth || null,
          priceTotal: variant.priceTotal,
          stock: variant.stock,
          sku: variant.sku,
          images: variant.images || [],
          thumbnailUrl: variant.thumbnailUrl || master.thumbnailUrl,
          status: variant.status,
        };

        variantsArray.push(embeddedVariant);
      }

      // 4. Actualizar el producto maestro con el array de variantes
      console.log(`\n   💾 Actualizando producto maestro con ${variantsArray.length} variantes...`);

      await db.collection('products').doc(masterId).update({
        variants: variantsArray,
        updatedAt: new Date(),
      });

      console.log('   ✅ Producto maestro actualizado');

      // 5. Eliminar los documentos de variantes separados
      console.log('\n   🗑️  Eliminando documentos de variantes antiguas...');

      for (const variantDoc of variantsSnapshot.docs) {
        await db.collection('products').doc(variantDoc.id).delete();
        console.log(`      ✅ Eliminado: ${variantDoc.id}`);
      }

      processedCount++;
      console.log(`\n   ✨ Migración completada para ${master.model}`);
    }

    // 6. Resumen final
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(70));
    console.log(`✅ Productos migrados: ${processedCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log('='.repeat(70));

    console.log('\n🎉 Migración completada exitosamente!');
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Verifica la estructura en Firestore Console');
    console.log('   2. Prueba la página pública: http://localhost:3000/[slug]');
    console.log('   3. Verifica que el selector de variantes aparezca');

  } catch (error) {
    console.error('💥 Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateToEmbeddedVariants()
  .then(() => {
    console.log('\n✨ Script finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error no capturado:', error);
    process.exit(1);
  });
