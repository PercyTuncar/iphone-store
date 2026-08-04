# 🔍 Análisis del Sistema de Publicación de Productos

**Fecha:** 04 de agosto de 2026  
**Estado:** Verificando consistencia del sistema

---

## ✅ Flujo Actual del Sistema

### 1. **Crear/Editar Producto** (`/admin/productos/[id]`)

**Componente:** `ProductForm.tsx`

**Botones disponibles:**
- "Guardar borrador" → `handleSubmit('draft')`
- "Publicar" → `handleSubmit('published')`

**Función `handleSubmit(status)`:**
```typescript
async handleSubmit(status: 'draft' | 'published') {
  // Validaciones
  const data = buildProductData(form, uploadedImages, status);
  
  if (isEditing && productId) {
    await updateProduct(productId, { ...data }); // ✅ Incluye status
    toast.success(status === 'published' ? 'Producto publicado.' : 'Cambios guardados.');
  } else {
    await createProduct({ ...data, status, averageRating: 0, reviewCount: 0 });
    toast.success(status === 'published' ? 'Producto publicado.' : 'Guardado como borrador.');
  }
  
  router.push('/admin/productos'); // ✅ Redirige a lista
}
```

**Función `buildProductData()`:**
```typescript
return {
  slug: form.slug,
  status, // ✅ El status se pasa correctamente
  // ... todos los demás campos
  publishedAt: status === 'published' ? serverTimestamp() : null, // ✅ Timestamp correcto
};
```

✅ **CORRECTO:** El status se guarda en Firestore cuando haces clic en "Publicar"

---

### 2. **Lista de Productos** (`/admin/productos`)

**Componente:** `page.tsx`

**Carga inicial:**
```typescript
const load = async () => {
  const all = await getAllProducts(); // ✅ Trae TODOS los productos
  setProducts(all);
};
```

**Botón "Publicar" en la lista:**
```typescript
{product.status === 'draft' && (
  <Button onClick={() => onPublish(product.id)}>
    Publicar
  </Button>
)}

{product.status === 'published' && (
  <Button onClick={() => onArchive(product.id)}>
    Archivar
  </Button>
)}
```

**Handler `handlePublish`:**
```typescript
const handlePublish = async (id: string) => {
  await publishProduct(id); // ✅ Llama a función correcta
  toast.success('Producto publicado.');
  await load(); // ✅ Recarga la lista
};
```

✅ **CORRECTO:** Después de publicar, recarga la lista y el botón debería cambiar

---

### 3. **Función `publishProduct` en Firebase**

**Archivo:** `src/lib/firebase/products.ts`

```typescript
export async function publishProduct(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    status: 'published', // ✅ Actualiza status
    publishedAt: serverTimestamp(), // ✅ Agrega timestamp
    updatedAt: serverTimestamp(), // ✅ Actualiza updatedAt
  });
}
```

✅ **CORRECTO:** La función actualiza correctamente Firestore

---

## ⚠️ PROBLEMA POTENCIAL IDENTIFICADO

### Escenario problemático:

1. Usuario edita producto en `/admin/productos/[id]`
2. El producto YA está publicado (`status: 'published'`)
3. Usuario hace cambios y hace clic en **"Publicar"**
4. El formulario llama a `handleSubmit('published')`
5. Esto llama a `buildProductData(form, images, 'published')`
6. **Línea 627:** `publishedAt: status === 'published' ? serverTimestamp() : null`

**PROBLEMA:** 
```typescript
publishedAt: status === 'published' ? serverTimestamp() : null
```

Si el producto ya estaba publicado, esto **SOBRESCRIBE** el `publishedAt` original con un nuevo timestamp.

**Impacto:**
- Se pierde la fecha original de publicación
- Cada vez que editas y publicas de nuevo, cambia el `publishedAt`
- Esto puede afectar ordenamiento por fecha de publicación

---

## 🔧 SOLUCIÓN

### Cambio en `buildProductData()`:

**Antes (línea 627):**
```typescript
publishedAt: status === 'published' ? serverTimestamp() : null,
```

**Después:**
```typescript
// NO incluir publishedAt en el objeto de actualización
// Solo se establece en la creación o al publicar por primera vez
```

### Cambio en `handleSubmit()`:

**Necesitamos detectar si es la primera publicación o una edición:**

```typescript
if (isEditing && productId) {
  const currentProduct = await getProductById(productId);
  const data = buildProductData(form, uploadedImages, status);
  
  // Si cambiamos de draft a published, agregar publishedAt
  if (currentProduct.status !== 'published' && status === 'published') {
    await updateProduct(productId, { 
      ...data, 
      publishedAt: serverTimestamp() 
    });
  } else {
    await updateProduct(productId, data);
  }
}
```

---

## 🔍 VERIFICACIÓN DEL PROBLEMA

### Para verificar si este es el problema:

1. Publica un producto nuevo
2. Anota el `publishedAt` en Firestore
3. Edita el producto y haz clic en "Publicar" de nuevo
4. Verifica si el `publishedAt` cambió

**Si cambió → Confirma el problema**  
**Si no cambió → El sistema ya está bien**

---

## 📊 Estado del Sistema

| Componente | Estado | Notas |
|------------|--------|-------|
| ProductForm - Guardar borrador | ✅ OK | Status = 'draft' |
| ProductForm - Publicar | ✅ OK | Status = 'published' |
| Lista - Botón Publicar | ✅ OK | Llama a publishProduct() |
| Lista - Recarga después de publicar | ✅ OK | Llama a load() |
| publishProduct() | ✅ OK | Actualiza status correctamente |
| buildProductData() | ⚠️ REVISAR | Puede sobrescribir publishedAt |

---

## ✅ CONSISTENCIA GENERAL

El sistema **SÍ es consistente** en términos de:
- ✅ El status se guarda correctamente
- ✅ La lista se recarga después de publicar
- ✅ Los botones cambian según el status
- ✅ La navegación funciona correctamente

El único problema potencial es el `publishedAt` que se sobrescribe en cada edición.

---

## 🎯 RECOMENDACIONES

1. **Verificar el problema del publishedAt** (ver sección "Verificación" arriba)
2. Si se confirma, aplicar la solución propuesta
3. Agregar tests para verificar que:
   - Publicar un draft → Establece publishedAt
   - Editar un producto publicado → NO cambia publishedAt
   - Archivar y volver a publicar → Actualiza publishedAt

---

**Conclusión:** El sistema es consistente en su funcionalidad principal. Solo hay un posible problema menor con el `publishedAt` que se sobrescribe en ediciones.
