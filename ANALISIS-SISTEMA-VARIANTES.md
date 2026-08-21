# 📋 ANÁLISIS COMPLETO DEL SISTEMA ACTUAL - Sistema de Variantes de Producto

**Fecha**: 21 de agosto de 2026  
**Objetivo**: Implementar sistema de variantes para agrupar iPhones con diferentes condiciones físicas y de batería bajo una URL única

---

## 🔍 1. AUDITORÍA DE LA BASE DE DATOS ACTUAL

### Estructura Actual en Firestore (Collection: `products`)

#### Campos Existentes:
```typescript
interface Product {
  // Identificación
  id: string;                    // Firestore document ID
  slug: string;                  // URL amigable (ej: "iphone-15-pro")
  status: 'published' | 'draft' | 'archived';
  
  // Información Básica
  title: string;                 // Ej: "iPhone 15 Pro"
  model: string;                 // Ej: "iPhone 15 Pro"
  storage: '64GB' | '128GB' | '256GB' | '512GB' | '1TB';
  color: string;                 // Ej: "Titanio azul"
  condition: 'new' | 'refurbished';
  grade: 'A+' | 'A' | 'B' | null; // Solo para refurbished
  stock: number;
  
  // SEO/Schema (YA IMPLEMENTADO)
  sku: string;                   // ✅ Existe
  mpn: string | null;            // ✅ Existe
  gtin: string | null;           // ✅ Existe
  category: string;              // ✅ Existe
  googleProductCategoryId: string; // ✅ Existe
  productGroupId: string;        // ✅ Existe (para variantes)
  
  // Imágenes
  images: string[];              // Array de URLs
  thumbnailUrl: string;
  
  // Precios
  priceTotal: number;
  installments: number;
  installmentAmount: number;
  interestRate: number;
  downPayment: number;
  
  // Penalidades e Seguros
  penaltyTier1Days: number;
  penaltyTier1Amount: number;
  penaltyTier2Days: number;
  penaltyTier2Amount: number;
  penaltyTier3Days: number;
  penaltyTier3Amount: number;
  insurancePlan1Month: number;
  insurancePlan2Months: number;
  insurancePlan3Months: number;
  insuranceCheckoutDiscount1Month: number;
  
  // Métodos de Pago
  yapeNumber: string;
  transferAccountHolder: string;
  transferBank: string;
  transferAccountNumber: string;
  transferCci: string;
  onlinePaymentLink: string;
  isYapeEnabled: boolean;
  isOnlinePaymentEnabled: boolean;
  
  // Especificaciones Técnicas
  specs: {
    display: string;
    chip: string;
    camera: string;
    battery: string;
    connectivity: string;
    os: string;
  };
  
  // SEO
  seo: {
    metaTitle: string;
    metaDescription: string;
    h1: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterTitle: string;
    twitterDescription: string;
    schemaOverride: string | null;
  };
  
  // Contenido de Página
  pageContent: {
    heroHeadline: string;
    heroSubheadline: string;
    howItWorks: string;
    faqItems: Array<{question: string; answer: string}>;
  };
  
  // Estadísticas
  averageRating: number;
  reviewCount: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;
}
```

### ❌ Campos que FALTAN para Variantes:

```typescript
// NUEVO: Campos necesarios para sistema de variantes
interface ProductVariantFields {
  // Campo crítico para diferenciar condición de batería
  batteryHealth: number;         // ❌ NO EXISTE - Porcentaje: 100, 95, 90, 85, 80
  
  // Clasificación de condición estética más detallada
  // Ya existe "grade" pero solo para refurbished
  // Necesitamos ser más específicos
  
  // Indicador de si este producto ES una variante o un maestro
  isVariant: boolean;            // ❌ NO EXISTE - true si es variante, false si es maestro
  masterProductId: string | null; // ❌ NO EXISTE - ID del producto maestro si es variante
}
```

---

## 🎯 2. PROBLEMA ACTUAL Y OBJETIVOS

### Problema Actual:
- **URL actual en sitemap**: Solo existe `https://www.iphoneencuotas.com/iphone/iphone-15-pro`
- **Limitación**: Si hay múltiples unidades con diferente batería/estética, el admin debe:
  1. Crear productos duplicados con slugs diferentes (ej: `iphone-15-pro-bateria-90`)
  2. Esto genera:
     - ❌ Canibalización SEO
     - ❌ Contenido duplicado
     - ❌ Pérdida de autoridad de enlaces
     - ❌ Mala UX (usuario ve múltiples páginas del mismo modelo)

### Objetivo Final:
- **URL única**: `https://www.iphoneencuotas.com/iphone-15-pro`
- **Selectores dinámicos**: Usuario elige capacidad, color, estética, batería
- **Actualización en tiempo real**: Precio y cuota se actualizan sin recargar
- **SEO correcto**: Schema ProductGroup con variantes en offers

---

## 📐 3. ARQUITECTURA PROPUESTA

### Opción A: Modelo "Maestro + Variantes" (RECOMENDADA)

```
Product Maestro (URL pública)
├── id: "abc123"
├── slug: "iphone-15-pro"
├── model: "iPhone 15 Pro"
├── isVariant: false
├── masterProductId: null
├── Campos comunes (specs, SEO, pageContent)
└── NO tiene stock propio

Product Variante 1
├── id: "var001"
├── slug: "iphone-15-pro-128gb-azul-a-100"  (no público)
├── isVariant: true
├── masterProductId: "abc123"
├── storage: "128GB"
├── color: "Titanio azul"
├── condition: "refurbished"
├── grade: "A"
├── batteryHealth: 100
├── stock: 2
├── priceTotal: 2500
└── status: "published"

Product Variante 2
├── id: "var002"
├── isVariant: true
├── masterProductId: "abc123"
├── storage: "128GB"
├── color: "Titanio azul"
├── grade: "B"
├── batteryHealth: 85
├── stock: 1
├── priceTotal: 2200
└── status: "published"
```

**Ventajas**:
- ✅ No rompe productos existentes
- ✅ Fácil de consultar (query por masterProductId)
- ✅ Cada variante tiene su propio stock independiente
- ✅ Redirecciones 301 simples desde variantes antiguas

**Desventajas**:
- ⚠️ Más documentos en Firestore (pero no es problema)

### Opción B: Subcollection "Variants"

```
products/abc123
├── (campos maestros)
└── variants/ (subcollection)
    ├── var001 {...}
    ├── var002 {...}
```

**Desventajas**:
- ❌ Queries más complejas
- ❌ No se puede usar `getAllPublishedProducts()` fácilmente
- ❌ Más difícil migrar productos existentes

### ✅ DECISIÓN: Opción A (Maestro + Variantes en misma collection)

---

## 🗄️ 4. MIGRACIÓN DE BASE DE DATOS

### Paso 1: Agregar nuevos campos a tipos TypeScript

```typescript
// src/types/product.ts - AGREGAR
export type BatteryHealth = 100 | 95 | 90 | 85 | 80;

export interface Product {
  // ... campos existentes ...
  
  // NUEVOS CAMPOS
  batteryHealth: BatteryHealth | null; // null para productos nuevos
  isVariant: boolean;                   // true si es variante
  masterProductId: string | null;       // ID del maestro (si isVariant = true)
}
```

### Paso 2: Script de Migración (NO destructivo)

```typescript
// scripts/migrate-to-variants.ts
// Este script:
// 1. Lee todos los productos existentes
// 2. Agrega campos: isVariant = false, masterProductId = null, batteryHealth = null
// 3. NO modifica nada más
// 4. SOLO para productos que no tienen estos campos
```

### Paso 3: Actualizar ProductForm

- Agregar campo `batteryHealth` (select con opciones)
- Agregar checkbox `isVariant`
- Si `isVariant = true`, mostrar selector de "Producto Maestro"

---

## 📄 5. CAMBIOS EN FRONTEND

### A. Página de Producto `/iphone/[slug]/page.tsx`

**Comportamiento actual**:
```typescript
getProductBySlug(slug) → Muestra UN solo producto
```

**Comportamiento nuevo**:
```typescript
// 1. Buscar producto maestro por slug
const master = await getProductBySlug(slug);

// 2. Si NO es variante (producto antiguo), mostrar como siempre
if (!master.isVariant) {
  return <ProductPageTradicional product={master} />;
}

// 3. Si ES maestro, obtener sus variantes
const variants = await getVariantsByMasterId(master.id);

// 4. Mostrar página con selectores
return <ProductPageWithVariants master={master} variants={variants} />;
```

### B. Componente `<ProductVariantSelector>`

```typescript
interface Props {
  master: Product;
  variants: Product[];
}

// Estado
const [selectedStorage, setSelectedStorage] = useState<StorageCapacity>('128GB');
const [selectedColor, setSelectedColor] = useState<string>('');
const [selectedGrade, setSelectedGrade] = useState<ProductGrade | 'new'>('new');
const [selectedBattery, setSelectedBattery] = useState<BatteryHealth>(100);

// Filtrado dinámico
const availableVariants = variants.filter(v =>
  v.storage === selectedStorage &&
  v.color === selectedColor &&
  v.grade === selectedGrade &&
  v.batteryHealth === selectedBattery &&
  v.stock > 0
);

const currentVariant = availableVariants[0] || null;
const price = currentVariant?.priceTotal || master.priceTotal;
const installment = currentVariant?.installmentAmount || master.installmentAmount;

// Actualización en tiempo real
<div className="price-display">
  <p>{installments} cuotas de</p>
  <h2>{formatSoles(installment)}</h2>
  <p>Total: {formatSoles(price)}</p>
</div>

// Selectores
<select onChange={(e) => setSelectedStorage(e.target.value)}>
  {uniqueStorages.map(s => <option value={s}>{s}</option>)}
</select>

<select onChange={(e) => setSelectedBatteryHealth(Number(e.target.value))}>
  <option value="100">100% (Nuevo)</option>
  <option value="95">90-99%</option>
  <option value="90">85-94%</option>
  <option value="85">80-89%</option>
</select>
```

---

## 🔍 6. SEO Y SCHEMA (CRÍTICO)

### A. Investigación en Schema.org

Según [Google Product Variants Documentation](https://developers.google.com/search/docs/appearance/structured-data/product-variants):

**ProductGroup** es la clase correcta para agrupar variantes.

```json
{
  "@context": "https://schema.org/",
  "@type": "ProductGroup",
  "@id": "https://www.iphoneencuotas.com/#productgroup-iphone-15-pro",
  "name": "iPhone 15 Pro",
  "description": "...",
  "url": "https://www.iphoneencuotas.com/iphone-15-pro",
  "productGroupID": "iphone-15-pro",
  "variesBy": [
    "https://schema.org/color",
    "https://schema.org/size",
    "https://schema.org/itemCondition"
  ],
  "hasVariant": [
    {
      "@type": "Product",
      "sku": "iphone-15-pro-128gb-azul-a-100",
      "name": "iPhone 15 Pro 128GB Titanio Azul - Grado A - Batería 100%",
      "color": "Titanio azul",
      "size": "128GB",
      "itemCondition": "https://schema.org/RefurbishedCondition",
      "additionalProperty": {
        "@type": "PropertyValue",
        "name": "Salud de Batería",
        "value": "100%"
      },
      "offers": {
        "@type": "Offer",
        "price": "2500.00",
        "priceCurrency": "PEN",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/RefurbishedCondition",
        "url": "https://www.iphoneencuotas.com/iphone-15-pro?variant=var001"
      }
    },
    {
      "@type": "Product",
      "sku": "iphone-15-pro-128gb-azul-b-85",
      "name": "iPhone 15 Pro 128GB Titanio Azul - Grado B - Batería 85%",
      "color": "Titanio azul",
      "size": "128GB",
      "itemCondition": "https://schema.org/RefurbishedCondition",
      "additionalProperty": {
        "@type": "PropertyValue",
        "name": "Salud de Batería",
        "value": "85%"
      },
      "offers": {
        "@type": "Offer",
        "price": "2200.00",
        "priceCurrency": "PEN",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/RefurbishedCondition"
      }
    }
  ]
}
```

### B. Valores Oficiales de `itemCondition`

Según [Schema.org itemCondition](https://www.schema.org/itemCondition):

- `https://schema.org/NewCondition` - Nuevo
- `https://schema.org/RefurbishedCondition` - Reacondicionado
- `https://schema.org/UsedCondition` - Usado
- `https://schema.org/DamagedCondition` - Dañado

**Mapeo para nuestro sistema**:
```typescript
function getItemConditionUrl(condition: ProductCondition, grade: ProductGrade | null): string {
  if (condition === 'new') {
    return 'https://schema.org/NewCondition';
  }
  // Todos los reacondicionados usan RefurbishedCondition
  // El grado (A+, A, B) se especifica en el nombre del producto
  return 'https://schema.org/RefurbishedCondition';
}
```

### C. Batería como PropertyValue

No existe un campo estándar en Schema.org para "salud de batería", pero podemos usar `additionalProperty`:

```json
"additionalProperty": {
  "@type": "PropertyValue",
  "name": "Salud de Batería",
  "value": "100%"
}
```

---

## 🚧 7. REDIRECCIONES 301 (Prevención 404)

### Situación:
Si ya existen URLs como:
- `https://www.iphoneencuotas.com/iphone/iphone-15-pro-128gb-bateria-90`
- `https://www.iphoneencuotas.com/iphone/iphone-15-pro-grado-b`

**Solución**:

```typescript
// middleware.ts o next.config.ts
const VARIANT_REDIRECTS = {
  '/iphone/iphone-15-pro-128gb-bateria-90': '/iphone/iphone-15-pro?variant=var001',
  '/iphone/iphone-15-pro-grado-b': '/iphone/iphone-15-pro?variant=var002',
};

// O en Next.js:
async redirects() {
  return [
    {
      source: '/iphone/:slug(.*-bateria-:battery|.*-grado-:grade)',
      destination: '/iphone/:slug',  // Quitar sufijos
      permanent: true, // 301
    }
  ];
}
```

**Alternativa**: Middleware que detecta patrones y redirecciona.

---

## 📋 8. PLAN DE IMPLEMENTACIÓN POR FASES

### FASE 1: Preparación (Sin cambios visibles) ✅

**Objetivos**:
- Agregar nuevos campos a tipos TypeScript
- Crear funciones auxiliares en `products.ts`
- No romper nada existente

**Archivos a modificar**:
1. `src/types/product.ts` - Agregar campos
2. `src/lib/firebase/products.ts` - Agregar queries para variantes
3. Script de migración (opcional, agregar campos a productos existentes)

**Criterio de aceptación**:
- ✅ El sistema actual sigue funcionando igual
- ✅ No hay errores de TypeScript
- ✅ Build exitoso

---

### FASE 2: Panel de Administración ✅

**Objetivos**:
- Admin puede crear productos maestros
- Admin puede agregar variantes a un maestro

**Archivos a modificar**:
1. `src/components/admin/ProductForm.tsx`
   - Agregar campo "Batería (%)" (select: 100, 95, 90, 85, 80)
   - Agregar checkbox "¿Es variante?"
   - Si es variante, mostrar selector de "Producto Maestro"

2. `src/app/admin/productos/page.tsx`
   - Mostrar badge "Maestro" o "Variante de X"
   - Agrupar variantes bajo su maestro (UI mejorada)

**Criterio de aceptación**:
- ✅ Admin puede crear un producto maestro (isVariant = false)
- ✅ Admin puede crear variantes asociadas al maestro
- ✅ Cada variante tiene su propio stock y precio
- ✅ Productos antiguos siguen editándose sin problemas

---

### FASE 3: Frontend - Página de Producto ✅

**Objetivos**:
- Detectar si producto es maestro con variantes
- Mostrar selectores dinámicos
- Actualizar precio en tiempo real

**Archivos a crear/modificar**:
1. `src/components/product/ProductVariantSelector.tsx` (NUEVO)
2. `src/app/(public)/iphone/[slug]/page.tsx` (modificar)
3. `src/lib/firebase/products.ts` - Agregar `getVariantsByMasterId()`

**Criterio de aceptación**:
- ✅ Productos antiguos (sin variantes) se muestran como siempre
- ✅ Productos maestros muestran selectores de variantes
- ✅ Al cambiar selector, precio/cuota se actualiza sin recargar
- ✅ Stock se refleja correctamente (deshabilitar opciones sin stock)
- ✅ URL sigue siendo limpia (`/iphone/iphone-15-pro`)

---

### FASE 4: Schema y SEO ✅

**Objetivos**:
- Implementar ProductGroup schema para maestros con variantes
- Mantener Product schema para productos tradicionales

**Archivos a modificar**:
1. `src/lib/utils/schema.ts`
   - Agregar `buildProductGroupSchemaWithVariants()`
   - Modificar `buildProductSchema()` para detectar variantes

2. `src/app/(public)/iphone/[slug]/page.tsx`
   - Usar ProductGroup schema si tiene variantes

**Criterio de aceptación**:
- ✅ Rich Results Test pasa sin errores
- ✅ Google detecta variantes en hasVariant
- ✅ Cada variante tiene su itemCondition correcto
- ✅ additionalProperty muestra salud de batería

---

### FASE 5: Redirecciones y Migración ✅

**Objetivos**:
- Redirigir URLs antiguas de variantes
- Migrar productos duplicados existentes

**Archivos a crear**:
1. `scripts/migrate-duplicate-products.ts`
   - Detectar productos duplicados del mismo modelo
   - Convertir uno en maestro
   - Convertir otros en variantes

2. `next.config.ts` - Agregar redirects

**Criterio de aceptación**:
- ✅ URLs antiguas redirigen con 301
- ✅ No hay 404s en Google Search Console
- ✅ Productos duplicados migrados correctamente

---

## ⚠️ 9. REGLAS CRÍTICAS DE DESARROLLO

### PROHIBICIONES:

❌ **NO ASUMIR estructura de BD** - Auditar primero
❌ **NO romper productos existentes** - Mantener retrocompatibilidad
❌ **NO crear URLs con parámetros feos** - Mantener slug limpio
❌ **NO modificar `productGroupId`** - Ya existe y funciona
❌ **NO inventar GTINs** - Solo agregar si tienes el código real

### OBLIGACIONES:

✅ **Verificar cada query a Firestore** - Probar con datos reales
✅ **Implementar redirecciones 301** - Antes de cambiar URLs
✅ **Validar con Rich Results Test** - Cada cambio de schema
✅ **Mantener logs detallados** - Console.log para debugging
✅ **Tests manuales en dev** - Antes de cada commit

---

## 🎯 10. CRITERIOS DE ACEPTACIÓN FINAL

### Backend y Admin:
- [ ] Admin puede crear producto maestro
- [ ] Admin puede agregar múltiples variantes con diferentes:
  - [ ] Capacidad (128GB, 256GB, etc.)
  - [ ] Color
  - [ ] Condición estética (Grado A+, A, B)
  - [ ] Salud de batería (100%, 95%, 90%, 85%, 80%)
- [ ] Cada variante tiene stock y precio independiente
- [ ] Productos antiguos NO se rompieron

### Frontend:
- [ ] URL pública es única y limpia (`/iphone-15-pro`)
- [ ] Selectores dinámicos funcionan
- [ ] Precio y cuota se actualizan en tiempo real
- [ ] Opciones sin stock se deshabilitan
- [ ] Productos sin variantes funcionan como antes

### SEO y Schema:
- [ ] Rich Results Test pasa sin errores
- [ ] ProductGroup schema correcto con hasVariant
- [ ] Cada variante tiene itemCondition apropiado
- [ ] additionalProperty muestra batería correctamente
- [ ] No hay warnings en Search Console

### Migración:
- [ ] URLs antiguas redirigen con 301
- [ ] No hay 404s
- [ ] Historial de pedidos intacto

---

## 📚 11. REFERENCIAS Y DOCUMENTACIÓN

### Schema.org:
- [ProductGroup](https://www.schema.org/ProductGroup)
- [Product Variants](https://developers.google.com/search/docs/appearance/structured-data/product-variants)
- [RefurbishedCondition](https://www.schema.org/RefurbishedCondition)
- [itemCondition](https://www.schema.org/itemCondition)
- [additionalProperty](https://www.schema.org/additionalProperty)

### Google Merchant Center:
- [Product Condition](https://support.google.com/merchants/answer/6324469?hl=en-GB)

### Next.js:
- [Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)
- [Redirects](https://nextjs.org/docs/app/api-reference/next-config-js/redirects)

---

**Próximo paso**: Implementación Fase 1 - Preparación de tipos y funciones auxiliares sin cambios visibles.
