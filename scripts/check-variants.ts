/**
 * Script para verificar variantes en Firestore
 * Uso: npx tsx scripts/check-variants.ts [slug]
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkVariants(slug: string) {
  console.log(`\n🔍 Buscando producto con slug: "${slug}"\n`);

  // 1. Buscar el producto maestro
  const productQuery = query(
    collection(db, 'products'),
    where('slug', '==', slug)
  );

  const productSnap = await getDocs(productQuery);

  if (productSnap.empty) {
    console.log('❌ Producto no encontrado');
    return;
  }

  const productDoc = productSnap.docs[0];
  const product = { id: productDoc.id, ...productDoc.data() } as any;

  console.log('✅ Producto encontrado:');
  console.log(`   ID: ${product.id}`);
  console.log(`   Título: ${product.title}`);
  console.log(`   Slug: ${product.slug}`);
  console.log(`   isVariant: ${product.isVariant}`);
  console.log(`   Status: ${product.status}`);

  if (product.isVariant === true) {
    console.log('\n⚠️  Este producto ES una variante (hijo), no un producto maestro');
    console.log(`   masterProductId: ${product.masterProductId}`);
    return;
  }

  // 2. Buscar variantes de este producto maestro
  console.log(`\n🔍 Buscando variantes del producto maestro (ID: ${product.id})...\n`);

  const variantQuery = query(
    collection(db, 'products'),
    where('isVariant', '==', true),
    where('masterProductId', '==', product.id)
  );

  const variantSnap = await getDocs(variantQuery);

  if (variantSnap.empty) {
    console.log('❌ No se encontraron variantes');
    console.log('\n💡 Para crear variantes:');
    console.log('   1. Ve a http://localhost:3000/admin/productos');
    console.log('   2. Edita el producto maestro');
    console.log('   3. Ve a la pestaña "9: Variantes"');
    console.log('   4. Crea las variantes con diferentes Storage/Color/etc.');
    return;
  }

  console.log(`✅ Se encontraron ${variantSnap.size} variantes:\n`);

  variantSnap.docs.forEach((doc, index) => {
    const variant = { id: doc.id, ...doc.data() };
    console.log(`${index + 1}. Variante:`);
    console.log(`   ID: ${variant.id}`);
    console.log(`   Storage: ${variant.storage}`);
    console.log(`   Color: ${variant.color}`);
    console.log(`   Condition: ${variant.condition}`);
    console.log(`   Grade: ${variant.grade || 'N/A'}`);
    console.log(`   Battery: ${variant.batteryHealth || 'N/A'}%`);
    console.log(`   Price: S/ ${variant.priceTotal}`);
    console.log(`   Stock: ${variant.stock}`);
    console.log(`   Status: ${variant.status}`);
    console.log(`   SKU: ${variant.sku}`);
    console.log('');
  });

  // 3. Verificar variantes publicadas
  const publishedVariants = variantSnap.docs.filter(doc => doc.data().status === 'published');
  console.log(`📊 Resumen:`);
  console.log(`   Total variantes: ${variantSnap.size}`);
  console.log(`   Publicadas: ${publishedVariants.length}`);
  console.log(`   Borradores: ${variantSnap.size - publishedVariants.length}`);

  if (publishedVariants.length === 0) {
    console.log('\n⚠️  No hay variantes PUBLICADAS');
    console.log('   Las variantes deben tener status="published" para aparecer en la página pública');
  }

  if (publishedVariants.length === 1) {
    console.log('\n⚠️  Solo hay 1 variante publicada');
    console.log('   El selector requiere al menos 2 variantes para aparecer (variantList.length > 1)');
  }
}

const slug = process.argv[2] || 'iphone-18-pro';
checkVariants(slug).then(() => process.exit(0)).catch(console.error);
