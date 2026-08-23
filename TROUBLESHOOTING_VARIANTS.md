# Guía Rápida: Resolver Selector de Variantes No Visible

## Problema
El selector de variantes no aparece en `http://localhost:3000/iphone-18-pro`

## Causa Probable
El selector solo aparece cuando `variantList.length > 1`, es decir, cuando hay **2 o más variantes publicadas**.

## Solución Paso a Paso

### Opción 1: Verificar y Crear Variantes desde el Admin

1. **Inicia el servidor:**
   ```bash
   npm run dev
   ```

2. **Ve al admin de productos:**
   - Abre: `http://localhost:3000/admin/productos`

3. **Edita el producto "iPhone 18 Pro" (o el que corresponda):**
   - Click en "Editar" en el producto maestro
   - Ve a la pestaña **"9: Variantes"**

4. **Crea al menos 2 variantes:**
   - Click en "Agregar Variante"
   - Para cada variante, configura:
     - **Storage:** 128GB, 256GB, 512GB, etc.
     - **Color:** Negro Titanio, Azul Titanio, Blanco Titanio, etc.
     - **Condition:** new o refurbished
     - **Grade:** A+, A, B (si es refurbished)
     - **Battery Health:** 100% (para nuevos)
     - **Price:** Precio específico de esta variante
     - **Stock:** Cantidad disponible
     - **SKU:** Código único
     - **Images:** Fotos específicas del color

5. **Guarda cada variante con Status = "Published"**

6. **Verifica:**
   - Ve a `http://localhost:3000/iphone-18-pro`
   - El selector debe aparecer ahora

### Opción 2: Crear Variantes con Script (Más Rápido)

1. **Asegúrate de tener el archivo `service-account-key.json` en la raíz del proyecto**

2. **Ejecuta el script:**
   ```bash
   npx tsx scripts/create-test-variants.ts iphone-18-pro
   ```

3. **El script creará 6 variantes automáticamente:**
   - 128GB Negro Titanio
   - 256GB Negro Titanio
   - 512GB Negro Titanio
   - 128GB Azul Titanio
   - 256GB Azul Titanio
   - 128GB Blanco Titanio

4. **Verifica:**
   - Refresca `http://localhost:3000/iphone-18-pro`
   - El selector debe aparecer

### Opción 3: Verificar Variantes Existentes

1. **Ejecuta el script de verificación:**
   ```bash
   npx tsx scripts/check-variants.ts iphone-18-pro
   ```

2. **El script mostrará:**
   - Si el producto existe
   - Cuántas variantes tiene
   - Estado de cada variante (publicada o borrador)
   - Detalles: storage, color, precio, stock

3. **Problemas comunes:**
   - ❌ No hay variantes → Créalas (Opción 1 o 2)
   - ❌ Solo hay 1 variante → Crea al menos 1 más
   - ❌ Variantes en estado "draft" → Cámbialas a "published"

## Verificación del Selector

Una vez que hayas creado 2+ variantes publicadas, el selector debería verse así:

```
┌─────────────────────────────────────────┐
│ Configuración                           │
│ Elige tu iPhone 18 Pro                 │
│ Selecciona la capacidad y color...     │
│                                         │
│ Capacidad de almacenamiento            │
│ [128 GB] [256 GB] [512 GB] [1 TB]      │
│                                         │
│ Color                                   │
│ [Negro Titanio] [Azul Titanio]         │
│ [Blanco Titanio] [Natural Titanio]     │
│                                         │
│ ● Disponible • 5 unidades              │
│                          SKU: IPH-15... │
└─────────────────────────────────────────┘
```

## Debug en Consola del Navegador

Abre las DevTools (F12) y busca estos logs:

```javascript
Page.tsx Debug: {
  slug: 'iphone-18-pro',
  productId: 'xxx',
  productIsVariant: false,
  hasVariantChildren: 6  // ← Debe ser 2 o más
}

ProductPageClient Debug: {
  productId: 'xxx',
  variantsReceived: 6,  // ← Debe ser 2 o más
  variantList: 6,       // ← Debe ser 2 o más
}

getAllVariantsByMasterId(xxx): 6 variants found  // ← Debe ser 2 o más
```

Si `hasVariantChildren: 0` o `variantsReceived: 0`, entonces no hay variantes publicadas.

## Checklist Final

- [ ] Producto maestro existe con `isVariant: false`
- [ ] Al menos 2 variantes existen con `isVariant: true`
- [ ] Todas las variantes tienen `masterProductId` correcto
- [ ] Todas las variantes tienen `status: 'published'`
- [ ] El servidor está corriendo (`npm run dev`)
- [ ] Los logs en consola muestran `variantsReceived: 2` o más
- [ ] El selector aparece en la página pública

## Si Aún No Funciona

1. Verifica que `getAllVariantsByMasterId` está filtrando correctamente:
   - Abre: `src/lib/firebase/products.ts:138`
   - Verifica que el query incluya `where('status', '==', 'published')`

2. Verifica la condición de renderizado:
   - Abre: `src/components/product/ProductPageClient.tsx:116`
   - La condición es: `variantList.length > 1`
   - Debe ser `>= 2` para que funcione

3. Revisa el componente ProductHero:
   - Abre: `src/components/product/ProductHero.tsx:103`
   - Verifica que renderiza: `{variantSelector && <div>...</div>}`

## Comando Rápido para Todo

```bash
# 1. Verificar variantes
npx tsx scripts/check-variants.ts iphone-18-pro

# 2. Si no hay suficientes, crear variantes de prueba
npx tsx scripts/create-test-variants.ts iphone-18-pro

# 3. Iniciar servidor
npm run dev

# 4. Abrir en navegador
# http://localhost:3000/iphone-18-pro
```

## Contacto

Si después de seguir estos pasos el selector aún no aparece, proporciona:
- Screenshot de la consola del navegador (F12 → Console)
- Output del script `check-variants.ts`
- Screenshot de la página pública
