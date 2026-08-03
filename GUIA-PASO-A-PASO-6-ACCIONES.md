# 🔧 GUÍA PASO A PASO - 6 ACCIONES MANUALES

## ORDEN DE EJECUCIÓN (IMPORTANTE)

Debes hacer las acciones EN ESTE ORDEN exacto:

1. Configurar variables de entorno (PRIMERO)
2. Ejecutar migración de productos
3. Ejecutar migración de imágenes
4. Desplegar a producción
5. Configurar Google Merchant Center
6. Validar con herramientas de Google
7. (Opcional pero recomendado) Rotar secretos

---

## 🔹 ACCIÓN 1: CONFIGURAR VARIABLES DE ENTORNO

### Si usas Vercel (recomendado para este proyecto):

#### Paso 1.1: Ir a tu proyecto en Vercel
1. Abre tu navegador
2. Ve a: https://vercel.com
3. Inicia sesión con tu cuenta
4. Clic en tu proyecto "iphone-store" (o como lo hayas nombrado)

#### Paso 1.2: Ir a Settings
1. En la barra superior del proyecto, clic en **"Settings"**
2. En el menú lateral izquierdo, clic en **"Environment Variables"**

#### Paso 1.3: Agregar/Actualizar la variable
1. Busca si ya existe `NEXT_PUBLIC_SITE_URL`:
   - **Si existe**: Clic en los 3 puntos al lado → **"Edit"**
   - **Si NO existe**: Clic en el botón **"Add New"**

2. Llena los campos:
   ```
   Name: NEXT_PUBLIC_SITE_URL
   Value: https://www.iphoneencuotas.com
   ```

3. En **"Environment"**, selecciona:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development

4. Clic en **"Save"**

#### Paso 1.4: Agregar variable del Storage Bucket
1. Clic en **"Add New"** nuevamente
2. Llena:
   ```
   Name: FIREBASE_STORAGE_BUCKET
   Value: [tu-proyecto-id].appspot.com
   ```
   
   **¿Cómo encontrar tu Storage Bucket?**
   - Ve a: https://console.firebase.google.com
   - Selecciona tu proyecto
   - En el menú lateral: **Storage**
   - Copia el nombre que aparece (ej: `iphone-store-abc123.appspot.com`)

3. Selecciona todos los environments (Production, Preview, Development)
4. Clic en **"Save"**

#### Paso 1.5: Verificar variables existentes
Asegúrate de que ya tienes estas variables (NO las modifiques si ya existen):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (puede ser duplicado con el anterior)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY`

#### Paso 1.6: NO redesplegar todavía
⚠️ **NO** hagas clic en "Redeploy" aún. Primero necesitas ejecutar las migraciones.

---

## 🔹 ACCIÓN 2: EJECUTAR MIGRACIÓN DE PRODUCTOS

### Paso 2.1: Verificar que tienes los requisitos

Abre tu terminal (PowerShell en Windows) y verifica:

```powershell
# Verificar Node.js (debe ser v18 o superior)
node --version

# Verificar que estás en la carpeta correcta
cd "c:\Users\tunca\OneDrive\Desktop\Github\iphone-store"
pwd
```

### Paso 2.2: Instalar dependencias necesarias

Si no las tienes, instala:

```powershell
npm install firebase-admin dotenv ts-node --save-dev
```

### Paso 2.3: Verificar el archivo .env

1. Abre el archivo `.env` (NO `.env.example`) en la raíz del proyecto
2. Verifica que contenga:

```env
NEXT_PUBLIC_SITE_URL=https://www.iphoneencuotas.com
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

⚠️ **IMPORTANTE**: Si no tienes `.env`, créalo copiando `.env.example`:

```powershell
Copy-Item .env.example .env
```

Luego edita `.env` con tus credenciales reales.

### Paso 2.4: Ejecutar el script de migración

```powershell
npx ts-node scripts/migrate-products.ts
```

### Paso 2.5: Revisar la salida

Deberías ver algo como:

```
🚀 Starting product migration...

✅ Updated producto-123: { sku: 'iphone-15-pro-256gb', category: '...', ... }
✅ Updated producto-456: { sku: 'iphone-14-128gb', category: '...', ... }
⏭️  Skipping producto-789 (already migrated)

✨ Migration complete!
   Updated: 5
   Skipped: 2
   Total:   7
```

### Paso 2.6: ¿Qué hacer si hay errores?

#### Error: "Cannot find module 'firebase-admin'"
**Solución**:
```powershell
npm install firebase-admin
```

#### Error: "Error initializing Firebase"
**Solución**: Verifica que tu `.env` tenga `FIREBASE_SERVICE_ACCOUNT_KEY` correcta.

#### Error: "Permission denied"
**Solución**: Verifica que tu cuenta de servicio tenga permisos de "Firestore Admin" en Firebase Console.

---

## 🔹 ACCIÓN 3: EJECUTAR MIGRACIÓN DE IMÁGENES

⚠️ **ADVERTENCIA CRÍTICA**: Esta migración:
- Descargará TODAS las imágenes de Apple
- Las subirá a Firebase Storage (puede consumir espacio)
- Actualizará referencias en Firestore
- Puede tomar varios minutos dependiendo de cuántas imágenes tengas

### Paso 3.1: Backup de Firestore (RECOMENDADO)

Antes de migrar, haz un backup:

1. Ve a: https://console.firebase.google.com
2. Selecciona tu proyecto
3. En el menú lateral: **Firestore Database**
4. Clic en los 3 puntos arriba → **"Export data"**
5. Deja todo seleccionado → **"Export"**

(El backup se guardará en Google Cloud Storage automáticamente)

### Paso 3.2: Verificar espacio en Storage

1. Ve a: https://console.firebase.google.com
2. Selecciona tu proyecto
3. En el menú lateral: **Storage**
4. Verifica cuánto espacio tienes usado

**Plan Spark (gratis)**: 5 GB  
**Plan Blaze (pago)**: Ilimitado (pagas por GB)

### Paso 3.3: Ejecutar migración de imágenes

```powershell
npx ts-node scripts/migrate-images.ts
```

### Paso 3.4: Revisar la salida esperada

```
🚀 Iniciando migración de imágenes...

📦 Procesando: iPhone 15 Pro Max 256GB
  🔄 Migrando thumbnail: https://cdsassets.apple.com/live/...
  ✅ Thumbnail migrado
  🔄 Migrando imagen 1/4: https://www.apple.com/...
  ✅ Imagen 1 migrada
  🔄 Migrando imagen 2/4: https://www.apple.com/...
  ✅ Imagen 2 migrada
  ...

📝 Actualizando referencias en Firestore...
✅ Actualizado producto: abc123
✅ Actualizado producto: def456

============================================================
✨ MIGRACIÓN COMPLETADA
============================================================
📦 Productos procesados:      10
🖼️  Total imágenes:            45
✅ Imágenes migradas:         40
⏭️  Imágenes ya migradas:      5
❌ Errores:                   0
============================================================

⚠️  IMPORTANTE:
   1. Verifica que las imágenes se vean correctamente en el sitio
   2. Solo después, quita los dominios de Apple de next.config.ts:
      - Elimina: { hostname: "www.apple.com" }
      - Elimina: { hostname: "cdsassets.apple.com" }
```

### Paso 3.5: Verificar las imágenes migradas

1. Ve a Firebase Console → **Storage**
2. Navega a la carpeta `products/`
3. Deberías ver subcarpetas por producto con las imágenes

### Paso 3.6: ¿Qué hacer si hay errores?

#### Error: "Failed to download"
**Solución**: Puede ser que Apple bloqueó el acceso. Intenta:
- Esperar unos minutos y volver a ejecutar
- Verificar tu conexión a internet

#### Error: "Permission denied" al subir
**Solución**: 
1. Ve a Firebase Console → Storage → **Rules**
2. Temporalmente cambia a:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // TEMPORAL
    }
  }
}
```
3. Ejecuta la migración
4. **IMPORTANTE**: Después, restaura las reglas seguras

#### Error: "Out of space"
**Solución**: 
- Actualiza tu plan de Firebase a Blaze (pago por uso)
- O elimina archivos viejos de Storage

### Paso 3.7: Quitar dominios de Apple de next.config.ts

**SOLO DESPUÉS** de verificar que todas las imágenes se ven bien:

1. Abre `next.config.ts`
2. **ELIMINA** estas líneas:

```typescript
// ELIMINAR ESTAS LÍNEAS:
{
  protocol: 'https',
  hostname: 'www.apple.com',
},
{
  protocol: 'https',
  hostname: 'cdsassets.apple.com',
},
```

3. Guarda el archivo
4. Haz commit:

```powershell
git add next.config.ts
git commit -m "Remove Apple domains after image migration"
```

---

## 🔹 ACCIÓN 4: DESPLEGAR A PRODUCCIÓN

### Paso 4.1: Commit de todos los cambios

```powershell
# Ver qué cambios hay
git status

# Agregar TODOS los archivos nuevos y modificados
git add .

# Crear commit
git commit -m "Implement complete SEO improvements according to PRD

- Fix canonical URLs and domain consistency (Bug #1)
- Add ISR instead of force-dynamic (Bug #3)
- Implement complete validation in ProductForm (Bug #4)
- Fix itemCondition mapping (Bug #7)
- Add 6 new fields to Product type (sku, mpn, gtin, category, etc.)
- Create /iphone-en-cuotas category page
- Implement complete JSON-LD schemas (9 functions)
- Create Google Merchant Center feed with all required fields
- Add migration scripts for products and images
- Update all domain references to www.iphoneencuotas.com"
```

### Paso 4.2: Push a GitHub

```powershell
git push origin main
```

### Paso 4.3: Esperar el despliegue automático

Si tu proyecto está conectado a Vercel:

1. Ve a: https://vercel.com/[tu-usuario]/iphone-store
2. Verás un nuevo despliegue en progreso
3. Espera a que diga **"Ready"** (puede tomar 2-5 minutos)

### Paso 4.4: Verificar que el sitio está en línea

Abre en tu navegador:
```
https://www.iphoneencuotas.com
```

Verifica:
- ✅ La home carga correctamente
- ✅ Puedes navegar a productos
- ✅ Las imágenes se ven (ya migradas)
- ✅ La página `/iphone-en-cuotas` existe

---

## 🔹 ACCIÓN 5: CONFIGURAR GOOGLE MERCHANT CENTER

### Paso 5.1: Crear cuenta de Merchant Center

1. Ve a: https://merchants.google.com
2. Clic en **"Get started"** (Comenzar)
3. Inicia sesión con tu cuenta de Google
4. Selecciona tu país: **Perú**
5. Nombre de la empresa: **iPhone en Cuotas**
6. Zona horaria: **(GMT-5:00) Lima**
7. Clic en **"Continuar"**

### Paso 5.2: Verificar el dominio

#### Opción A: Usar verificación de Search Console (recomendado)

1. En Merchant Center, cuando te pida verificar el sitio web
2. Clic en **"Claim URL"** (Reclamar URL)
3. Ingresa: `https://www.iphoneencuotas.com`
4. Clic en **"Verify and claim"**
5. Selecciona **"Use Google Search Console"**
6. Si ya verificaste el dominio en Search Console, aparecerá verificado automáticamente
7. Clic en **"Continue"**

#### Opción B: Verificación manual

Si no tienes Search Console:

1. Descarga el archivo HTML que te proporciona Merchant Center
2. Sube ese archivo a la carpeta `public/` de tu proyecto
3. Haz commit y push
4. Espera el despliegue
5. En Merchant Center, clic en **"Verify"**

### Paso 5.3: Configurar información de la empresa

1. **Información de contacto**:
   - Atención al cliente: +51 944 784 488 (tu WhatsApp)
   - Email: (tu email de contacto)

2. **Dirección de la empresa**:
   - País: Perú
   - Ciudad: Lima
   - (Completa con tu dirección real)

### Paso 5.4: Configurar envíos

1. En el menú lateral: **Tools and settings** (⚙️) → **Shipping**
2. Clic en **"+ Create shipping service"**
3. **País de destino**: Perú
4. **Nombre del servicio**: Envío estándar
5. **Tiempo de entrega**: 3-7 días hábiles
6. **Costo de envío**: 
   - Fijo: S/ 20.00 (o tu tarifa real)
7. Clic en **"Save"**

### Paso 5.5: Configurar devoluciones

1. En el menú lateral: **Tools and settings** → **Return settings**
2. Clic en **"+ Add return policy"**
3. **País**: Perú
4. **Ventana de devolución**: 30 días
5. **Método de devolución**: El cliente envía el artículo
6. **Costo de devolución**: El cliente paga el envío
7. Clic en **"Save"**

### Paso 5.6: Crear fuente de datos (Feed)

1. En el menú lateral: **Products** → **Feeds**
2. Clic en **"+ Add feed"** (Agregar feed)
3. **País de venta**: Perú
4. **Idioma**: Español
5. **Destinos**: Selecciona **"Fichas gratuitas"** (Free listings)
6. Clic en **"Continue"**

7. **Nombre del feed**: iPhone en Cuotas - Productos
8. **Método de entrada**:
   - Selecciona: **"Scheduled fetch"** (Recuperación programada)
   
9. **Configuración**:
   - **Nombre del archivo**: `feed.xml`
   - **URL**: `https://www.iphoneencuotas.com/api/merchant-feed`
   - **Frecuencia**: Diaria
   - **Hora**: 03:00 AM (hora local de Perú)
   - **Zona horaria**: (GMT-5:00) Lima

10. Clic en **"Create feed"**

### Paso 5.7: Obtener feed manualmente la primera vez

1. El feed acabas de crear aparecerá en la lista
2. Clic en los 3 puntos al lado del feed → **"Fetch now"** (Obtener ahora)
3. Espera 1-2 minutos
4. Refresca la página

### Paso 5.8: Revisar diagnóstico

1. Clic en el nombre de tu feed
2. Ve a la pestaña **"Diagnostics"**
3. Revisa:
   - **Items processed**: Cuántos productos se procesaron
   - **Errors**: Debe ser 0 (o pocos)
   - **Warnings**: Revisa las advertencias

#### Errores comunes y soluciones:

**Error: "Missing required attribute: price"**
- Tu feed tiene un producto sin precio
- Revisa que todos los productos en Firestore tengan `priceTotal > 0`

**Error: "Invalid image URL"**
- Alguna imagen no es accesible
- Verifica que todas las imágenes estén en Firebase Storage (migradas)

**Error: "GTIN is invalid"**
- Tienes un GTIN que no es válido
- Ve a Firestore y pon `gtin: null` en ese producto

**Warning: "Missing optional attribute: mpn"**
- Es solo una advertencia, no es grave
- Puedes ignorarlo o agregar MPN real si lo tienes

### Paso 5.9: Activar fichas gratuitas

1. En el menú lateral: **Growth** → **Manage programs**
2. Busca **"Free listings"** (Fichas gratuitas)
3. Si no está activado, clic en **"Get started"**
4. Acepta los términos
5. Clic en **"Activate"**

### Paso 5.10: Esperar aprobación

⏱️ **Tiempo de espera**: 3-7 días hábiles

Google revisará:
- Tu feed
- Tu sitio web
- Que no haya problemas de políticas

Recibirás un email cuando:
- ✅ Tus productos sean aprobados
- ❌ Haya algún problema a resolver

---

## 🔹 ACCIÓN 6: VALIDAR CON HERRAMIENTAS DE GOOGLE

### Paso 6.1: Rich Results Test - Home

1. Ve a: https://search.google.com/test/rich-results
2. Ingresa: `https://www.iphoneencuotas.com`
3. Clic en **"Test URL"**
4. Espera 10-30 segundos

#### Qué debes ver ✅:
- **Organization**: 1 valid item
- **WebSite**: 1 valid item
- **BreadcrumbList**: 0 issues

#### Si hay errores:
- Copia el mensaje de error
- Revisa el archivo correspondiente
- Si es un error de "Missing required field", verifica que el campo existe en el schema

### Paso 6.2: Rich Results Test - Categoría

1. En la misma herramienta
2. Ingresa: `https://www.iphoneencuotas.com/iphone-en-cuotas`
3. Clic en **"Test URL"**

#### Qué debes ver ✅:
- **CollectionPage**: 1 valid item
- **ItemList**: 1 valid item  
- **FAQPage**: 1 valid item
- **BreadcrumbList**: 1 valid item

### Paso 6.3: Rich Results Test - Producto

1. Ingresa una URL de producto real, ej: `https://www.iphoneencuotas.com/iphone/[slug-de-producto]`
2. Clic en **"Test URL"**

#### Qué debes ver ✅:
- **Product**: 1 valid item
  - ✅ Offers
  - ✅ AggregateRating (si tiene reseñas)
  - ✅ Review (si tiene reseñas)
- **BreadcrumbList**: 1 valid item
- **FAQPage**: 1 valid item (si tiene FAQ)

### Paso 6.4: Schema.org Validator

Esta herramienta es MÁS ESTRICTA que el Rich Results Test.

1. Ve a: https://validator.schema.org/
2. Ingresa: `https://www.iphoneencuotas.com`
3. Clic en **"Run Test"**

#### Advertencias esperadas (no son graves):
- "recommendedProperty" - Solo son recomendadas, no obligatorias
- "The property X is not recognized" - Puede ser extensiones de schema.org

#### Errores graves a corregir:
- "Missing required property" - Falta un campo obligatorio
- "Invalid value type" - Un campo tiene el tipo de dato incorrecto

### Paso 6.5: Verificar Sitemap

1. Ve a: https://www.iphoneencuotas.com/sitemap.xml
2. Deberías ver un XML con todas tus URLs

#### Verifica que incluya:
- ✅ Home: `https://www.iphoneencuotas.com`
- ✅ Categoría: `https://www.iphoneencuotas.com/iphone-en-cuotas`
- ✅ Blog: `https://www.iphoneencuotas.com/blog`
- ✅ Todos los productos
- ✅ Todos los posts de blog

### Paso 6.6: Verificar Robots.txt

1. Ve a: https://www.iphoneencuotas.com/robots.txt
2. Deberías ver:

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /pago-exitoso/
Disallow: /login
Disallow: /auth-callback

Sitemap: https://www.iphoneencuotas.com/sitemap.xml
```

### Paso 6.7: Verificar Merchant Feed

1. Ve a: https://www.iphoneencuotas.com/api/merchant-feed
2. Deberías ver XML que empiece con:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>iPhone en Cuotas</title>
    ...
```

3. Verifica que tenga productos listados

### Paso 6.8: Search Console - Solicitar indexación

1. Ve a: https://search.google.com/search-console
2. Selecciona tu propiedad (www.iphoneencuotas.com)

#### Para cada URL importante:

**Home**:
1. En la barra superior, pega: `https://www.iphoneencuotas.com`
2. Presiona Enter
3. Espera el análisis (30-60 segundos)
4. Clic en **"Request indexing"** (Solicitar indexación)
5. Espera confirmación

**Categoría**:
1. Pega: `https://www.iphoneencuotas.com/iphone-en-cuotas`
2. Request indexing

**Productos** (haz esto para 3-5 productos principales):
1. Pega cada URL
2. Request indexing

⏱️ **Tiempo de indexación**: 1-7 días

### Paso 6.9: Search Console - Enviar Sitemap

1. En Search Console, menú lateral: **Sitemaps**
2. En "Add a new sitemap", ingresa: `sitemap.xml`
3. Clic en **"Submit"**

#### Estado esperado:
- **Status**: Success (puede tardar horas)
- **Discovered URLs**: [número de tus páginas]

### Paso 6.10: Monitorear durante 2 semanas

Revisa cada 3-4 días:

**En Search Console**:
1. **Coverage** → "Valid" should increase
2. **Enhancements** → "Products" should appear
3. **Performance** → Check impressions for "iphone en cuotas"

**En Merchant Center**:
1. **Products** → **Diagnostics** → Errors should be 0
2. **Growth** → **Performance** → Check impressions/clicks

---

## 🔹 ACCIÓN 7 (OPCIONAL): ROTAR SECRETOS

⚠️ **SOLO si tu repositorio es PÚBLICO en GitHub**

### Paso 7.1: Verificar si el repo es público

```powershell
# En la carpeta del proyecto
git remote -v
```

Abre esa URL en tu navegador. Si puedes verlo sin iniciar sesión → es público.

### Paso 7.2: Hacer el repositorio PRIVADO (recomendado)

1. Ve a: https://github.com/PercyTuncar/iphone-store
2. Clic en **Settings** (arriba)
3. Scroll hasta el final → **Danger Zone**
4. Clic en **"Change visibility"**
5. Selecciona **"Make private"**
6. Escribe el nombre del repositorio para confirmar
7. Clic en **"I understand, make this repository private"**

### Paso 7.3: Si necesitas mantenerlo público, rotar credenciales

#### Firebase API Key:
1. Ve a: https://console.firebase.google.com
2. Selecciona tu proyecto
3. ⚙️ Project Settings → **General**
4. En "Your apps", encuentra tu app web
5. Clic en el ícono de "regenerar" junto a la API Key
6. Copia la nueva API Key
7. Actualiza `.env` y Vercel con el nuevo valor

#### Service Account Key:
1. En Firebase Console → ⚙️ → **Service accounts**
2. Clic en **"Generate new private key"**
3. Descarga el archivo JSON
4. Copia TODO el contenido del JSON
5. Actualiza `FIREBASE_SERVICE_ACCOUNT_KEY` en `.env` y Vercel

#### Hacer commit sin secretos:
```powershell
# Nunca hagas esto si tienes secretos:
# git add .env

# Solo archivos de código:
git add src/
git add scripts/
git commit -m "Update code (no secrets)"
git push
```

### Paso 7.4: Limpiar .env.example

1. Abre `.env.example`
2. Reemplaza TODOS los valores reales con placeholders:

```env
# ANTES (MAL):
FIREBASE_API_KEY=AIzaSyC9x...real-key...

# DESPUÉS (BIEN):
FIREBASE_API_KEY=your-firebase-api-key-here
```

3. Guarda y haz commit:

```powershell
git add .env.example
git commit -m "Replace real credentials with placeholders in .env.example"
git push
```

---

## ✅ CHECKLIST FINAL

Marca cada item cuando lo completes:

### Pre-despliegue:
- [ ] Variables de entorno configuradas en Vercel
- [ ] Migración de productos ejecutada exitosamente
- [ ] Migración de imágenes ejecutada exitosamente
- [ ] Dominios de Apple eliminados de next.config.ts
- [ ] Commit y push a GitHub
- [ ] Despliegue completado en Vercel
- [ ] Sitio carga correctamente en www.iphoneencuotas.com

### Google:
- [ ] Cuenta de Merchant Center creada
- [ ] Dominio verificado
- [ ] Envíos configurados
- [ ] Devoluciones configuradas
- [ ] Feed creado y obtenido
- [ ] Fichas gratuitas activadas
- [ ] Productos sin errores en diagnóstico

### Validación:
- [ ] Rich Results Test: Home ✅
- [ ] Rich Results Test: Categoría ✅
- [ ] Rich Results Test: Producto ✅
- [ ] Schema.org Validator sin errores críticos
- [ ] Sitemap accesible y completo
- [ ] Robots.txt correcto
- [ ] Merchant feed accesible
- [ ] Search Console: Home indexada
- [ ] Search Console: Categoría indexada
- [ ] Search Console: Sitemap enviado

### Seguridad (opcional):
- [ ] Repositorio privado O credenciales rotadas
- [ ] .env.example limpio de secretos reales

---

## 📞 ¿PROBLEMAS?

Si encuentras algún error en cualquiera de estos pasos:

1. **Anota el mensaje de error COMPLETO**
2. **Anota en qué paso estabas**
3. **No sigas adelante** hasta resolver ese paso
4. Pregúntame el error específico y te ayudo

---

**Última actualización**: 2026-08-02  
**Guía creada por**: Claude (Sonnet 5)  
**Estimación de tiempo total**: 3-4 horas  
**Dificultad**: Media (siguiendo esta guía paso a paso)
