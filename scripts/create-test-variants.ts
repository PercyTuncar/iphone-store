/**
 * Script para crear variantes de prueba
 * Uso: npx tsx scripts/create-test-variants.ts [slug]
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

async function createTestVariants(slug: string) {
  console.log(`\n🔍 Buscando producto: "${slug}"\n`);

  // 1. Buscar el producto maestro
  const productsSnapshot = await db
    .collection('products')
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (productsSnapshot.empty) {
    console.log('❌ Producto no encontrado');
    return;
  }

  const masterDoc = productsSnapshot.docs[0];
  const master = masterDoc.data();
  const masterId = masterDoc.id;

  console.log('✅ Producto encontrado:');
  console.log(`   ID: ${masterId}`);
  console.log(`   Título: ${master.title}`);
  console.log(`   isVariant: ${master.isVariant}`);

  if (master.isVariant === true) {
    console.log('\n⚠️  Este producto ES una variante, no un maestro. Usa el slug del producto maestro.');
    return;
  }

  // 2. Verificar variantes existentes
  const existingVariants = await db
    .collection('products')
    .where('isVariant', '==', true)
    .where('masterProductId', '==', masterId)
    .get();

  console.log(`\n📊 Variantes existentes: ${existingVariants.size}`);

  if (existingVariants.size >= 2) {
    console.log('✅ Ya hay 2 o más variantes. El selector debería aparecer.');
    existingVariants.docs.forEach((doc, i) => {
      const v = doc.data();
      console.log(`   ${i + 1}. ${v.storage} - ${v.color} (${v.status})`);
    });
    return;
  }

  console.log('\n🚀 Creando variantes de prueba...\n');

  // 3. Definir variantes a crear
  const variantsToCreate = [
    { storage: '128GB', color: 'Negro Titanio', priceTotal: 3999, stock: 5 },
    { storage: '256GB', color: 'Negro Titanio', priceTotal: 4299, stock: 3 },
    { storage: '512GB', color: 'Negro Titanio', priceTotal: 4799, stock: 2 },
    { storage: '128GB', color: 'Azul Titanio', priceTotal: 3999, stock: 4 },
    { storage: '256GB', color: 'Azul Titanio', priceTotal: 4299, stock: 2 },
    { storage: '128GB', color: 'Blanco Titanio', priceTotal: 3999, stock: 3 },
  ];

  for (const variantData of variantsToCreate) {
    const sku = `${master.model.replace(/\s/g, '-')}-${variantData.storage}-${variantData.color.replace(/\s/g, '-')}`.toUpperCase();

    const variant = {
      // Campos del maestro (heredados)
      model: master.model,
      title: `${master.model} ${variantData.storage} ${variantData.color}`,
      slug: `${master.slug}-${variantData.storage.toLowerCase()}-${variantData.color.toLowerCase().replace(/\s/g, '-')}`,
      description: master.description,
      features: master.features || [],
      faqs: master.faqs || [],
      thumbnailUrl: master.thumbnailUrl,
      images: master.images || [],
      category: master.category,
      brand: master.brand,

      // Campos específicos de variante
      storage: variantData.storage,
      color: variantData.color,
      condition: 'new',
      grade: null,
      batteryHealth: 100,
      priceTotal: variantData.priceTotal,
      stock: variantData.stock,
      sku: sku,

      // Campos de pago (heredados del maestro)
      installments: master.installments || 6,
      installmentAmount: Math.ceil(variantData.priceTotal / (master.installments || 6)),
      interestRate: master.interestRate || 0,
      downPayment: master.downPayment || 0,

      // Campos de reseñas
      averageRating: 0,
      reviewCount: 0,

      // Relación con maestro
      isVariant: true,
      masterProductId: masterId,
      masterProductSlug: master.slug,

      // Estado
      status: 'published',

      // SEO (básico, heredado del maestro con ajustes)
      seo: {
        metaTitle: `${master.model} ${variantData.storage} ${variantData.color} | iPhone en Cuotas`,
        metaDescription: `Compra el ${master.model} ${variantData.storage} en ${variantData.color} con cuotas flexibles sin intereses. Stock disponible.`,
        h1: `${master.model} ${variantData.storage} ${variantData.color}`,
        canonicalUrl: `https://www.iphoneencuotas.com/${master.slug}?variant=PLACEHOLDER`,
        ogTitle: `${master.model} ${variantData.storage} ${variantData.color}`,
        ogDescription: `Compra en cuotas sin intereses`,
        ogImage: master.thumbnailUrl,
        twitterTitle: `${master.model} ${variantData.storage} ${variantData.color}`,
        twitterDescription: `Cuotas flexibles sin intereses`,
        structuredData: null,
      },

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
    };

    const docRef = await db.collection('products').add(variant);

    // Actualizar canonical URL con el ID real
    await db.collection('products').doc(docRef.id).update({
      'seo.canonicalUrl': `https://www.iphoneencuotas.com/${master.slug}?variant=${docRef.id}`,
    });

    console.log(`✅ Creada: ${variantData.storage} - ${variantData.color} (ID: ${docRef.id})`);
  }

  console.log('\n✨ Variantes creadas exitosamente!');
  console.log(`\n💡 Visita: http://localhost:3000/${slug}`);
}

const slug = process.argv[2] || 'iphone-18-pro';
createTestVariants(slug)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
