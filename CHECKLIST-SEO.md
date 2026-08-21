# ✅ SEO Fix Checklist - Acción Inmediata

## 🚀 Paso 1: Commit y Deploy (AHORA)

```bash
git add .
git commit -m "fix: add generateStaticParams and complete Merchant Listing schema for SEO

- Add generateStaticParams() to pre-generate all product pages
- Include availability, shippingDetails, hasMerchantReturnPolicy in Product schema
- Provide default shipping and return policies in Organization schema
- Fix Google Search Console warnings for Merchant Listings

Fixes indexing issues with dynamic product pages"

git push origin main
```

⏱️ **Espera a que el deploy termine** (5-10 minutos)

---

## 🧪 Paso 2: Verificar el Deploy

### Opción A: Script Automatizado (Recomendado)
```bash
npm run verify:seo
```

### Opción B: Verificación Manual

1. **Robots.txt**: https://www.iphoneencuotas.com/robots.txt
   - ✅ Debe incluir `Sitemap: https://www.iphoneencuotas.com/sitemap.xml`
   - ✅ NO debe bloquear `/iphone/`

2. **Sitemap**: https://www.iphoneencuotas.com/sitemap.xml
   - ✅ Debe incluir todas las URLs de productos
   - ✅ Debe tener fechas `lastmod` recientes

3. **Página de Producto**: https://www.iphoneencuotas.com/iphone/iphone-15-pro
   - ✅ Ver código fuente (Ctrl+U)
   - ✅ Buscar `<script type="application/ld+json">`
   - ✅ Verificar que incluya `"availability"`, `"shippingDetails"`, `"hasMerchantReturnPolicy"`

---

## 🔍 Paso 3: Validar con Google Tools (AHORA)

### Rich Results Test (5 minutos)
1. Ve a: https://search.google.com/test/rich-results
2. Ingresa: `https://www.iphoneencuotas.com/iphone/iphone-15-pro`
3. Espera los resultados
4. **Verifica**:
   - ✅ "Product" válido - Sin errores
   - ✅ "Merchant Listing" detectado
   - ✅ "Breadcrumb" válido

### Schema.org Validator (Opcional)
1. Ve a: https://validator.schema.org/
2. Ingresa: `https://www.iphoneencuotas.com/iphone/iphone-15-pro`
3. Verifica que no haya errores en rojo

---

## 📤 Paso 4: Solicitar Indexación en Google Search Console (AHORA)

### Para el iPhone 15 Pro (Prioritario):
1. Ve a: https://search.google.com/search-console
2. En la barra superior, pega: `https://www.iphoneencuotas.com/iphone/iphone-15-pro`
3. Espera la inspección (30 segundos)
4. Click en **"SOLICITAR INDEXACIÓN"**
5. Espera confirmación

### Repite para otras URLs importantes:
- [ ] `https://www.iphoneencuotas.com/`
- [ ] `https://www.iphoneencuotas.com/iphone-en-cuotas`
- [ ] `https://www.iphoneencuotas.com/iphone/iphone-16-pro`
- [ ] `https://www.iphoneencuotas.com/blog`
- [ ] `https://www.iphoneencuotas.com/terminos`
- [ ] `https://www.iphoneencuotas.com/politica-devoluciones`

---

## 📊 Paso 5: Enviar Sitemap (Si no lo has hecho)

1. Ve a: https://search.google.com/search-console
2. Menú izquierdo → **Sitemaps**
3. Ingresa: `sitemap.xml`
4. Click **ENVIAR**
5. Verifica que aparezca como "Correcto"

---

## ⏰ Paso 6: Monitoreo (Próximos días)

### Día 1-2 (Hoy y mañana):
- [ ] Verifica que las URLs pasen el Rich Results Test
- [ ] Confirma que el sitemap fue procesado en Search Console

### Día 3-7 (Esta semana):
- [ ] Revisa Google Search Console → **Páginas**
- [ ] Verifica que las páginas pasen de "Descubierta - actualmente sin indexar" a "Indexada"
- [ ] Busca en Google: `site:iphoneencuotas.com iphone 15 pro`

### Semana 2:
- [ ] Revisa Search Console → **Mejoras** → **Fichas de comerciantes**
- [ ] Verifica que los warnings hayan desaparecido:
  - ~~Falta "hasMerchantReturnPolicy"~~
  - ~~Falta "shippingDetails"~~
  - ~~Falta "availability"~~

---

## ❓ Si algo sale mal

### Problema: "URL is not on Google" persiste después de 1 semana

**Solución**:
1. Verifica `robots.txt` - asegúrate de que no bloquee la URL
2. Inspecciona la URL en Search Console
3. Lee el error específico en "Coverage" o "Pages"
4. Verifica que no haya meta tag `noindex` en la página
5. Ejecuta: `npm run verify:seo` para diagnóstico

### Problema: Rich Results Test muestra errores

**Solución**:
1. Lee el error específico
2. Verifica que el deploy se completó correctamente
3. Limpia la caché del sitio (Ctrl+Shift+R)
4. Vuelve a probar con la URL

### Problema: Warnings persisten en Search Console

**Solución**:
- Los warnings de `aggregateRating` y `review` son normales si no tienes suficientes reseñas
- Los warnings críticos (`availability`, `shippingDetails`, `hasMerchantReturnPolicy`) deberían desaparecer
- Espera 1-2 semanas para que Google re-crawlee

---

## 🎯 Resultado Esperado Final

✅ **Inmediato** (hoy):
- Rich Results Test pasa sin errores
- Schema validator sin errores críticos

✅ **3-7 días**:
- Páginas cambian a estado "Indexada" en Search Console
- Aparecen en `site:iphoneencuotas.com`

✅ **1-2 semanas**:
- Warnings de Merchant Listings desaparecen
- Rich snippets visibles en resultados de búsqueda
- Mejor ranking para keywords objetivo

---

## 📞 Comandos Útiles

```bash
# Verificar SEO completo
npm run verify:seo

# Ver robots.txt local
cat src/app/robots.ts

# Ver sitemap local
cat src/app/sitemap.ts

# Build local para probar
npm run build

# Ver logs del build
# Busca: "Generating static pages"
# Debería mostrar todas las rutas /iphone/[slug]
```

---

**⚡ ACCIÓN INMEDIATA**: Ejecuta el Paso 1 (commit y push) AHORA.
