# 🚀 GUÍA DE DEPLOY - Comandos Exactos a Ejecutar

**Fecha**: 21 de agosto de 2026  
**Proyectos**: SEO Fixes + Sistema de Variantes (Fase 1)

---

## ⚡ OPCIÓN 1: Deploy Todo Junto (Recomendado)

```bash
# 1. Verificar estado actual
git status

# 2. Ver qué cambios hay
git diff

# 3. Agregar todos los cambios
git add -A

# 4. Verificar qué se va a commitear
git status

# 5. Hacer commit
git commit -m "fix: add generateStaticParams and variant system foundation

SEO Fixes:
- Add generateStaticParams() to pre-generate product pages at build time
- Include availability, shippingDetails, hasMerchantReturnPolicy in all Product schemas
- Provide default shipping and return policies in Organization schema
- Create verification script (npm run verify:seo)

Variant System (Phase 1 - Foundation):
- Add BatteryHealth type (100, 95, 90, 85, 80)
- Add batteryHealth, isVariant, masterProductId fields to Product interface
- Create queries: getVariantsByMasterId, hasVariants, getAllMasterProducts
- Add migration script (npm run migrate:variant-fields)
- Full backward compatibility maintained

Fixes Google Search Console indexing issues
Resolves 'Discovered - currently not indexed' status
Resolves Merchant Listing warnings

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"

# 6. Push a producción
git push origin main
```

---

## ⚡ OPCIÓN 2: Deploy Solo SEO (Si quieres separar)

```bash
# Solo agregar archivos de SEO
git add src/app/(public)/iphone/[slug]/page.tsx
git add src/app/(public)/iphone-en-cuotas/page.tsx
git add src/lib/utils/schema.ts
git add scripts/verify-seo.ts
git add package.json
git add SEO-FIXES-IMPLEMENTADAS.md
git add CHECKLIST-SEO.md

git commit -m "fix: add generateStaticParams and complete Merchant Listing schema

- Add generateStaticParams() to pre-generate all product pages at build time
- Include availability, shippingDetails, hasMerchantReturnPolicy in all Product schemas
- Provide default shipping and return policies in Organization schema
- Add availability at both Product and Offer levels
- Create verification script (npm run verify:seo)

Fixes Google Search Console indexing issues
Resolves Merchant Listing warnings for availability, shippingDetails, hasMerchantReturnPolicy

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"

git push origin main
```

**Luego deploy de Variantes**:
```bash
git add src/types/product.ts
git add src/lib/firebase/products.ts
git add scripts/migrate-add-variant-fields.ts
git add package.json
git add ANALISIS-SISTEMA-VARIANTES.md
git add FASE-1-COMPLETADA.md

git commit -m "feat: add variant system foundation (Phase 1)

- Add BatteryHealth type and variant fields to Product interface
- Add batteryHealth, isVariant, masterProductId fields
- Create queries for variants: getVariantsByMasterId, hasVariants, getAllMasterProducts
- Add migration script to safely add new fields to existing products
- Maintain full backward compatibility with existing products

Phase 1: Foundation - No visible changes, no breaking changes"

git push origin main
```

---

## 📋 Después del Deploy

### 1. Verificar Build (Automático en Vercel/Netlify)
Espera a que el deploy termine y verifica:
- ✅ Build exitoso
- ✅ No hay errores de TypeScript
- ✅ Deploy completo

### 2. Verificar SEO (5 minutos después)

```bash
# Si tu sitio es accesible públicamente
npm run verify:seo
```

**O manualmente**:
1. Ve a https://www.iphoneencuotas.com/robots.txt
2. Ve a https://www.iphoneencuotas.com/sitemap.xml
3. Ve a https://www.iphoneencuotas.com/iphone/iphone-15-pro
4. Inspecciona el código fuente (Ctrl+U)
5. Busca `<script type="application/ld+json">`
6. Verifica que incluya `availability`, `shippingDetails`, `hasMerchantReturnPolicy`

### 3. Validar con Google Tools

#### Rich Results Test:
```
1. Ve a: https://search.google.com/test/rich-results
2. Ingresa: https://www.iphoneencuotas.com/iphone/iphone-15-pro
3. Espera resultados (30-60 segundos)
4. Verifica:
   ✅ "Product" válido
   ✅ "Merchant Listing" detectado
   ✅ Sin errores críticos
```

#### Schema.org Validator:
```
1. Ve a: https://validator.schema.org/
2. Ingresa: https://www.iphoneencuotas.com/iphone/iphone-15-pro
3. Verifica sin errores en rojo
```

### 4. Solicitar Indexación (Google Search Console)

```
Para cada URL importante:

1. Ve a: https://search.google.com/search-console
2. Pega URL: https://www.iphoneencuotas.com/iphone/iphone-15-pro
3. Click "SOLICITAR INDEXACIÓN"
4. Espera confirmación

URLs prioritarias:
- https://www.iphoneencuotas.com/
- https://www.iphoneencuotas.com/iphone-en-cuotas
- https://www.iphoneencuotas.com/iphone/iphone-15-pro
- https://www.iphoneencuotas.com/blog
- https://www.iphoneencuotas.com/terminos
- https://www.iphoneencuotas.com/politica-devoluciones
```

### 5. Ejecutar Migración de Variantes (Solo si deployaste Fase 1)

**IMPORTANTE**: Solo ejecutar después de verificar que el deploy funciona correctamente

```bash
# Opción A: Localmente (si tienes .env.local con credenciales de producción)
npm run migrate:variant-fields

# Opción B: En el servidor (si tienes acceso SSH)
ssh usuario@servidor
cd /ruta/al/proyecto
npm run migrate:variant-fields

# Opción C: Manualmente en Firestore Console
# Ve a Firebase Console → Firestore
# Agrega campos manualmente a cada producto:
# - batteryHealth: null (para nuevos) o 90 (para reacondicionados)
# - isVariant: false
# - masterProductId: null
```

---

## 🧪 Testing Post-Deploy

### Test 1: Página de Producto
```
1. Ve a: https://www.iphoneencuotas.com/iphone/iphone-15-pro
2. Verifica que carga correctamente
3. Verifica que el precio se muestra
4. Verifica que puedes hacer reserva
5. ✅ Todo funciona como antes
```

### Test 2: Admin Panel
```
1. Login en: https://www.iphoneencuotas.com/admin
2. Ve a Productos
3. Verifica que todos los productos se muestran
4. Edita un producto
5. Guarda sin cambios
6. ✅ Todo funciona como antes
```

### Test 3: Sitemap
```
1. Ve a: https://www.iphoneencuotas.com/sitemap.xml
2. Verifica que incluye todas las URLs de productos
3. ✅ Debe incluir /iphone/iphone-15-pro
```

---

## 📊 Monitoreo (Próximos Días)

### Día 1-2 (Hoy y mañana):
```
[ ] Rich Results Test pasa sin errores
[ ] Schema Validator sin errores
[ ] Sitemap procesado en Search Console
```

### Día 3-7 (Esta semana):
```
[ ] Revisar Google Search Console → Páginas
[ ] Buscar: site:iphoneencuotas.com iphone 15 pro
[ ] Verificar que páginas cambian de "Descubierta" a "Indexada"
```

### Semana 2:
```
[ ] Revisar Mejoras → Fichas de comerciantes
[ ] Verificar que warnings desaparecieron
[ ] Monitorear tráfico orgánico
```

---

## ⚠️ Si Algo Sale Mal

### Error en Build:
```bash
# Ver logs del build en Vercel/Netlify
# Buscar errores de TypeScript
# Verificar que no hay import faltantes
```

### Páginas no cargan:
```bash
# Verificar en la consola del navegador (F12)
# Ver Network tab para errores
# Verificar que Firebase está respondiendo
```

### Migración falla:
```bash
# Revisar .env.local
# Verificar credenciales de Firebase
# Ver logs del script
# Rollback no necesario (campos nuevos simplemente quedan sin usar)
```

### Rich Results Test falla:
```bash
# Limpiar caché del navegador (Ctrl+Shift+R)
# Esperar 5-10 minutos después del deploy
# Volver a probar
# Leer mensaje de error específico
```

---

## 🎯 Resultado Esperado Final

### Inmediato (Hoy):
- ✅ Deploy exitoso sin errores
- ✅ Rich Results Test pasa
- ✅ Schema Validator sin errores
- ✅ Sitio funciona normalmente

### 3-7 días:
- ✅ Páginas cambian a "Indexada" en Search Console
- ✅ Aparecen en `site:iphoneencuotas.com`

### 1-2 semanas:
- ✅ Warnings de Merchant Listings desaparecen
- ✅ Rich snippets visibles en búsquedas
- ✅ Mejor ranking para keywords

---

## 📝 Checklist Final

### Pre-Deploy:
- [ ] Revisar cambios con `git diff`
- [ ] Verificar que no hay archivos sensibles (.env)
- [ ] Leer los commit messages

### Deploy:
- [ ] `git add -A`
- [ ] `git commit -m "..."`
- [ ] `git push origin main`
- [ ] Esperar build exitoso

### Post-Deploy:
- [ ] Verificar sitio carga correctamente
- [ ] `npm run verify:seo` (si es posible)
- [ ] Rich Results Test
- [ ] Solicitar indexación en Google Search Console
- [ ] (Opcional) Ejecutar migración de variantes

### Monitoreo:
- [ ] Agregar reminder para revisar en 3 días
- [ ] Agregar reminder para revisar en 1 semana
- [ ] Agregar reminder para revisar en 2 semanas

---

## 💡 Tips

### Tip 1: Backup
```bash
# Antes de hacer push, crear backup local
git branch backup-antes-seo-y-variantes
```

### Tip 2: Deploy Gradual
Si tienes dudas, deploy primero solo SEO, espera 1 día, luego deploy variantes.

### Tip 3: Monitoreo
Agrega Google Search Console a tu rutina diaria por las próximas 2 semanas.

### Tip 4: Comunicación
Si tienes un equipo, comunica los cambios y que no hay cambios visibles (aún).

---

**¿Listo para deploy?** 🚀

Ejecuta los comandos de la Opción 1 o 2 según prefieras.

**¿Dudas?** Revisa:
- `SEO-FIXES-IMPLEMENTADAS.md`
- `FASE-1-COMPLETADA.md`
- `RESUMEN-TRABAJO-COMPLETADO.md`
