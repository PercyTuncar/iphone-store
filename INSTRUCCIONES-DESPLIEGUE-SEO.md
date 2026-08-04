# 🚀 Instrucciones de Despliegue — Fix SEO Crítico

**Fecha:** 04 de agosto de 2026  
**Problema resuelto:** Conflicto de dominio canónico (www vs sin www)  
**Impacto esperado:** Resolución del problema de indexación en Google

---

## ⚠️ CRÍTICO: Variable de entorno en producción

### Problema identificado

La variable `NEXT_PUBLIC_SITE_URL` en producción está configurada **sin www**, mientras que:
- El redirect en `next.config.ts` fuerza **con www** (301 permanente)
- Esto crea un bucle de canonicalización que confunde a Google

### ✅ Solución implementada

Los cambios en el código ya están completos en este commit. **Ahora debes actualizar la variable de entorno en Vercel:**

---

## 📋 Pasos obligatorios (en orden)

### 1. Actualizar variable de entorno en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona el proyecto `iphone-store` (o como se llame en tu dashboard)
3. Ve a **Settings** → **Environment Variables**
4. Busca la variable `NEXT_PUBLIC_SITE_URL`
5. **Si existe:** Edítala y cambia el valor a:
   ```
   https://www.iphoneencuotas.com
   ```
6. **Si NO existe:** Créala con ese valor exacto
7. **Importante:** Asegúrate de que esté aplicada al entorno **Production**
8. Guarda los cambios

### 2. Forzar nuevo despliegue (redeploy)

**Las variables `NEXT_PUBLIC_*` se compilan en tiempo de BUILD**, no en runtime. Cambiar la variable sin redesplegar no actualiza las páginas ya generadas.

**Opción A — Desde el dashboard de Vercel:**
1. Ve a la pestaña **Deployments**
2. Encuentra el último deployment exitoso
3. Click en los 3 puntos (⋯) → **Redeploy**
4. Asegúrate de marcar **"Use existing Build Cache"** como **NO** (para forzar build nuevo)
5. Confirma el redeploy

**Opción B — Desde tu terminal (recomendado):**
```bash
# Desde la raíz del proyecto
git commit --allow-empty -m "chore: force rebuild for NEXT_PUBLIC_SITE_URL fix"
git push origin main
```

Esto disparará un nuevo build automáticamente con la variable correcta.

### 3. Verificar el fix (MUY IMPORTANTE)

Una vez que el nuevo deployment esté completo:

**A. Verificar en el navegador (Ctrl+U para ver código fuente):**

Abre estas páginas y verifica que `<link rel="canonical">` tenga **www**:

- https://www.iphoneencuotas.com/
  ```html
  <link rel="canonical" href="https://www.iphoneencuotas.com/">
  ```

- https://www.iphoneencuotas.com/iphone-en-cuotas
  ```html
  <link rel="canonical" href="https://www.iphoneencuotas.com/iphone-en-cuotas">
  ```

- https://www.iphoneencuotas.com/iphone/iphone-15-pro
  ```html
  <link rel="canonical" href="https://www.iphoneencuotas.com/iphone/iphone-15-pro">
  ```

**B. Verificar el redirect funciona:**
```bash
curl -I https://iphoneencuotas.com/iphone/iphone-15-pro
```
Debe devolver:
```
HTTP/2 301
location: https://www.iphoneencuotas.com/iphone/iphone-15-pro
```

**C. Verificar Open Graph images:**

En el código fuente, busca `<meta property="og:image">`:
```html
<meta property="og:image" content="https://www.iphoneencuotas.com/..." />
```

Si ves `https://iphoneencuotas.com` (sin www) o URLs de `apple.com`, el fix NO se aplicó correctamente.

### 4. Actualizar productos existentes en Firestore

El producto `iphone-15-pro` (y cualquier otro ya publicado) tiene el `canonicalUrl` viejo grabado en Firestore.

**Opción A — Desde el dashboard admin (más simple):**
1. Entra a https://www.iphoneencuotas.com/admin
2. Ve a la lista de productos
3. Edita el producto "iPhone 15 Pro"
4. El campo `canonicalUrl` en la sección SEO debería auto-regenerarse correcto
5. Verifica que diga `https://www.iphoneencuotas.com/iphone/iphone-15-pro`
6. Guarda el producto

**Opción B — Script para actualizar todos los productos (si tienes muchos):**

Crea un script temporal `scripts/fix-canonical-urls.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... resto de config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixCanonicalUrls() {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);

  let fixed = 0;
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.slug && data.seo?.canonicalUrl) {
      const correctUrl = `https://www.iphoneencuotas.com/iphone/${data.slug}`;
      if (data.seo.canonicalUrl !== correctUrl) {
        await updateDoc(doc(db, 'products', docSnap.id), {
          'seo.canonicalUrl': correctUrl,
        });
        console.log(`✅ Fixed: ${data.slug}`);
        fixed++;
      }
    }
  }
  console.log(`\n✅ Total fixed: ${fixed}`);
}

fixCanonicalUrls().catch(console.error);
```

Ejecuta con:
```bash
npx tsx scripts/fix-canonical-urls.ts
```

### 5. Reenviar sitemap a Google Search Console

Una vez verificado todo:

1. Ve a https://search.google.com/search-console
2. Selecciona la propiedad `www.iphoneencuotas.com`
3. Ve a **Sitemaps** en el menú lateral
4. Elimina el sitemap actual si hay uno
5. Agrega: `https://www.iphoneencuotas.com/sitemap.xml`
6. Haz clic en **Enviar**

### 6. Solicitar reindexación de páginas clave

Para cada una de estas URLs:
- https://www.iphoneencuotas.com/iphone-en-cuotas
- https://www.iphoneencuotas.com/iphone/iphone-15-pro

Haz lo siguiente en Search Console:
1. Ve a **Inspección de URL** (arriba de la barra lateral)
2. Pega la URL completa
3. Espera el análisis
4. Click en **Solicitar indexación**
5. Espera confirmación (puede tardar 1-2 minutos por URL)

---

## 🎯 Resultado esperado

Después de estos pasos:

✅ **Inmediato (1-2 horas):**
- Todas las páginas sirven canonical con `www`
- No más bucle de redirects
- Open Graph correcto

✅ **En 3-7 días:**
- Google reindexará las páginas con la URL correcta
- Desaparecerán los warnings de "duplicada, Google eligió un canónico distinto"

✅ **En 2-4 semanas:**
- Las páginas deberían aparecer en resultados de búsqueda
- El dominio ganará confianza progresivamente

---

## 📝 Cambios incluidos en este commit

### Archivos modificados:

1. **`.env.example`** — Variable corregida con `www`
2. **`src/lib/navigation/products.ts`** — Nueva función helper para navegación dinámica
3. **`src/components/layout/Footer.tsx`** — Usa productos dinámicos desde Firestore
4. **`src/components/layout/Navbar.tsx`** — Usa productos dinámicos desde Firestore
5. **`src/components/layout/BottomTabBar.tsx`** — Usa productos dinámicos desde Firestore

### Problemas resueltos:

✅ **Problema Crítico #1:** Conflicto www vs sin www  
✅ **Problema Crítico #2:** Enlaces internos rotos (404) en navegación  
✅ **Mejora adicional:** Sistema de navegación dinámico (nunca más enlaces muertos)

### Archivos que NO cambiaron (ya estaban correctos):

- `src/app/sitemap.ts` — Ya usa `process.env.NEXT_PUBLIC_SITE_URL` con fallback correcto
- `src/components/admin/ProductForm.tsx` — Ya tiene fallback a `https://www.iphoneencuotas.com`
- `next.config.ts` — El redirect está correcto, solo faltaba la variable de entorno

---

## ⚠️ Checklist final

Marca cada item después de completarlo:

- [ ] Variable `NEXT_PUBLIC_SITE_URL=https://www.iphoneencuotas.com` actualizada en Vercel Production
- [ ] Nuevo deployment completado con éxito
- [ ] Verificado canonical con `www` en 3+ páginas (código fuente, no DOM)
- [ ] Verificado redirect `iphoneencuotas.com` → `www.iphoneencuotas.com` (301)
- [ ] Producto `iphone-15-pro` actualizado en Firestore con canonical correcto
- [ ] Sitemap reenviado en Google Search Console
- [ ] Solicitada reindexación de `/iphone-en-cuotas` y `/iphone/iphone-15-pro`
- [ ] Navegación (footer/navbar) muestra solo productos publicados (sin 404s)

---

## 🆘 Si algo falla

**Error: "La variable no aparece en el bundle compilado"**
→ Asegúrate de haber hecho **Redeploy sin cache** (paso 2)

**Error: "Sigo viendo URLs sin www"**
→ Limpia cache del navegador (Ctrl+Shift+R) o prueba en modo incógnito

**Error: "Los productos no aparecen en navegación"**
→ Verifica las reglas de Firestore permiten lectura pública de `products` con `status == 'published'`

**Error: "404 en productos que sí existen"**
→ Prueba en modo incógnito. Si funciona logueado pero no en incógnito, las reglas de Firestore bloquean lectura pública.

---

## 📞 Soporte

Si después de seguir todos los pasos el problema persiste:

1. Verifica los logs de Vercel (pestaña **Logs** en el deployment)
2. Usa las herramientas de desarrollador del navegador (Network tab) para ver qué URL se está solicitando
3. Revisa que las reglas de Firestore permitan lectura pública sin autenticación

---

**Documento creado:** 04 de agosto de 2026  
**Autor:** Claude Code (Auditoría SEO técnica)
