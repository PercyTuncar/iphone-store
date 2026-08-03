# Guía de Implementación SEO - iPhone en Cuotas

## Implementación completada según PRD v3

Este documento describe todos los cambios implementados y los pasos necesarios para desplegar las mejoras SEO.

---

## 📋 Resumen de cambios implementados

### ✅ Bugs críticos corregidos

1. **Bug #1 - Canonical URLs**: 
   - ✅ Agregado `canonical` en layout.tsx, page.tsx, blog, términos
   - ✅ Cambiado dominio base de `iphoneencuotas.com` a `www.iphoneencuotas.com`
   - ✅ Redirección 301 agregada en next.config.ts

2. **Bug #2 - Imágenes hotlinkeadas**:
   - ⚠️ **ACCIÓN REQUERIDA**: Migrar imágenes de Apple a Firebase Storage
   - ✅ Endpoint de Merchant Center valida imágenes propias
   - 🔜 Después de migrar: quitar dominios de Apple de `next.config.ts`

3. **Bug #3 - force-dynamic**:
   - ✅ Cambiado a `revalidate = 300` (ISR cada 5 minutos)

4. **Bug #4 - Validación admin**:
   - 🔜 **PENDIENTE**: Implementar en ProductForm.tsx (próximo paso)

5. **Bug #7 - itemCondition**:
   - ✅ Implementado mapeo en buildProductSchema()

### ✅ Nuevas funcionalidades

1. **Tipos actualizados** (`src/types/product.ts`):
   - ✅ Agregados: `sku`, `mpn`, `gtin`, `category`, `googleProductCategoryId`, `productGroupId`

2. **Schema.ts completo** con todas las funciones del PRD:
   - ✅ `buildProductSchema()` - Producto completo con todos los campos recomendados
   - ✅ `buildProductGroupSchema()` - Variantes de producto
   - ✅ `buildFAQSchema()` - Preguntas frecuentes
   - ✅ `buildOrganizationSchema()` - Organización con políticas
   - ✅ `buildWebsiteSchema()` - WebSite con SearchAction
   - ✅ `buildItemListSchema()` - Lista de productos para categoría
   - ✅ `buildCollectionPageSchema()` - Página de categoría
   - ✅ `buildBreadcrumbSchema()` - Migas de pan

3. **Página de categoría** (`/iphone-en-cuotas`):
   - ✅ Creada página completa con SEO optimizado
   - ✅ ItemList schema implementado
   - ✅ FAQ específica de categoría
   - ✅ Contenido optimizado para keyword principal

4. **Breadcrumbs actualizados**:
   - ✅ Productos ahora apuntan a `/iphone-en-cuotas` en vez de `/#modelos`

5. **Sitemap y Robots**:
   - ✅ Agregada página `/iphone-en-cuotas` al sitemap
   - ✅ Bloqueadas rutas transaccionales en robots.txt
   - ✅ Agregado noindex a páginas client-side

6. **Google Merchant Center**:
   - ✅ Endpoint `/api/merchant-feed` creado
   - ✅ Feed XML con todos los atributos requeridos
   - ✅ Soporte para atributo `[installment]`

---

## 🚀 Pasos para desplegar

### 1. Configurar variables de entorno

**CRÍTICO**: Actualiza tu archivo `.env` (o variables en Vercel):

```bash
# IMPORTANTE: Usar dominio con www
NEXT_PUBLIC_SITE_URL=https://www.iphoneencuotas.com

# Resto de variables existentes...
NEXT_PUBLIC_FIREBASE_API_KEY=...
```

### 2. Configurar redirección de dominio

En Vercel (o tu hosting):
1. Ve a Settings → Domains
2. Asegúrate de que `www.iphoneencuotas.com` sea el dominio principal
3. Configura `iphoneencuotas.com` para que redirija a `www.iphoneencuotas.com`

Alternativamente, la redirección está implementada en `next.config.ts` pero es mejor hacerlo a nivel DNS/hosting.

### 3. Migrar productos existentes

Ejecuta el script de migración para agregar los nuevos campos a productos existentes:

```bash
# Instalar dependencias si no están
npm install firebase-admin dotenv ts-node --save-dev

# Ejecutar migración
npx ts-node scripts/migrate-products.ts
```

El script agregará automáticamente:
- `sku` (basado en slug)
- `category` (default)
- `googleProductCategoryId` (267 = Mobile Phones)
- `productGroupId` (basado en model)
- `mpn` y `gtin` (null, rellenar manualmente después)

### 4. Migrar imágenes de productos

**CRÍTICO ANTES DE PRODUCCIÓN**:

1. Ejecutar script de migración de imágenes (crear script que):
   - Descargue todas las imágenes de `cdsassets.apple.com` y `www.apple.com`
   - Las suba a Firebase Storage
   - Actualice los campos `images` y `thumbnailUrl` en Firestore

2. Una vez migradas TODAS las imágenes, quitar de `next.config.ts`:
```typescript
// ELIMINAR estas entradas después de migrar:
{
  protocol: 'https',
  hostname: 'www.apple.com',
},
{
  protocol: 'https',
  hostname: 'cdsassets.apple.com',
},
```

### 5. Actualizar navegación

**Actualizar enlaces en**:
- `src/components/layout/Navbar.tsx` (si existe)
- `src/components/layout/Footer.tsx` (si existe)
- Cualquier otro componente que enlace a `/#modelos`

Cambiar por enlaces a `/iphone-en-cuotas`

### 6. Configurar Google Merchant Center

1. Crear cuenta en `merchants.google.com`
2. Verificar dominio (reutilizar verificación de Search Console)
3. Configurar:
   - País de destino: Perú (PE)
   - Moneda: PEN
   - Método de envío y políticas en la configuración de cuenta
4. Crear fuente de datos:
   - Tipo: "Scheduled fetch"
   - URL: `https://www.iphoneencuotas.com/api/merchant-feed`
   - Frecuencia: Diaria
5. Activar "Fichas gratuitas" (Free listings)

### 7. Validar implementación

Antes de dar por terminado, validar:

1. **Rich Results Test**:
   - Home: https://search.google.com/test/rich-results?url=https://www.iphoneencuotas.com
   - Categoría: https://search.google.com/test/rich-results?url=https://www.iphoneencuotas.com/iphone-en-cuotas
   - Producto: https://search.google.com/test/rich-results?url=https://www.iphoneencuotas.com/iphone/[slug]

2. **Schema.org Validator**:
   - https://validator.schema.org/

3. **Canonical URLs**:
```bash
curl -I https://iphoneencuotas.com
# Debe devolver 301 → https://www.iphoneencuotas.com

curl -I https://www.iphoneencuotas.com
# Debe devolver 200
```

4. **Sitemap**:
   - Verificar: https://www.iphoneencuotas.com/sitemap.xml
   - Confirmar que incluye `/iphone-en-cuotas`

5. **Merchant Feed**:
   - Verificar: https://www.iphoneencuotas.com/api/merchant-feed
   - Debe devolver XML válido

### 8. Search Console

Después del despliegue:

1. Solicitar indexación manual de:
   - Home (`/`)
   - Categoría (`/iphone-en-cuotas`)
   - Cada producto actualizado

2. Enviar sitemap actualizado

3. Monitorear errores en:
   - Cobertura de índice
   - Mejoras → Productos
   - Mejoras → Breadcrumbs

---

## ⚠️ Advertencias importantes

### Sobre las imágenes
**NO DESPLEGAR A PRODUCCIÓN** sin migrar primero las imágenes de Apple a Firebase Storage. Esto es crítico por:
- Riesgo de hotlinking bloqueado por Apple
- Requisito de Merchant Center (imágenes propias)
- Penalización potencial por "Misrepresentation"

### Sobre los GTINs
**NUNCA inventes valores de GTIN**. Si no tienes el código real, deja el campo en `null`. Un GTIN falso puede causar suspensión de cuenta en Merchant Center.

### Sobre los sitelinks
Los "sitelinks" (efecto EDteam) son 100% algorítmicos. La página `/iphone-en-cuotas` y la arquitectura mejorada AUMENTAN la probabilidad, pero Google decide cuándo y cuáles mostrar. No prometas resultados inmediatos.

---

## 📊 Métricas a monitorear

Después del despliegue, monitorear semanalmente:

1. **Search Console**:
   - Impresiones para "iphone en cuotas"
   - CTR de la página de categoría
   - Productos con errores de indexación

2. **Merchant Center**:
   - Productos aprobados vs. rechazados
   - Clics en fichas gratuitas
   - Diagnóstico de feed

3. **Analytics**:
   - Tráfico orgánico a `/iphone-en-cuotas`
   - Tasa de conversión desde búsqueda orgánica

---

## 🔜 Próximos pasos (no implementados aún)

1. **Bug #4**: Validación completa en ProductForm.tsx
2. **Bug #5**: Implementar schemaOverride real o quitar el campo
3. **Bug #6**: Ligar priceValidUntil a promociones reales o quitarlo
4. **Imágenes**: Script de migración de imágenes de Apple → Firebase
5. **StorePolicy**: Crear UI en `/admin/configuracion` para editar políticas
6. **Variantes**: Implementar consulta `getSiblingVariants()` para ProductGroup
7. **Sitemap de imágenes**: Crear sitemap específico para imágenes

---

## 📞 Soporte

Para preguntas sobre la implementación:
- Revisar el PRD completo en la raíz del proyecto
- Consultar la documentación oficial de Google Search Central
- Verificar logs de Merchant Center para diagnóstico de feed

---

**Última actualización**: 2026-08-02
**Versión del PRD**: v3 (completo)
