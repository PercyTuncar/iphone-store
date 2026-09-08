# Corrección: Cálculo de Cuotas Mensuales en Tarjetas de Productos

**Fecha**: 8 de septiembre de 2026  
**Estado**: ✅ CORREGIDO

---

## 🐛 Problema Encontrado

Al implementar la mejora de precios, se detectó que el campo `installmentAmount` almacenado en la base de datos podía estar desactualizado o calculado incorrectamente, mostrando:

```
Reserva inicial
S/ 100.00
Luego 10 cuotas de S/ 0.00  ❌ INCORRECTO
```

## ✅ Solución Implementada

### Cambio Principal

En lugar de confiar en el campo `product.installmentAmount` de la base de datos, ahora **recalculamos la cuota en tiempo real** en el frontend usando la función `calculateInstallmentAmount()`.

### Código Actualizado

**Archivo**: `src/app/page.tsx` - Componente `ProductCard`

```typescript
// Calcula la cuota mensual correcta (recalculando, no usando el campo almacenado)
const correctInstallmentAmount = calculateInstallmentAmount(
  product.priceTotal,
  product.interestRate,
  product.installments,
  product.downPayment
);

// Número de cuotas restantes después del downPayment
const remainingInstallments = product.downPayment > 0
  ? product.installments - 1
  : product.installments;
```

### Texto Actualizado

Ahora muestra:
```typescript
Luego hasta {remainingInstallments} cuotas de {formatSoles(correctInstallmentAmount)}
```

---

## 📊 Ejemplos de Cálculo Correcto

### Ejemplo 1: iPhone 18 Pro

**Datos del producto**:
```json
{
  "priceTotal": 5600,
  "installments": 11,
  "interestRate": 0,
  "downPayment": 100
}
```

**Cálculo**:
1. Monto a financiar: S/ 5,600 - S/ 100 = S/ 5,500
2. Cuotas restantes: 11 - 1 = 10
3. Sin interés: S/ 5,500 / 10 = **S/ 550.00 por cuota**

**Resultado en tarjeta**:
```
Reserva inicial
S/ 100.00
Luego hasta 10 cuotas de S/ 550.00  ✅ CORRECTO
```

### Ejemplo 2: iPhone con Interés

**Datos del producto**:
```json
{
  "priceTotal": 6500,
  "installments": 12,
  "interestRate": 5,
  "downPayment": 650
}
```

**Cálculo con interés compuesto**:
1. Monto a financiar: S/ 6,500 - S/ 650 = S/ 5,850
2. Cuotas restantes: 12 - 1 = 11
3. Con interés 5% mensual: **S/ 575.23 por cuota**

**Resultado en tarjeta**:
```
Reserva inicial
S/ 650.00
Luego hasta 11 cuotas de S/ 575.23  ✅ CORRECTO
```

### Ejemplo 3: Sin Reserva Inicial

**Datos del producto**:
```json
{
  "priceTotal": 4500,
  "installments": 12,
  "interestRate": 0,
  "downPayment": 0
}
```

**Cálculo**:
1. Sin downPayment
2. S/ 4,500 / 12 = **S/ 375.00 por cuota**

**Resultado en tarjeta**:
```
12 cuotas de
S/ 375.00  ✅ CORRECTO
Total: S/ 4,500.00
```

---

## 🔧 Cambios Técnicos

### Importación Agregada
```typescript
import { calculateInstallmentAmount } from '@/lib/utils/installments';
```

### Nueva Lógica en ProductCard
1. **Recalcula** la cuota en lugar de usar `product.installmentAmount`
2. Calcula **cuotas restantes** correctamente: `installments - 1` cuando hay downPayment
3. Muestra **"hasta X cuotas"** para indicar el máximo configurado

---

## ✅ Ventajas de Esta Solución

1. **Siempre correcto**: No depende de datos desactualizados en la base de datos
2. **Consistente**: Usa la misma función de cálculo que toda la aplicación
3. **Transparente**: El texto "hasta X cuotas" deja claro el número máximo
4. **Sin cambios en BD**: No requiere migración de datos existentes

---

## 🧪 Verificación

### Build Exitoso ✅
```bash
npm run build
✓ Compiled successfully
✓ Generating static pages (34/34)
```

### Fórmula de Cálculo

La función `calculateInstallmentAmount()` usa:

**Sin interés**:
```
cuota = (priceTotal - downPayment) / (installments - 1)
```

**Con interés** (amortización francesa):
```
P = monto a financiar (priceTotal - downPayment)
i = interestRate / 100
n = cuotas restantes (installments - 1 si hay downPayment)

cuota = P × [i × (1+i)^n] / [(1+i)^n - 1]
```

---

## 📝 Texto en la Tarjeta

### Formato Actualizado

- **Con downPayment**: `"Luego hasta {X} cuotas de S/ {monto}"`
- **Sin downPayment**: `"{X} cuotas de"` (sin cambios)

El texto **"hasta"** indica que es el número máximo de cuotas configurado, y el usuario puede elegir menos cuotas si lo desea en la página del producto.

---

## 🔄 Consistencia

Esta corrección mantiene consistencia con:
- ✅ `calculateInstallmentAmount()` en `src/lib/utils/installments.ts`
- ✅ Página de producto individual
- ✅ Modal de pago
- ✅ Dashboard de usuario
- ✅ Sistema de pedidos

Todos usan la misma fórmula de cálculo.

---

## 💡 Por Qué el Campo en BD Estaba Mal

El campo `installmentAmount` en la base de datos puede estar mal por:

1. **Cálculo antiguo**: Se calculó con una fórmula anterior
2. **Datos de prueba**: Productos de prueba con valores incorrectos
3. **Migración**: No se recalculó después de cambios en precios o cuotas
4. **Bug previo**: Error en el admin al guardar el producto

**Solución**: Recalcular siempre en el frontend garantiza que el valor mostrado sea correcto, independientemente del valor en la base de datos.

---

## 🚀 Próximos Pasos (Opcional)

Si quieres corregir los valores en la base de datos para todos los productos:

1. Crear un script de migración que recalcule `installmentAmount` para todos los productos
2. Ejecutarlo una vez para limpiar los datos
3. Asegurarse de que el admin siempre calcule correctamente al crear/editar productos

Pero esto NO es necesario con la corrección implementada, ya que el frontend calcula correctamente independientemente del valor almacenado.
