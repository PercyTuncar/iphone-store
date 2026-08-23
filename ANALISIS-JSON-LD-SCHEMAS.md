# 📊 Análisis de Schemas JSON-LD - iPhone en Cuotas

## 🔍 Investigación: Campos Requeridos y Opcionales

### **Según Google Merchant Center y Search Console**

#### **Campos OBLIGATORIOS para Product:**
- ✅ `@type: "Product"`
- ✅ `name` - Título del producto
- ✅ `image` - Array de imágenes (mínimo 1, recomendado 3+)
- ✅ `description` - Descripción del producto
- ✅ `sku` - Código único del producto
- ✅ `brand` - Marca del producto
- ✅ `offers` - Información de precio y disponibilidad
  - ✅ `@type: "Offer"`
  - ✅ `price` - Precio numérico
  - ✅ `priceCurrency` - Moneda (ISO 4217)
  - ✅ `availability` - Estado de stock
  - ✅ `url` - URL de la oferta

#### **Campos RECOMENDADOS para Product:**
- ✅ `url` - URL del producto
- ✅ `itemCondition` - Condición (nuevo/reacondicionado)
- ✅ `color` - Color del producto
- ❌ `model` - Número de modelo
- ❌ `manufacturer` - Fabricante
- ✅ `aggregateRating` - Calificación promedio (si hay reseñas)
- ✅ `review` - Reseñas individuales
- ⚠️ `gtin` - Código de barras global (opcional pero muy recomendado)
- ⚠️ `mpn` - Número de parte del fabricante (opcional pero recomendado)

#### **Campos OPCIONALES pero útiles:**
- ✅ `category` - Categoría del producto
- ❌ `weight` - Peso del producto
- ❌ `width`, `height`, `depth` - Dimensiones físicas
- ❌ `material` - Material del producto
- ❌ `releaseDate` - Fecha de lanzamiento
- ❌ `productionDate` - Fecha de producción
- ❌ `countryOfOrigin` - País de origen
- ❌ `warranty` - Información de garantía

### **Campos específicos para ProductGroup:**
- ✅ `@type: "ProductGroup"`
- ✅ `productGroupID` - ID del grupo
- ✅ `name` - Nombre del grupo (modelo)
- ✅ `url` - URL del producto maestro
- ✅ `variesBy` - Qué varía entre productos (color, size, etc.)
- ✅ `hasVariant` - Array de variantes con sus datos completos

### **Campos para Offer (dentro de Product):**
- ✅ `price` - Precio
- ✅ `priceCurrency` - Moneda
- ✅ `availability` - Disponibilidad
- ✅ `itemCondition` - Condición
- ✅ `seller` - Vendedor
- ✅ `url` - URL de la oferta
- ✅ `hasMerchantReturnPolicy` - Política de devoluciones
- ✅ `shippingDetails` - Detalles de envío
- ❌ `priceValidUntil` - Fecha hasta la que el precio es válido
- ❌ `eligibleQuantity` - Cantidad máxima/mínima
- ❌ `validFrom` - Desde cuándo es válida la oferta

---

## ✅ Estado Actual de Nuestros Schemas

### **buildProductSchema** - ✅ Completo
- ✅ Todos los campos obligatorios presentes
- ✅ Mayoría de campos recomendados presentes
- ⚠️ Faltan campos opcionales útiles

### **buildProductGroupSchema** - ✅ Completo
- ✅ Estructura correcta para variantes
- ✅ Cada variante con datos completos
- ✅ URLs únicas con `?variant=id`

---

## ❌ Campos que FALTAN (Mejoras Recomendadas)

### **1. Campos de Producto faltantes:**

#### **`model`** - Número de modelo del iPhone
```json
{
  "model": "MQ023LL/A"
}
```
**Importancia:** Alta para Google Shopping
**Dónde agregarlo:** En el schema del producto

#### **`manufacturer`** - Fabricante
```json
{
  "manufacturer": {
    "@type": "Organization",
    "name": "Apple Inc."
  }
}
```
**Importancia:** Media
**Dónde agregarlo:** Junto con `brand`

#### **`priceValidUntil`** - Validez del precio
```json
{
  "offers": {
    "priceValidUntil": "2024-12-31"
  }
}
```
**Importancia:** Alta para Google Shopping
**Dónde agregarlo:** Dentro de `offers`

#### **`weight` y dimensiones** - Peso y tamaño físico
```json
{
  "weight": {
    "@type": "QuantitativeValue",
    "value": "206",
    "unitCode": "GRM"
  },
  "width": {
    "@type": "QuantitativeValue",
    "value": "71.6",
    "unitCode": "MMT"
  },
  "height": {
    "@type": "QuantitativeValue",
    "value": "147.6",
    "unitCode": "MMT"
  },
  "depth": {
    "@type": "QuantitativeValue",
    "value": "7.85",
    "unitCode": "MMT"
  }
}
```
**Importancia:** Media para Google Shopping
**Dónde agregarlo:** A nivel de producto

#### **`warranty`** - Información de garantía
```json
{
  "warranty": {
    "@type": "WarrantyPromise",
    "durationOfWarranty": {
      "@type": "QuantitativeValue",
      "value": "12",
      "unitCode": "MON"
    },
    "warrantyScope": "Garantía limitada del fabricante"
  }
}
```
**Importancia:** Media
**Dónde agregarlo:** A nivel de producto

#### **`releaseDate`** - Fecha de lanzamiento
```json
{
  "releaseDate": "2024-09-22"
}
```
**Importancia:** Baja
**Dónde agregarlo:** A nivel de producto maestro

### **2. Campos de Offer faltantes:**

#### **`eligibleQuantity`** - Límites de cantidad
```json
{
  "offers": {
    "eligibleQuantity": {
      "@type": "QuantitativeValue",
      "value": 1,
      "maxValue": 1
    }
  }
}
```
**Importancia:** Media
**Dónde agregarlo:** Dentro de `offers`

#### **`validFrom`** - Desde cuándo es válida
```json
{
  "offers": {
    "validFrom": "2024-01-01T00:00:00Z"
  }
}
```
**Importancia:** Baja
**Dónde agregarlo:** Dentro de `offers`

---

## 🎯 Campos Prioritarios a Implementar

### **PRIORIDAD ALTA:**
1. ✅ `priceValidUntil` - Google Shopping lo requiere
2. ✅ `model` - Importante para SEO y diferenciación
3. ✅ `manufacturer` - Complementa a `brand`

### **PRIORIDAD MEDIA:**
4. ✅ `weight` - Útil para cálculo de envíos
5. ✅ `dimensions` - Útil para packaging
6. ✅ `warranty` - Genera confianza

### **PRIORIDAD BAJA:**
7. `eligibleQuantity` - Solo si hay límites
8. `releaseDate` - Solo para productos nuevos
9. `validFrom` - Solo para ofertas temporales

---

## 🔧 Plan de Implementación

### **Fase 1: Campos Obligatorios (YA IMPLEMENTADOS)**
- ✅ Todos los campos obligatorios están presentes
- ✅ Estructura correcta de ProductGroup
- ✅ URLs únicas por variante

### **Fase 2: Campos Recomendados Faltantes**

#### **Agregar al tipo Product:**
```typescript
interface ProductSchemaExtended extends Product {
  modelNumber?: string; // Ej: "MQ023LL/A"
  weight?: number; // En gramos
  dimensions?: {
    width: number;  // En mm
    height: number; // En mm
    depth: number;  // En mm
  };
  warrantyMonths?: number; // Meses de garantía
  releaseDate?: string; // ISO date
}
```

#### **Actualizar buildProductSchema:**
```typescript
export function buildProductSchema(product: ProductSchemaExtended, ...) {
  const schema = {
    // ... campos existentes
    
    // NUEVO: Número de modelo
    ...(product.modelNumber && { model: product.modelNumber }),
    
    // NUEVO: Fabricante
    manufacturer: {
      '@type': 'Organization',
      name: 'Apple Inc.',
    },
    
    // NUEVO: Dimensiones y peso
    ...(product.weight && {
      weight: {
        '@type': 'QuantitativeValue',
        value: String(product.weight),
        unitCode: 'GRM',
      },
    }),
    
    ...(product.dimensions && {
      width: {
        '@type': 'QuantitativeValue',
        value: String(product.dimensions.width),
        unitCode: 'MMT',
      },
      height: {
        '@type': 'QuantitativeValue',
        value: String(product.dimensions.height),
        unitCode: 'MMT',
      },
      depth: {
        '@type': 'QuantitativeValue',
        value: String(product.dimensions.depth),
        unitCode: 'MMT',
      },
    }),
    
    // NUEVO: Garantía
    ...(product.warrantyMonths && {
      warranty: {
        '@type': 'WarrantyPromise',
        durationOfWarranty: {
          '@type': 'QuantitativeValue',
          value: String(product.warrantyMonths),
          unitCode: 'MON',
        },
        warrantyScope: 'Garantía limitada del fabricante',
      },
    }),
    
    offers: {
      // ... campos existentes de offers
      
      // NUEVO: Validez del precio (6 meses por defecto)
      priceValidUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      
      // NUEVO: Límite de cantidad
      eligibleQuantity: {
        '@type': 'QuantitativeValue',
        value: 1,
        maxValue: 1,
      },
    },
  };
  
  return schema;
}
```

---

## 📝 Recomendaciones Adicionales

### **1. Agregar campos al modelo Product (Firestore):**
```typescript
interface Product {
  // ... campos existentes
  
  // Nuevos campos opcionales
  modelNumber?: string;      // Ej: "MQ023LL/A"
  weight?: number;           // Gramos
  dimensions?: {
    width: number;           // mm
    height: number;          // mm
    depth: number;           // mm
  };
  warrantyMonths?: number;   // Meses de garantía (12 por defecto)
  releaseDate?: string;      // ISO date
}
```

### **2. Actualizar formulario de admin:**
- Agregar campo "Número de modelo" (opcional)
- Agregar campos de dimensiones (opcionales)
- Agregar campo de garantía (default: 12 meses)
- Estos campos se compartirían en el producto maestro

### **3. Validar con herramientas de Google:**
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- Google Merchant Center Feed Diagnostics

---

## ✅ Conclusión

**Estado actual:** Los schemas tienen todos los campos OBLIGATORIOS y la mayoría de RECOMENDADOS.

**Campos críticos faltantes:**
1. `priceValidUntil` - Muy importante para Google Shopping
2. `model` - Importante para SEO
3. `manufacturer` - Complementa información del producto

**Próximos pasos:**
1. Implementar los 3 campos críticos
2. Agregar campos opcionales gradualmente
3. Validar con herramientas de Google
4. Monitorear en Search Console y Merchant Center

