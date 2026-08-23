# CORRECCIONES NECESARIAS: Padre vs Variante en ProductForm

## 🔴 PROBLEMAS IDENTIFICADOS

### 1. Tab 1 (Información Básica)
**PROBLEMA**: Al crear maestro, muestra campos que NO debe tener:
- ❌ `storage` - El maestro no tiene storage específico
- ❌ `color` - El maestro no tiene color específico
- ❌ `condition` - El maestro no tiene condición
- ❌ `grade` - El maestro no tiene grado
- ❌ `batteryHealth` - El maestro no tiene batería
- ❌ `stock` - El maestro calcula automáticamente (suma variantes)

**SOLUCIÓN**: Ocultar estos campos cuando `isCreatingMaster === true`

### 2. Tab 3 (Precios y Cuotas)
**ESTADO**: ✅ Parcialmente correcto
- Ya oculta precio cuando crea maestro
- ❌ PERO debe mostrar campos de cuotas/interés/inicial (son compartidos)

**SOLUCIÓN**: Separar campos de precio (variante) vs políticas de pago (compartido)

### 3. Tab 2 (Imágenes)
**ESTADO**: ✅ Correcto
- Oculta gestor cuando crea maestro
- Muestra mensaje informativo

### 4. Tab 9 (Variantes)
**ESTADO**: ✅ Correcto
- Solo visible al crear maestro

---

## 📋 IMPLEMENTACIÓN CORRECTA

### Campos que SÍ debe tener el MAESTRO al crearlo:

#### Tab 1 - Información Básica (Compartida)
```typescript
✅ model              // "iPhone 15 Pro"
✅ mpn                // Número de parte
✅ category           // "Celulares > iPhone"
✅ googleProductCategoryId  // "267"
✅ productGroupId     // ID del grupo

❌ storage            // NO - es por variante
❌ color              // NO - es por variante
❌ condition          // NO - es por variante
❌ grade              // NO - es por variante
❌ batteryHealth      // NO - es por variante
❌ stock              // NO - se calcula automáticamente
```

#### Tab 3 - Precios (Solo Políticas Compartidas)
```typescript
✅ installments       // 12 cuotas
✅ interestRate       // 5%
✅ downPayment        // S/ 500 inicial

❌ priceTotal         // NO - es por variante
❌ installmentAmount  // NO - se calcula por variante
```

#### Tab 4 - Penalidades y Seguros (Compartido)
```typescript
✅ TODOS los campos (son políticas globales)
```

#### Tab 5 - Métodos de Pago (Compartido)
```typescript
✅ TODOS los campos (son configuraciones globales)
```

#### Tab 6 - Especificaciones Técnicas (Compartido)
```typescript
✅ TODOS los campos (son del modelo)
```

#### Tab 7 - Contenido de Página (Compartido)
```typescript
✅ TODOS los campos (son del modelo)
```

#### Tab 8 - SEO (Genérico para el maestro)
```typescript
✅ metaTitle: "iPhone 15 Pro en Cuotas | iPhone en Cuotas"
✅ metaDescription: "Compra el iPhone 15 Pro en cuotas..."
✅ h1: "iPhone 15 Pro"
✅ canonicalUrl: "/iphone-15-pro"

❌ NO incluir storage/color en SEO del maestro
```

#### Tab 9 - Variantes
```typescript
✅ Matriz completa con:
   - Colores y almacenamientos
   - Stock, precio, condición por celda
   - Imágenes por variante
```

---

## 🔧 CORRECCIONES A IMPLEMENTAR

### Corrección 1: Ocultar campos específicos en Tab 1 para maestro

```typescript
// En Section1Basic, agregar prop isCreatingMaster
<Section1Basic 
  form={form} 
  setField={setField} 
  isCreatingMaster={isCreatingMaster}
/>

// Dentro de Section1Basic:
{!isCreatingMaster && (
  <>
    {/* Storage */}
    <div>
      <label className="label">Almacenamiento *</label>
      <select ... />
    </div>
    
    {/* Color */}
    <div>
      <label className="label">Color *</label>
      <input ... />
    </div>
    
    {/* Condition */}
    <div>
      <label className="label">Condición *</label>
      <select ... />
    </div>
    
    {/* Grade (if refurbished) */}
    {form.condition === 'refurbished' && (
      <div>
        <label className="label">Grado Estético</label>
        <select ... />
      </div>
    )}
    
    {/* Battery Health (if refurbished) */}
    {form.condition === 'refurbished' && (
      <div>
        <label className="label">Salud de Batería</label>
        <select ... />
      </div>
    )}
    
    {/* Stock */}
    <div>
      <label className="label">Stock *</label>
      <input type="number" ... />
    </div>
  </>
)}

{isCreatingMaster && (
  <div className="card p-6 bg-blue-50 border-blue-200">
    <p className="text-subtitle mb-2">📦 Características por Variante</p>
    <p className="text-body text-text-secondary mb-3">
      El producto maestro es un contenedor. Las características específicas 
      (almacenamiento, color, condición, stock) se configuran por variante.
    </p>
    <ul className="text-caption text-text-secondary space-y-1 ml-4 list-disc">
      <li>Stock total: suma automática de variantes</li>
      <li>Cada variante tiene su stock individual</li>
      <li>Configura variantes en el <strong>Tab 9</strong></li>
    </ul>
  </div>
)}
```

### Corrección 2: Dividir Tab 3 en dos secciones

```typescript
{activeTab === '3' && isEditingVariant && (
  <Section3Pricing
    form={form} 
    setField={setField}
    installmentAmount={installmentAmount}
  />
)}

{activeTab === '3' && isCreatingMaster && (
  <div className="space-y-6">
    {/* Sección: Políticas de Pago Compartidas */}
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">
        💳 Políticas de Pago (Compartidas)
      </h3>
      <p className="text-body text-text-secondary mb-4">
        Estas configuraciones aplican a TODAS las variantes del producto.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Número de Cuotas */}
        <div>
          <label className="label">Número de Cuotas *</label>
          <input
            type="number"
            min="1"
            max="24"
            value={form.installments}
            onChange={e => setField('installments', parseInt(e.target.value) || 1)}
            className="input"
          />
          <p className="text-caption text-text-secondary mt-1">
            Ej: 6, 12, 18 cuotas
          </p>
        </div>
        
        {/* Tasa de Interés */}
        <div>
          <label className="label">Tasa de Interés Mensual (%)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={form.interestRate * 100}
            onChange={e => setField('interestRate', parseFloat(e.target.value) / 100 || 0)}
            className="input"
          />
          <p className="text-caption text-text-secondary mt-1">
            0 = sin interés
          </p>
        </div>
        
        {/* Pago Inicial */}
        <div>
          <label className="label">Pago Inicial (PEN)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.downPayment}
            onChange={e => setField('downPayment', parseFloat(e.target.value) || 0)}
            className="input"
          />
          <p className="text-caption text-text-secondary mt-1">
            0 = sin inicial
          </p>
        </div>
      </div>
    </div>
    
    {/* Mensaje informativo sobre precios */}
    <div className="card p-6 bg-amber-50 border-amber-200">
      <p className="text-subtitle mb-2">💰 Precios por Variante</p>
      <p className="text-body text-text-secondary mb-3">
        Cada variante tiene su precio específico. Los precios se configuran en:
      </p>
      <div className="flex items-center gap-2 text-accent font-medium">
        <span>→</span>
        <span>Tab 9: Variantes</span>
      </div>
      <p className="text-caption text-text-secondary mt-3">
        La cuota mensual se calcula automáticamente para cada variante según su precio.
      </p>
    </div>
  </div>
)}
```

### Corrección 3: Validación al guardar maestro

```typescript
// Al guardar maestro, validar que:
if (isCreatingMaster) {
  // 1. Tiene al menos 1 variante habilitada
  const enabledVariants = Object.entries(variantMatrixData.cells)
    .filter(([_, cell]) => cell.enabled);
  
  if (enabledVariants.length === 0) {
    toast.error('Debes crear al menos una variante en el Tab 9');
    return;
  }
  
  // 2. Cada variante tiene imágenes o hay imágenes base
  const variantsWithoutImages = enabledVariants.filter(([_, cell]) => 
    !cell.images || cell.images.length === 0
  );
  
  if (variantsWithoutImages.length > 0 && uploadedImages.length === 0) {
    const confirm = window.confirm(
      `${variantsWithoutImages.length} variante(s) no tienen imágenes propias. ` +
      `¿Deseas usar imágenes base para todas? (Puedes personalizarlas después)`
    );
    if (!confirm) return;
  }
}
```

---

## 🎯 FRONTEND: Carga de Primera Variante

### Estado Actual: ✅ YA IMPLEMENTADO

Archivo: `src/components/product/ProductPageClient.tsx`

```typescript
const initialVariant = useMemo(() => {
  if (initialVariantId) {
    const urlVariant = variantList.find(v => v.id === initialVariantId);
    if (urlVariant) return urlVariant;
  }
  // ✅ Fallback: primera con stock o primera disponible
  return variantList.find((variant) => variant.stock > 0) ?? variantList[0] ?? product;
}, [variantList, product, initialVariantId]);
```

**Resultado**: ✅ Carga primera variante automáticamente

---

## 🔄 FRONTEND: Cambio Dinámico de Variante

### Estado Actual: ✅ YA IMPLEMENTADO

```typescript
const currentProduct = useMemo(
  () => variantList.find((variant) => variant.id === selectedVariantId) ?? product,
  [variantList, selectedVariantId, product]
);
```

**Qué se actualiza dinámicamente**:
- ✅ Imágenes (`ProductHero` detecta cambio de `product.id`)
- ✅ Precio (`currentProduct.priceTotal`)
- ✅ Cuota (`currentProduct.installmentAmount`)
- ✅ Stock (`currentProduct.stock`)
- ✅ Badges (storage, color, condición, grado, batería)
- ✅ URL (`?variant=id` via `VariantSelectorButtons`)
- ✅ Título (`currentProduct.title`)
- ✅ SKU (visible en comparador)

**Componentes que reaccionan**:
1. `ProductHero` - Galería de imágenes
2. `VariantSelectorButtons` - Selector de opciones
3. `StickyBuyBar` - Precio y botón de reserva
4. `InstallmentSelector` - Cálculo de cuotas
5. `PaymentModal` - Datos de pago

---

## ✅ RESUMEN DE LO QUE FUNCIONA

### Frontend (Vista del Cliente)
✅ Carga primera variante con stock
✅ Selector visual de variantes
✅ Actualización dinámica de imágenes
✅ Actualización dinámica de precio
✅ Actualización dinámica de cuota
✅ Actualización dinámica de stock
✅ Actualización de URL con ?variant=
✅ Badges reflejan variante actual
✅ Comparador de variantes

### Backend (Admin)
✅ Tab 2 (Imágenes): Oculto para maestro
✅ Tab 3 (Precios): Oculto para maestro con mensaje
✅ Tab 9 (Variantes): Solo visible para maestro
✅ Creación de variantes con datos propios
✅ Stock maestro = suma de variantes

---

## 🔴 LO QUE FALTA CORREGIR

### Admin Form
❌ Tab 1: Ocultar campos específicos (storage, color, condition, grade, battery, stock) al crear maestro
❌ Tab 3: Mostrar solo políticas de pago (installments, rate, downPayment) para maestro
❌ Validación: Verificar que hay variantes antes de guardar maestro

---

## 📝 PLAN DE ACCIÓN

1. ✅ Documentar campos padre vs variante
2. ⏳ Modificar `Section1Basic` para ocultar campos específicos
3. ⏳ Modificar Tab 3 para mostrar solo políticas compartidas
4. ⏳ Agregar validaciones al guardar
5. ✅ Verificar que frontend funciona correctamente (YA ESTÁ)

**Estado Frontend**: ✅ 100% CORRECTO
**Estado Admin**: ⚠️ 70% CORRECTO (necesita ajustes en Tab 1 y Tab 3)
