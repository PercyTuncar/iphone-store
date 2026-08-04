/**
 * Script para actualizar canonical URLs de productos
 * Ejecutar con: npx tsx scripts/fix-canonical-products.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

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

const CORRECT_SITE_URL = 'https://www.iphoneencuotas.com';
const WRONG_SITE_URL = 'https://iphoneencuotas.com';

async function fixCanonicalUrls() {
  console.log('🔧 Actualizando canonical URLs de productos...\n');

  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    if (snapshot.empty) {
      console.log('⚠️  No hay productos en Firestore');
      return;
    }

    console.log(`📦 Productos encontrados: ${snapshot.size}\n`);

    let fixed = 0;
    let alreadyCorrect = 0;
    let needsUpdate: Array<{ id: string; title: string; slug: string; oldUrl: string; newUrl: string }> = [];

    // Primero identificar qué necesita actualización
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const canonicalUrl = data.seo?.canonicalUrl || '';

      if (!canonicalUrl) {
        console.log(`⚠️  Producto ${docSnap.id} (${data.title}) - Sin canonical URL`);
        if (data.slug) {
          const newUrl = `${CORRECT_SITE_URL}/iphone/${data.slug}`;
          needsUpdate.push({
            id: docSnap.id,
            title: data.title || 'Sin título',
            slug: data.slug,
            oldUrl: '(vacío)',
            newUrl,
          });
        }
        continue;
      }

      // Verificar si usa el dominio sin www
      if (canonicalUrl.startsWith(WRONG_SITE_URL)) {
        const newUrl = canonicalUrl.replace(WRONG_SITE_URL, CORRECT_SITE_URL);
        needsUpdate.push({
          id: docSnap.id,
          title: data.title || 'Sin título',
          slug: data.slug,
          oldUrl: canonicalUrl,
          newUrl,
        });
      } else if (canonicalUrl.startsWith(CORRECT_SITE_URL)) {
        alreadyCorrect++;
      } else {
        console.log(`⚠️  URL no estándar en ${data.title}: ${canonicalUrl}`);
      }
    }

    // Mostrar resumen
    console.log('📊 RESUMEN:');
    console.log(`   ✅ Productos con URL correcta: ${alreadyCorrect}`);
    console.log(`   🔧 Productos a actualizar: ${needsUpdate.length}\n`);

    if (needsUpdate.length === 0) {
      console.log('✅ Todos los productos ya tienen canonical URLs correctas');
      return;
    }

    // Mostrar cambios que se harán
    console.log('🔄 CAMBIOS A REALIZAR:\n');
    needsUpdate.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} (${item.slug})`);
      console.log(`   Antes: ${item.oldUrl}`);
      console.log(`   Después: ${item.newUrl}\n`);
    });

    console.log('⏳ Actualizando...\n');

    // Actualizar cada producto
    for (const item of needsUpdate) {
      try {
        await updateDoc(doc(db, 'products', item.id), {
          'seo.canonicalUrl': item.newUrl,
        });
        console.log(`   ✅ Actualizado: ${item.title}`);
        fixed++;
      } catch (error) {
        console.error(`   ❌ Error actualizando ${item.title}:`, error);
      }
    }

    console.log(`\n✅ COMPLETADO: ${fixed} productos actualizados`);

    // Verificación final
    console.log('\n🔍 Verificando cambios...\n');
    const verifySnapshot = await getDocs(productsRef);
    let allCorrect = true;

    verifySnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const canonicalUrl = data.seo?.canonicalUrl || '';

      if (canonicalUrl && !canonicalUrl.startsWith(CORRECT_SITE_URL)) {
        console.log(`❌ ${data.title}: ${canonicalUrl} (todavía incorrecto)`);
        allCorrect = false;
      }
    });

    if (allCorrect) {
      console.log('✅ VERIFICACIÓN: Todos los canonical URLs son correctos\n');
      console.log('🎯 PRÓXIMO PASO:');
      console.log('   1. Reinicia el servidor: Ctrl+C y npm run dev');
      console.log('   2. Verifica en: http://localhost:3000/iphone/iphone-15-pro');
      console.log('   3. View Source debe mostrar: href="https://www.iphoneencuotas.com/iphone/iphone-15-pro"');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('permission-denied') || error.message.includes('Missing or insufficient permissions')) {
        console.log('\n🔥 PROBLEMA: Reglas de Firestore');
        console.log('Las reglas de Firestore NO permiten escritura');
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

fixCanonicalUrls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
