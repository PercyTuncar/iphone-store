# Solución: Error "Página con redirección" en Google Search Console

**Fecha**: 8 de septiembre de 2026  
**Estado**: ✅ RESUELTO - Código corregido, pendiente configuración en Vercel

---

## 📊 Diagnóstico del Problema

### Síntomas
Google Search Console reportó el error **"Página con redirección"** para 3 URLs:
- `http://www.iphoneencuotas.com/`
- `http://iphoneencuotas.com/`
- `https://iphoneencuotas.com/`

### Causa Raíz: Cadena de Redirecciones Múltiples

Google detectó **cadenas de 2 redirecciones** que afectan la indexación:

```
http://iphoneencuotas.com/ 
  → 301: https://iphoneencuotas.com/ (Vercel: HTTP → HTTPS)
  → 308: https://www.iphoneencuotas.com/ (Next.js: sin www → www)
```

**Problema**: Las redirecciones múltiples ralentizan el rastreo y Google marca las URLs intermedias como "no indexadas".

### Verificación con curl

```bash
# URL sin www y sin HTTPS - 2 redirecciones
curl -sIL http://iphoneencuotas.com/ | grep -E "^(HTTP|Location):"
# Location: https://iphoneencuotas.com/
# Location: https://www.iphoneencuotas.com/

# URL con www pero sin HTTPS - 1 redirección ✅
curl -sI http://www.iphoneencuotas.com/ | grep "Location:"
# Location: https://www.iphoneencuotas.com/

# URL con HTTPS pero sin www - 1 redirección ✅
curl -sI https://iphoneencuotas.com/ | grep "Location:"
# Location: https://www.iphoneencuotas.com/

# URL canónica - sin redirecciones ✅
curl -sI https://www.iphoneencuotas.com/ | grep "HTTP"
# HTTP/2 200
```

---

## ✅ Solución Implementada

### 1. Corrección de URLs Hardcodeadas en el Código

**Archivos corregidos**:
- ✅ `src/components/admin/ProductForm.tsx` (5 instancias)

**Cambios realizados**:
```diff
- https://iphoneencuotas.com/
+ https://www.iphoneencuotas.com/

- iphoneencuotas.com › producto
+ www.iphoneencuotas.com › producto
```

**Archivos que ya estaban correctos** ✅:
- `src/app/layout.tsx` - usa `process.env.NEXT_PUBLIC_SITE_URL`
- `src/app/sitemap.ts` - usa `process.env.NEXT_PUBLIC_SITE_URL`
- `src/app/robots.ts` - usa `process.env.NEXT_PUBLIC_SITE_URL`
- `.env.local` - tiene `NEXT_PUBLIC_SITE_URL=https://www.iphoneencuotas.com`

### 2. Configuración Actual de Redirecciones

**En `next.config.ts`** (líneas 57-72):
```typescript
async redirects() {
  return [
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'iphoneencuotas.com' }],
      destination: 'https://www.iphoneencuotas.com/:path*',
      permanent: true, // 308
    },
  ];
}
```

Esta configuración es **correcta** pero se ejecuta **después** de la redirección HTTP→HTTPS de Vercel, creando la cadena doble.

---

## 🎯 Pasos Pendientes: Configuración en Vercel

### Opción Recomendada: Configurar Dominio en Vercel Dashboard

Esta es la solución **óptima** porque Vercel manejará ambas redirecciones (HTTP→HTTPS y sin www→www) en **una sola redirección 308**.

#### Pasos a seguir:

1. **Ir a Vercel Dashboard**
   - Abre [vercel.com](https://vercel.com)
   - Selecciona tu proyecto `iphone-en-cuotas`

2. **Ir a Settings → Domains**

3. **Agregar ambos dominios si no están**:
   - `www.iphoneencuotas.com` ← Dominio principal
   - `iphoneencuotas.com` ← Dominio apex

4. **Configurar redirección automática**:
   - Busca el dominio `iphoneencuotas.com` (sin www)
   - Haz clic en **"Edit"** o el botón de configuración
   - En **"Redirect to"** selecciona: `www.iphoneencuotas.com`
   - Marca como **"Permanent redirect (308)"**
   - Guarda los cambios

5. **Verificar que `www.iphoneencuotas.com` es el dominio primario**:
   - Debe aparecer marcado como **"Primary Domain"**
   - Si no lo está, haz clic en los 3 puntos y selecciona **"Set as Primary Domain"**

#### Resultado Esperado:

Después de esta configuración, Vercel manejará:
```
http://iphoneencuotas.com/ → 308 → https://www.iphoneencuotas.com/
https://iphoneencuotas.com/ → 308 → https://www.iphoneencuotas.com/
http://www.iphoneencuotas.com/ → 308 → https://www.iphoneencuotas.com/
```

**Todo en una sola redirección** gracias a la configuración de Vercel.

### Variables de Entorno a Verificar en Vercel

Asegúrate de que en **Settings → Environment Variables** tengas:

```env
NEXT_PUBLIC_SITE_URL=https://www.iphoneencuotas.com
```

Para todos los entornos (Production, Preview, Development).

---

## 📝 Verificación Post-Implementación

### 1. Verificar redirecciones después de deployar

```bash
# Todas estas URLs deben llevar a https://www.iphoneencuotas.com/ en UNA sola redirección
curl -sI http://iphoneencuotas.com/ | grep -E "^(HTTP|Location):"
curl -sI https://iphoneencuotas.com/ | grep -E "^(HTTP|Location):"
curl -sI http://www.iphoneencuotas.com/ | grep -E "^(HTTP|Location):"

# Esta NO debe tener redirecciones
curl -sI https://www.iphoneencuotas.com/ | grep "HTTP"
```

### 2. Verificar canonical tag

```bash
curl -sL https://www.iphoneencuotas.com/ | grep -o '<link[^>]*canonical[^>]*>'
```

Debe devolver:
```html
<link rel="canonical" href="https://www.iphoneencuotas.com"/>
```

### 3. Verificar sitemap

```bash
curl -sL https://www.iphoneencuotas.com/sitemap.xml | head -20
```

Todas las URLs deben usar `https://www.iphoneencuotas.com`.

### 4. Solicitar reindexación en Google Search Console

Una vez que todo esté configurado:

1. Ve a [Google Search Console](https://search.google.com/search-console)
2. Selecciona la propiedad `https://www.iphoneencuotas.com`
3. Ve a **"Indexación de páginas"** en el menú lateral
4. Haz clic en **"Página con redirección"**
5. Haz clic en **"Validar corrección"**
6. Google comenzará a re-rastrear las URLs (puede tardar varios días)

También puedes solicitar indexación individual:
1. Ve a **"Inspección de URLs"** en la parte superior
2. Ingresa: `https://www.iphoneencuotas.com/`
3. Haz clic en **"Solicitar indexación"**

---

## 🔍 Referencias y Documentación

### Google Search Console
- [Page with Redirect Status](https://support.google.com/webmasters/answer/7440203?hl=en) - Documentación oficial de Google
- [How to Fix Page with Redirect Error](https://searchengineland.com/how-to-fix-the-page-with-redirect-error-in-google-search-console-450184) - Guía detallada
- [Understanding Page with Redirect](https://aioseo.com/es/docs/understanding-the-page-with-redirect-status-in-google-search-console/) - Documentación en español

### Vercel
- [Deploying & Redirecting Domains](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting) - Documentación oficial de Vercel
- [How to Add Custom Domain](https://vercel.com/guides/how-do-i-add-a-custom-domain-to-my-vercel-project) - Guía de configuración

### SEO Best Practices
- Google recomienda usar **una sola redirección** máximo
- Vercel recomienda usar **www como dominio primario** para mejor control del CDN
- Las redirecciones 308 son permanentes y cacheadas por los navegadores

---

## ⚡ Resumen de Cambios

### ✅ Completado (Código)
- [x] Corregidas URLs hardcodeadas en `ProductForm.tsx`
- [x] Verificadas variables de entorno en `.env.local`
- [x] Verificada configuración de canonical tags
- [x] Verificada configuración de sitemap y robots.txt

### ⏳ Pendiente (Infraestructura)
- [ ] Configurar redirección en Vercel Dashboard
- [ ] Verificar variable `NEXT_PUBLIC_SITE_URL` en Vercel
- [ ] Hacer deploy y verificar redirecciones
- [ ] Solicitar reindexación en Google Search Console

---

## 💡 Notas Importantes

1. **No elimines la configuración de `redirects()` en `next.config.ts`**. Es una capa de seguridad adicional en caso de que alguien acceda directamente a través de tu servidor.

2. **Google puede tardar de 1 a 4 semanas** en re-rastrear y actualizar el índice después de la corrección.

3. **El estado "Página con redirección" es normal** para las URLs sin www. Lo importante es que la URL canónica (`https://www.iphoneencuotas.com/`) esté indexada correctamente.

4. **Mantén siempre consistencia** en todas las URLs internas de tu sitio - siempre usa `https://www.iphoneencuotas.com`.

---

**Próximo paso**: Configurar la redirección en Vercel Dashboard siguiendo los pasos de la sección "Opción Recomendada" arriba. ☝️
