/**
 * Script de verificación de productos en Firestore
 * Ejecutar con: npx tsx scripts/check-products.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Configuración de Firebase (usando las mismas variables que la app)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProducts() {
  console.log('🔍 Verificando productos en Firestore...\n');

  try {
    // 1. Obtener TODOS los productos (sin filtro)
    console.log('1️⃣ Obteniendo TODOS los productos...');
    const allProductsRef = collection(db, 'products');
    const allSnapshot = await getDocs(allProductsRef);

    console.log(`   ✅ Total de productos en Firestore: ${allSnapshot.size}`);

    if (allSnapshot.empty) {
      console.log('   ❌ NO HAY PRODUCTOS EN FIRESTORE');
      console.log('   💡 Necesitas crear productos desde el admin: /admin');
      return;
    }

    console.log('\n   📋 Lista de productos:\n');
    allSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ID: ${doc.id}`);
      console.log(`      Title: ${data.title || 'Sin título'}`);
      console.log(`      Slug: ${data.slug || 'Sin slug'}`);
      console.log(`      Status: ${data.status || 'Sin status'}`);
      console.log(`      Stock: ${data.stock ?? 'Sin stock'}`);
      console.log('');
    });

    // 2. Obtener solo productos PUBLICADOS
    console.log('2️⃣ Obteniendo productos PUBLICADOS...');
    const publishedQuery = query(
      collection(db, 'products'),
      where('status', '==', 'published')
    );
    const publishedSnapshot = await getDocs(publishedQuery);

    console.log(`   ✅ Productos publicados: ${publishedSnapshot.size}`);

    if (publishedSnapshot.empty) {
      console.log('   ⚠️  NO HAY PRODUCTOS PUBLICADOS');
      console.log('   💡 Los productos existen pero NO están publicados');
      console.log('   💡 Ve al admin y cambia el status a "published"');
    } else {
      console.log('\n   📋 Productos publicados:\n');
      publishedSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${data.title} (${data.slug})`);
        console.log(`      Stock: ${data.stock}`);
        console.log(`      Precio: S/ ${data.priceTotal}`);
        console.log(`      URL: /iphone/${data.slug}`);
        console.log('');
      });
    }

    // 3. Verificar campos requeridos
    console.log('3️⃣ Verificando campos requeridos en productos...\n');
    let hasIssues = false;

    allSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const issues: string[] = [];

      if (!data.title) issues.push('Sin título');
      if (!data.slug) issues.push('Sin slug');
      if (!data.status) issues.push('Sin status');
      if (data.stock === undefined) issues.push('Sin stock');
      if (!data.thumbnailUrl) issues.push('Sin imagen');
      if (!data.priceTotal) issues.push('Sin precio');

      if (issues.length > 0) {
        hasIssues = true;
        console.log(`   ⚠️  Producto ${doc.id} tiene problemas:`);
        issues.forEach(issue => console.log(`      - ${issue}`));
        console.log('');
      }
    });

    if (!hasIssues) {
      console.log('   ✅ Todos los productos tienen los campos requeridos');
    }

    // 4. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN');
    console.log('='.repeat(60));
    console.log(`Total de productos: ${allSnapshot.size}`);
    console.log(`Productos publicados: ${publishedSnapshot.size}`);
    console.log(`Productos borrador: ${allSnapshot.size - publishedSnapshot.size}`);

    if (publishedSnapshot.size === 0) {
      console.log('\n❌ PROBLEMA: No hay productos publicados');
      console.log('🔧 SOLUCIÓN: Ve a /admin y publica al menos un producto');
    } else {
      console.log('\n✅ Hay productos publicados - deberían mostrarse en la web');
      console.log('🌐 Verifica en: http://localhost:3002/iphone-en-cuotas');
    }

  } catch (error) {
    console.error('\n❌ Error al verificar productos:', error);

    if (error instanceof Error) {
      if (error.message.includes('permission-denied') || error.message.includes('Missing or insufficient permissions')) {
        console.log('\n🔥 PROBLEMA: Reglas de Firestore');
        console.log('Las reglas de Firestore NO permiten lectura pública de productos');
        console.log('\nVe a Firebase Console → Firestore → Rules');
        console.log('https://console.firebase.google.com/project/iphone-en-cuotas/firestore/rules');
        console.log('\nLas reglas deben incluir:');
        console.log(`
match /products/{productId} {
  allow read: if resource.data.status == 'published';
  allow write: if request.auth != null;
}
        `);
      }
    }
  }
}

checkProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
