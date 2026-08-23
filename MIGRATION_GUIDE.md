# MIGRACIÓN A VARIANTES EMBEBIDAS - GUÍA COMPLETA

## 🎯 Objetivo

Cambiar de la estructura actual (3 documentos separados en Firestore) a una estructura más limpia (1 documento con array de variantes).

## 📊 Comparación de Estructuras

### ❌ ANTES (Estructura Antigua - Problemática)

**Collection: products**
```
- 9alYt7c7jXxWRqKBf893 (Maestro)
  - isVariant: false
  - model: "iPhone 15 Pro"
  - slug: "iphone-15-pro"
  - storage: "128GB"
  - color: "Negro"
  - ...

- CfqbEcHktAwYAd6bCGAy (Variante 1)
  - isVariant: true
  - masterProductId: "9alYt7c7jXxWRqKBf893"
  - storage: "256GB"
  - color: "Azul"
  - ...

- P98ritvQxAjmcAL7dBpM (Variante 2)
  - isVariant: true
  - masterProductId: "9alYt7c7jXxWRqKBf893"
  - storage: "512GB"
  - color: "Blanco"
  - ...
```

**Problemas:**
- 3 documentos para 1 producto
- Queries adicionales para obtener variantes
- Datos duplicados en cada documento
- Difícil de mantener consistencia

### ✅ DESPUÉS (Estructura Nueva - Limpia)

**Collection: products**
```
- 9alYt7c7jXxWRqKBf893 (Producto Maestro)
  - model: "iPhone 15 Pro"
  - slug: "iphone-15-pro"
  - variants: [
      {
        id: "CfqbEcHktAwYAd6bCGAy",
        storage: "256GB",
        color: "Azul",
        priceTotal: 4299,
        stock: 3,
        sku: "...",
        images: [...],
        status: "published"
      },
      {
        id: "P98ritvQxAjmcAL7dBpM",
        storage: "512GB",
        color: "Blanco",
        priceTotal: 4799,
        stock: 2,
        sku: "...",
        images: [...],
        status: "published"
      }
    ]
  - ...datos compartidos...
```

**Ventajas:**
- ✅ 1 solo documento
- ✅ Sin queries adicionales
- ✅ Datos compartidos en un solo lugar
- ✅ Fácil de mantener
- ✅ Más eficiente

## 🚀 PASOS DE MIGRACIÓN

### Paso 1: Backup de Seguridad

Antes de hacer cualquier cambio, exporta tu base de datos:

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Firestore Database → Importar/Exportar
3. Exporta la colección `products`

### Paso 2: Ejecutar Script de Migración

```bash
npx tsx scripts/migrate-to-embedded-variants.ts
```

**Qué hace el script:**
1. Encuentra todos los productos maestros (isVariant: false)
2. Para cada maestro, busca sus variantes (isVariant: true)
3. Construye un array `variants[]` con los datos de cada variante
4. Actualiza el producto maestro agregando el campo `variants[]`
5. Elimina los documentos de variantes separados

**Output esperado:**
```
🚀 Iniciando migración a variantes embebidas...

📦 Encontrados 1 productos maestros

======================================================================
📱 Procesando: iPhone 15 Pro (9alYt7c7jXxWRqKBf893)
======================================================================
   Variantes encontradas: 2

   📦 Variante: 256GB Azul
      ID original: CfqbEcHktAwYAd6bCGAy
      Stock: 3
      Precio: S/ 4299

   📦 Variante: 512GB Blanco
      ID original: P98ritvQxAjmcAL7dBpM
      Stock: 2
      Precio: S/ 4799

   💾 Actualizando producto maestro con 2 variantes...
   ✅ Producto maestro actualizado

   🗑️  Eliminando documentos de variantes antiguas...
      ✅ Eliminado: CfqbEcHktAwYAd6bCGAy
      ✅ Eliminado: P98ritvQxAjmcAL7dBpM

   ✨ Migración completada para iPhone 15 Pro

======================================================================
📊 RESUMEN DE MIGRACIÓN
======================================================================
✅ Productos migrados: 1
❌ Errores: 0
======================================================================

🎉 Migración completada exitosamente!
```

### Paso 3: Verificar en Firestore Console

1. Abre [Firebase Console](https://console.firebase.google.com)
2. Ve a Firestore Database
3. Abre la colección `products`
4. Busca tu producto (ej: `9alYt7c7jXxWRqKBf893`)
5. Verifica que tenga el campo `variants` como array
6. Verifica que los documentos `CfqbEcHktAwYAd6bCGAy` y `P98ritvQxAjmcAL7dBpM` YA NO EXISTAN

### Paso 4: Probar en la Página Pública

```bash
npm run dev
```

Abre: `http://localhost:3000/iphone-15-pro` (o el slug de tu producto)

**Debes ver:**
1. ✅ Un panel amarillo de DEBUG con:
   - `Total variantes recibidas: 2`
   - `variantList.length: 2`
   - `Mostrar selector: SÍ`

2. ✅ El selector de variantes con:
   - Botones de capacidad (256GB, 512GB)
   - Botones de color (Azul, Blanco)
   - Indicador de disponibilidad y stock

3. ✅ Al seleccionar una variante:
   - Las imágenes cambian
   - El precio se actualiza
   - El stock se actualiza
   - La URL cambia a `?variant=ID`

## 🧪 Pruebas de Verificación

### Test 1: Selector Visible
- [ ] El selector aparece en la página
- [ ] Se muestran todos los almacenamientos
- [ ] Se muestran todos los colores
- [ ] Las opciones sin stock están deshabilitadas

### Test 2: Cambio de Variante
- [ ] Al seleccionar almacenamiento, se actualiza todo
- [ ] Al seleccionar color, se actualiza todo
- [ ] Las imágenes cambian correctamente
- [ ] El precio cambia correctamente
- [ ] El SKU se actualiza

### Test 3: URL State
- [ ] La URL se actualiza con `?variant=ID`
- [ ] Al recargar con `?variant=ID`, esa variante está seleccionada
- [ ] Sin parámetro, se selecciona la primera con stock

### Test 4: Comparador
- [ ] El botón "Comparar variantes lado a lado" aparece
- [ ] Abre el modal de comparación
- [ ] Muestra las variantes correctamente

## 🐛 Troubleshooting

### Problema: "Total variantes recibidas: 0"

**Causa:** El producto aún no se ha migrado o no tiene variantes embebidas.

**Solución:**
```bash
# Verificar estructura actual
npx tsx scripts/check-variants.ts iphone-15-pro

# Ejecutar migración
npx tsx scripts/migrate-to-embedded-variants.ts
```

### Problema: "El selector no aparece"

**Causa 1:** Solo hay 1 variante (se necesitan al menos 2)

**Solución:** Crea más variantes desde el admin o ejecuta:
```bash
npx tsx scripts/create-test-variants.ts iphone-15-pro
```

**Causa 2:** Las variantes están en estado "draft"

**Solución:** Cambia el status a "published" en cada variante del array

### Problema: "Error: Cannot read property 'variants' of undefined"

**Causa:** El campo `variants` no existe en el producto

**Solución:**
1. Verifica que ejecutaste la migración
2. Verifica en Firestore Console que el campo existe
3. Si no existe, inicializa manualmente:
```javascript
await db.collection('products').doc('ID').update({
  variants: []
});
```

## 📝 Cambios en el Código

### Archivos Modificados

1. **src/types/product.ts**
   - ✅ Agregado interface `ProductVariant`
   - ✅ Agregado campo `variants: ProductVariant[]` al Product
   - ✅ Marcados campos antiguos como DEPRECATED

2. **src/app/(public)/[slug]/page.tsx**
   - ✅ Eliminado query `getAllVariantsByMasterId()`
   - ✅ Usa directamente `product.variants`
   - ✅ Filtra solo variantes publicadas
   - ✅ Construye objetos de cliente con herencia del maestro

3. **src/components/product/ProductPageClient.tsx**
   - ✅ Agregado panel de DEBUG
   - ✅ Cambiada condición de `> 1` a `> 0`
   - ✅ Agregados logs de consola

4. **src/components/product/ProductHero.tsx**
   - ✅ Agregada prop `variantSelector?: React.ReactNode`
   - ✅ Renderiza el selector integrado en el hero

### Archivos Creados

1. **scripts/migrate-to-embedded-variants.ts** - Script de migración
2. **scripts/create-test-variants.ts** - Crear variantes de prueba
3. **scripts/check-variants.ts** - Verificar estructura actual
4. **VARIANT_IMPLEMENTATION_SUMMARY.md** - Documentación técnica
5. **TROUBLESHOOTING_VARIANTS.md** - Guía de problemas comunes

## 🎯 Próximos Pasos

Una vez verificado que todo funciona:

1. **Actualizar el Admin**
   - Modificar el formulario de productos para editar `variants[]`
   - Agregar UI para agregar/editar/eliminar variantes del array
   - Eliminar la lógica de `isVariant`, `masterProductId`, etc.

2. **Eliminar Código Legacy**
   - Quitar `getAllVariantsByMasterId()` de `src/lib/firebase/products.ts`
   - Quitar campos DEPRECATED de `src/types/product.ts`
   - Limpiar componentes que usen la estructura antigua

3. **Actualizar Otros Componentes**
   - Merchant Feed
   - Sitemap
   - Admin Dashboard
   - Product Cards

## ✅ Checklist Final

- [ ] Backup de Firestore exportado
- [ ] Script de migración ejecutado sin errores
- [ ] Verificado en Firestore Console que la estructura es correcta
- [ ] Selector aparece en la página pública
- [ ] Cambio de variantes funciona correctamente
- [ ] URL state funciona (?variant=ID)
- [ ] Comparador funciona
- [ ] Sin errores en consola del navegador
- [ ] Sin errores en logs del servidor

## 📞 Soporte

Si encuentras algún problema durante la migración, proporciona:
- Screenshot del output del script de migración
- Screenshot de Firestore Console mostrando la estructura
- Screenshot del panel DEBUG en la página pública
- Logs de la consola del navegador (F12 → Console)
