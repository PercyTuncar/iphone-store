/**
 * Script para verificar productos en Firestore de forma más detallada
 * Ejecutar con: npx tsx scripts/debug-products.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function debugProducts() {
  console.log('🔍 Verificación detallada de productos...\n');

  try {
    // Obtener TODOS los productos sin filtro
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    console.log(`📦 Total de documentos en 'products': ${snapshot.size}\n`);

    if (snapshot.empty) {
      console.log('❌ La colección "products" está VACÍA');
      console.log('\n💡 Solución:');
      console.log('   1. Ve a http://localhost:3000/admin/productos');
      console.log('   2. Si ves productos ahí, verifica que estén PUBLICADOS');
      console.log('   3. Si no ves productos, crea uno desde /admin/productos/nuevo');
      return;
    }

    // Mostrar cada producto
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. Producto ID: ${doc.id}`);
      console.log(`   Title: ${data.title || '(sin título)'}`);
      console.log(`   Slug: ${data.slug || '(sin slug)'}`);
      console.log(`   Status: ${data.status || '(sin status)'}`);
      console.log(`   PublishedAt: ${data.publishedAt ? 'SÍ' : 'NO'}`);
      console.log(`   Stock: ${data.stock ?? '(sin stock)'}`);
      console.log('');
    });

    // Verificar si alguno está publicado
    const published = snapshot.docs.filter(d => d.data().status === 'published');
    console.log(`✅ Productos con status="published": ${published.length}`);

    if (published.length === 0) {
      console.log('\n⚠️  PROBLEMA: Hay productos pero NINGUNO está publicado');
      console.log('\n💡 Solución:');
      console.log('   1. Ve a http://localhost:3000/admin/productos');
      console.log('   2. Encuentra el producto');
      console.log('   3. Click en "Publicar"');
      console.log('   4. El producto aparecerá en la home');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);

    if (error instanceof Error && error.message.includes('INVALID_ARGUMENT')) {
      console.log('\n🔥 Problema de configuración de Firebase');
      console.log('Las credenciales en .env.local no son correctas.');
    }
  }
}

debugProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
