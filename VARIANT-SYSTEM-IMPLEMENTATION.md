# Sistema de Variantes de Productos - Documentación Completa

## 📋 Resumen

Sistema completo de gestión de variantes de productos siguiendo mejores prácticas de e-commerce (estilo Apple, Amazon, Samsung). Cada producto maestro tiene múltiples variantes con sus propias imágenes, precios y stock.

## 🏗️ Arquitectura

### Productos Maestros vs Variantes

#### Producto Maestro
- **Propósito**: Contenedor lógico y página única del producto
- **URL**: Una sola URL (`/iphone-15-pro`)
- **Características**:
  - NO tiene imágenes propias (heredadas de variantes)
  - NO tiene precio específico (muestra precio de primera variante)
  - Stock total = suma de stocks de todas las variantes
  - Título simple: solo nombre del modelo ("iPhone 15 Pro")
  - Campo `isVariant: false`
  - Visible en navbar y listados públicos

#### Variantes
- **Propósito**: Productos concretos vendibles
- **URL**: Comparten URL del maestro + parámetro (`/iphone-15-pro?variant=abc123`)
- **Características**:
  - Imágenes propias específicas de la variante
  - Precio específico por variante
  - Stock individual
  - Título completo: "iPhone 15 Pro 256GB Titanio Natural"
  - Campo `isVariant: true` y `masterProductId`
  - NO aparecen individualmente en listados públicos

## 🎨 Componentes Principales

### 1. VariantMatrix (`src/components/admin/VariantMatrix.tsx`)

**Propósito**: Gestión visual de variantes en matriz (colores × almacenamientos)

**Características**:
- Tabla matricial interactiva
- Gestión de imágenes por variante (modal completo)
- Campos por celda: stock, precio, condición, grado, batería
- Previsualización de imágenes (hasta 3 thumbnails)
- Subida a Firebase Storage con estructura organizada
- Acciones bulk: aplicar stock/precio a todas

**Estructura de datos**:
```typescript
interface VariantCell {
  enabled: boolean;
  stock: number;
  priceTotal: number;
  condition: ProductCondition;
  grade: ProductGrade | '';
  batteryHealth: BatteryHealth | null;
  sku?: string;
  images?: string[]; // URLs de Firebase Storage
}
```

**Rutas de almacenamiento**:
```
products/variants/{color}|{storage}/{timestamp}_{filename}
```

### 2. VariantSelectorButtons (`src/components/product/VariantSelectorButtons.tsx`)

**Propósito**: Selector visual de variantes en el frontend (página del producto)

**Características**:
- Diseño moderno con botones (estilo Apple)
- Indicadores visuales de disponibilidad
- Deshabilita opciones sin stock
- Actualiza URL automáticamente con `?variant=id`
- Estados: seleccionado, disponible, sin stock
- Responsive: 2-3-5 columnas según pantalla

**Flujo de selección**:
1. Usuario selecciona almacenamiento
2. Usuario selecciona color
3. Sistema encuentra variante coincidente
4. Actualiza precio, imágenes y URL
5. Mantiene sincronización con ProductHero

### 3. ProductForm (`src/components/admin/ProductForm.tsx`)

**Propósito**: Formulario unificado para crear/editar maestros y variantes

**Lógica de tabs**:
- **Tab 1 (Información)**: Siempre visible
- **Tab 2 (Imágenes)**: 
  - Maestro: mensaje informativo (imágenes por variante)
  - Variante: gestor completo de imágenes
- **Tab 3 (Variantes)**: Solo visible al crear maestro nuevo

**Creación de maestro + variantes**:
```typescript
// 1. Crear maestro
const masterData = {
  title: form.model, // Solo modelo
  stock: totalStockFromVariants,
  priceTotal: firstVariantPrice,
  images: [], // Vacío
  status: 'draft'
};

// 2. Crear cada variante
for (const variant of enabledVariants) {
  const variantData = {
    ...masterData,
    title: `${model} ${storage} ${color}`,
    images: variant.images || masterImages,
    stock: variant.stock,
    priceTotal: variant.priceTotal,
    isVariant: true,
    masterProductId: masterId
  };
  await createProduct(variantData);
}
```

### 4. AdminVariantManager (`src/components/admin/AdminVariantManager.tsx`)

**Propósito**: Gestión de variantes después de crear el producto maestro

**Características**:
- Lista de variantes existentes
- Edición individual de variantes
- Creación de nuevas variantes
- Eliminación de variantes
- Soporte para imágenes específicas por variante

## 🔄 Flujos Completos

### Flujo de Creación

```
1. Admin abre formulario "Crear Producto"
   ↓
2. Completa Tab 1 (modelo, precio base, cuotas, etc.)
   ↓
3. En Tab 3 (Variantes):
   - Agrega colores
   - Selecciona almacenamientos
   - Configura stock, precios por celda
   - Sube imágenes específicas por variante
   ↓
4. Click "Guardar"
   ↓
5. Sistema crea:
   - 1 producto maestro (draft, sin imágenes)
   - N variantes (con imágenes, precios, stock)
   ↓
6. Resultado: Producto maestro con variantes listas
```

### Flujo de Usuario Final

```
1. Usuario visita /iphone-15-pro
   ↓
2. Ve selector de variantes (botones)
   ↓
3. Selecciona: 256GB + Titanio Natural
   ↓
4. Sistema:
   - Encuentra variante correspondiente
   - Actualiza URL: /iphone-15-pro?variant=abc123
   - Carga imágenes de esa variante
   - Muestra precio de esa variante
   - Actualiza stock disponible
   ↓
5. Usuario ve producto específico y puede reservar
```

### Flujo de Edición

```
1. Admin edita producto maestro
   - Tab 2 muestra mensaje: "Imágenes por variante"
   - Tab 3 oculto (usa AdminVariantManager)
   ↓
2. Para editar variante:
   - Click en "Editar" en listado de variantes
   - Se abre formulario con datos de variante
   - Tab 2 muestra gestor de imágenes
   - Puede modificar precio, stock, imágenes
```

## 📊 Base de Datos (Firestore)

### Colección: `products`

**Documento Maestro**:
```json
{
  "id": "master_123",
  "title": "iPhone 15 Pro",
  "slug": "iphone-15-pro",
  "model": "iPhone 15 Pro",
  "isVariant": false,
  "images": [],
  "thumbnailUrl": "",
  "stock": 45, // Suma de variantes
  "priceTotal": 4999, // Primera variante
  "status": "draft",
  "productGroupId": "iphone-15-pro-group"
}
```

**Documento Variante**:
```json
{
  "id": "variant_456",
  "title": "iPhone 15 Pro 256GB Titanio Natural",
  "slug": "iphone-15-pro",
  "model": "iPhone 15 Pro",
  "storage": "256GB",
  "color": "Titanio Natural",
  "isVariant": true,
  "masterProductId": "master_123",
  "masterProductSlug": "iphone-15-pro",
  "images": [
    "https://firebasestorage.../variant1_img1.jpg",
    "https://firebasestorage.../variant1_img2.jpg"
  ],
  "thumbnailUrl": "https://firebasestorage.../variant1_img1.jpg",
  "stock": 15,
  "priceTotal": 4999,
  "sku": "IPHONE-15-PRO-256GB-TITANIO-NATURAL-NEW",
  "status": "published",
  "productGroupId": "iphone-15-pro-group"
}
```

### Índices Requeridos

```
products:
  - status (ASC), isVariant (ASC), publishedAt (DESC)
  - masterProductId (ASC), status (ASC)
  - slug (ASC)
```

## 🔍 SEO y Google Merchant Center

### URLs y Metadatos

**Página Maestra**:
- URL: `/iphone-15-pro`
- Meta tags: Del producto maestro

**Página con Variante**:
- URL: `/iphone-15-pro?variant=abc123`
- Meta tags: De la variante específica
- Canonical: Incluye parámetro variant

### Feed de Google Merchant

**Estructura**:
```xml
<!-- Solo se envían VARIANTES, no el maestro -->
<item>
  <g:id>IPHONE-15-PRO-256GB-TITANIO-NATURAL-NEW</g:id>
  <g:title>iPhone 15 Pro 256GB Titanio Natural Nuevo</g:title>
  <g:link>https://site.com/iphone-15-pro?variant=abc123</g:link>
  <g:item_group_id>iphone-15-pro-group</g:item_group_id>
  <g:color>Titanio Natural</g:color>
  <g:size>256GB</g:size>
  <g:image_link>https://firebasestorage.../img1.jpg</g:image_link>
  <g:additional_image_link>...</g:additional_image_link>
  <!-- ... más campos -->
</item>
```

**item_group_id**: Agrupa todas las variantes del mismo producto para que Google las muestre juntas.

### JSON-LD Schema

**ProductGroup** (Maestro):
```json
{
  "@type": "ProductGroup",
  "name": "iPhone 15 Pro",
  "hasVariant": [
    { "@type": "Product", "sku": "...", "url": "...?variant=abc" },
    { "@type": "Product", "sku": "...", "url": "...?variant=def" }
  ]
}
```

**Product** (Variante individual):
```json
{
  "@type": "Product",
  "name": "iPhone 15 Pro 256GB Titanio Natural",
  "sku": "IPHONE-15-PRO-256GB-TITANIO-NATURAL-NEW",
  "image": ["url1", "url2"],
  "offers": {
    "@type": "Offer",
    "price": "4999.00",
    "availability": "InStock"
  }
}
```

## 🎯 Mejores Prácticas Implementadas

### ✅ Separación de Responsabilidades
- Maestro: Contenedor lógico y SEO
- Variantes: Productos concretos vendibles

### ✅ URLs Únicas por Variante
- Permite indexación individual en Google
- Cada variante tiene URL directa compartible
- Parámetro `?variant=` mantiene contexto

### ✅ Imágenes Específicas
- Cada variante tiene sus propias imágenes
- Usuario ve exactamente el producto que seleccionó
- Imágenes organizadas en Firebase Storage

### ✅ Stock y Precio Independientes
- Cada variante controla su stock
- Precios pueden variar por almacenamiento/color
- Stock maestro = suma automática

### ✅ Experiencia de Usuario
- Selector visual intuitivo
- Estados claros (disponible/sin stock)
- Actualización automática de precio/imágenes
- URL actualizada para compartir

### ✅ SEO Optimizado
- Meta tags específicos por variante
- Feed completo para Google Shopping
- Schema markup correcto (ProductGroup + Product)
- Canonical URLs con parámetros

## 🛠️ Tareas de Mantenimiento

### Agregar Nuevo Campo a Variantes

1. Actualizar interfaz en `src/types/product.ts`
2. Agregar campo en `VariantCell` (VariantMatrix.tsx)
3. Agregar input en la tabla de variantes
4. Incluir en `createVariantPayload` (ProductForm.tsx)
5. Mostrar en selector frontend si es relevante

### Cambiar Estructura de Imágenes

1. Modificar ruta en `handleFileUpload` (VariantMatrix.tsx)
2. Actualizar filtros de validación en feed
3. Verificar permisos de Firebase Storage

### Agregar Nuevo Tipo de Variante

Ejemplo: Agregar "Memoria RAM" como dimensión:

1. Actualizar `SelectionState` en VariantSelectorButtons
2. Agregar columna en VariantMatrix
3. Incluir en lógica de matching
4. Agregar selector en frontend

## 📝 Notas Técnicas

### Performance
- Queries filtran por `isVariant: false` para listados públicos
- Solo maestros en navbar (reduce carga)
- Variantes se cargan bajo demanda por `masterProductId`

### Seguridad
- Validación de URLs de imágenes (solo Firebase Storage)
- Escape XML en feed de Merchant Center
- Validación de permisos en subida de archivos

### Compatibilidad
- Next.js 15 App Router
- React Server Components + Client Components
- Firebase v10 modular
- TypeScript strict mode

## 🐛 Problemas Conocidos y Soluciones

### Problema: Blob URLs en OG Image
**Solución**: Filtrar imágenes para usar solo Firebase Storage URLs

### Problema: Master con datos de variante
**Solución**: Lógica `isCreatingMaster` para ocultar campos no aplicables

### Problema: URLs sin variante
**Solución**: Sistema carga primera variante disponible por defecto

## 📚 Referencias

- [Google Merchant Center Feed Specification](https://support.google.com/merchants/answer/7052112)
- [Schema.org Product](https://schema.org/Product)
- [Schema.org ProductGroup](https://schema.org/ProductGroup)
- Firebase Storage Rules
- Next.js Dynamic Routes

---

**Última actualización**: 2026-08-22  
**Versión del sistema**: 2.0  
**Autor**: iPhone en Cuotas - Development Team
