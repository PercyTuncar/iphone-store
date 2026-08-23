# Análisis Completo: Padre vs Variantes - Sistema de Productos

## 🎯 Definición Correcta según E-commerce Estándar

### **PRODUCTO MAESTRO (Padre)**
El maestro es un **contenedor lógico** que agrupa variantes. NO es un producto vendible.

### **VARIANTES (Hijos)**
Las variantes son los **productos reales vendibles** con características específicas.

---

## 📊 Tabla de Campos: Padre vs Variante

| Campo | Maestro | Variante | Notas |
|-------|---------|----------|-------|
| **IDENTIFICACIÓN** ||||
| `id` | ✅ Único | ✅ Único | Ambos tienen ID propio |
| `title` | ✅ Solo modelo | ✅ Completo | Maestro: "iPhone 15 Pro" / Variante: "iPhone 15 Pro 256GB Azul" |
| `slug` | ✅ URL única | ✅ Mismo del maestro | Variantes comparten slug: `/iphone-15-pro?variant=id` |
| `model` | ✅ Nombre modelo | ✅ Heredado | "iPhone 15 Pro" |
| `sku` | ❌ No aplica | ✅ Único | Solo variantes: "IPHONE-15-PRO-256GB-AZUL-NEW" |
| `mpn` | ✅ Compartido | ✅ Heredado | Número de parte del fabricante |
| `gtin` | ❌ No aplica | ✅ Único/Heredado | Código de barras, puede variar |
| **CARACTERÍSTICAS ESPECÍFICAS** ||||
| `storage` | ❌ Placeholder | ✅ Real | Maestro: "256GB" (placeholder) / Variante: valor real |
| `color` | ❌ "Varios" | ✅ Real | Maestro: "Varios" / Variante: "Azul Titanio" |
| `condition` | ❌ "new" | ✅ Real | Maestro: siempre "new" / Variante: real |
| `grade` | ❌ null | ✅ Real | Solo variantes reacondicionadas |
| `batteryHealth` | ❌ null | ✅ Real | Solo variantes reacondicionadas |
| **IMÁGENES** ||||
| `images[]` | ❌ Vacío [] | ✅ Propias | Maestro: sin imágenes / Variantes: sus fotos |
| `thumbnailUrl` | ✅ Primera variante | ✅ Propia | Maestro hereda de primera variante |
| **INVENTARIO** ||||
| `stock` | ✅ Suma total | ✅ Individual | Maestro = suma de variantes |
| **PRECIOS** ||||
| `priceTotal` | ✅ Primera variante | ✅ Individual | Maestro: para mostrar "desde X" |
| `installmentAmount` | ✅ Primera variante | ✅ Individual | Calculado por variante |
| `installments` | ✅ Compartido | ✅ Heredado | Política global del producto |
| `interestRate` | ✅ Compartido | ✅ Heredado | Tasa global |
| `downPayment` | ✅ Compartido | ✅ Heredado | Inicial global |
| **PENALIDADES Y SEGUROS** ||||
| `penaltyTier1Days/Amount` | ✅ Compartido | ✅ Heredado | Política global |
| `penaltyTier2Days/Amount` | ✅ Compartido | ✅ Heredado | Política global |
| `penaltyTier3Days/Amount` | ✅ Compartido | ✅ Heredado | Política global |
| `insurancePlan*` | ✅ Compartido | ✅ Heredado | Planes globales |
| **MÉTODOS DE PAGO** ||||
| `yapeNumber` | ✅ Compartido | ✅ Heredado | Configuración global |
| `transferAccount*` | ✅ Compartido | ✅ Heredado | Datos de transferencia |
| `onlinePaymentLink` | ✅ Compartido | ✅ Heredado | Link de pago |
| `isYapeEnabled` | ✅ Compartido | ✅ Heredado | Flags globales |
| `isOnlinePaymentEnabled` | ✅ Compartido | ✅ Heredado | Flags globales |
| **ESPECIFICACIONES TÉCNICAS** ||||
| `specs.*` | ✅ Compartido | ✅ Heredado | Características del modelo |
| `specDisplay` | ✅ Compartido | ✅ Heredado | Ej: "6.1 pulgadas OLED" |
| `specProcessor` | ✅ Compartido | ✅ Heredado | Ej: "A17 Pro" |
| `specCamera` | ✅ Compartido | ✅ Heredado | Ej: "48MP principal" |
| `specBattery` | ✅ Compartido | ✅ Heredado | Capacidad de batería nueva |
| **CONTENIDO DE PÁGINA** ||||
| `pageContent.*` | ✅ Compartido | ✅ Heredado | Contenido editorial |
| `features[]` | ✅ Compartido | ✅ Heredado | Características destacadas |
| `faq[]` | ✅ Compartido | ✅ Heredado | Preguntas frecuentes |
| **SEO** ||||
| `seo.metaTitle` | ✅ Genérico | ✅ Específico | Variante incluye storage+color |
| `seo.metaDescription` | ✅ Genérico | ✅ Específico | Variante incluye precio real |
| `seo.h1` | ✅ Genérico | ✅ Específico | Título específico |
| `seo.canonicalUrl` | ✅ `/slug` | ✅ `/slug?variant=id` | URLs únicas |
| `seo.ogImage` | ❌ Sin imagen | ✅ Primera imagen | Variante usa su foto |
| **CATEGORIZACIÓN** ||||
| `category` | ✅ Compartido | ✅ Heredado | "Celulares > iPhone" |
| `googleProductCategoryId` | ✅ Compartido | ✅ Heredado | "267" |
| `productGroupId` | ✅ Propio | ✅ Referencia al padre | Agrupa variantes |
| **SISTEMA DE VARIANTES** ||||
| `isVariant` | ❌ false | ✅ true | Identificador clave |
| `masterProductId` | ❌ No aplica | ✅ ID del padre | Relación hijo→padre |
| `masterProductSlug` | ❌ No aplica | ✅ Slug del padre | Para construir URL |
| **REVIEWS Y RATINGS** ||||
| `averageRating` | ✅ Promedio global | ✅ Individual | Se puede agregar por variante |
| `reviewCount` | ✅ Total global | ✅ Individual | Reviews específicas |
| **ESTADO** ||||
| `status` | ✅ "draft" | ✅ Independiente | Maestro siempre draft, variantes pueden ser published |
| `publishedAt` | ❌ null | ✅ Fecha | Solo variantes se publican |
| `createdAt` | ✅ Fecha | ✅ Fecha | Timestamps propios |
| `updatedAt` | ✅ Fecha | ✅ Fecha | Timestamps propios |

---

## 🔍 Estado Actual de la Implementación

### ❌ PROBLEMAS ENCONTRADOS

Voy a revisar el ProductForm para verificar si está correctamente implementado:
