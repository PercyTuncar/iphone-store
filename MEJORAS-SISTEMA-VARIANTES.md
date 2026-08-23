# 🚀 Mejoras al Sistema de Variantes - iPhone en Cuotas

## ✅ Cambios Implementados

### 1. **Arquitectura de URLs y SEO**
- ✅ Una sola URL por producto maestro: `/iphone-18-pro` (no `/iphone-18-pro-256gb-negro`)
- ✅ Variantes se seleccionan en la misma página con `?variant=id`
- ✅ `getAllPublishedProducts()` solo devuelve maestros (`isVariant: false`)
- ✅ Navbar muestra solo productos maestros (no se llena con variantes)
- ✅ `generateStaticParams` solo genera páginas para maestros

### 2. **Datos del Producto Maestro**
- ✅ Título: Solo el modelo (ej: "iPhone 18 Pro")
- ✅ Stock: Suma automática del stock de todas las variantes
- ✅ Precio: Precio de la primera variante (para mostrar en listados)
- ✅ Thumbnail: Imagen de la primera variante
- ✅ Imágenes: Array vacío (el maestro no tiene imágenes propias)
- ✅ Slug: URL base compartida por todas las variantes
- ✅ Especificaciones técnicas compartidas
- ✅ Contenido de página compartido
- ✅ Métodos de pago, penalidades, seguros compartidos

### 3. **Datos de Cada Variante**
- ✅ Storage, Color, Condición, Grado, Batería Health
- ✅ Precio específico
- ✅ Stock específico
- ✅ SKU único
- ✅ Imágenes propias (cada variante puede tener sus fotos)
- ✅ SEO generado automáticamente por variante
- ✅ Mismo slug que el maestro (no páginas separadas)

### 4. **Sistema de Gestión en Admin**
- ✅ Listado agrupado: Maestro + Variantes expandibles
- ✅ Badge "📦 Maestro" para identificar productos principales
- ✅ Botón "Ver/Ocultar variantes" para expandir
- ✅ Variantes indentadas con borde visual
- ✅ Actualización automática de stock del maestro

### 5. **SEO Dinámico**
- ✅ Generación automática de metadatos basados en modelo, storage, color, precio
- ✅ Sistema de tracking de campos editados manualmente
- ✅ Campos no editados se actualizan automáticamente al cambiar datos
- ✅ Previsualizaciones de Google y Open Graph en tiempo real
- ✅ Cada variante tiene SEO optimizado automáticamente

### 6. **Validaciones y UX**
- ✅ Permite subir imágenes antes de guardar (sin bloqueos)
- ✅ Auto-completa ogImage con primera imagen de Firebase
- ✅ Valida mínimo 3 imágenes antes de publicar
- ✅ Toast con íconos React (no strings SVG)
- ✅ Mensajes claros y contextuales

## 🔧 Pendientes de Implementación

### 1. **Gestión de Imágenes por Variante**
**Prioridad: ALTA**

Cada variante debe poder subir sus propias imágenes (ej: iPhone Negro tiene fotos negras, iPhone Blanco tiene fotos blancas).

**Tareas:**
- [ ] Actualizar `VariantMatrix` para incluir gestor de imágenes por celda
- [ ] Agregar botón "Subir imágenes" en cada celda habilitada
- [ ] Implementar modal de gestión de imágenes específico por variante
- [ ] Almacenar URLs de imágenes en `VariantCell.images`
- [ ] Mostrar preview de imágenes en cada celda de la matriz

### 2. **Reorganizar Tabs del Formulario**
**Prioridad: ALTA**

Los tabs deben reflejar qué datos son del maestro vs variantes:

**Para Producto Maestro (nuevo):**
- Tab 1: Info Básica (solo modelo, slug, productGroupId) ✅
- Tab 2: ~~Imágenes~~ → **ELIMINAR** (el maestro no tiene imágenes)
- Tab 3: ~~Precios~~ → **ELIMINAR** (el maestro no tiene precio)
- Tab 4: Penalidades ✅
- Tab 5: Pagos ✅
- Tab 6: Specs ✅
- Tab 7: Contenido ✅
- Tab 8: SEO ✅
- Tab 9: **Variantes (con imágenes por variante)** ✅

**Para Variante (edición):**
- Mostrar todos los tabs incluyendo imágenes y precios

**Tareas:**
- [ ] Ocultar Tab 2 y Tab 3 cuando NO es edición de variante
- [ ] Agregar mensaje informativo explicando que imágenes/precios se gestionan en Tab 9
- [ ] Actualizar validaciones para no requerir imágenes en el maestro

### 3. **Mejorar UI/UX de VariantMatrix**
**Prioridad: MEDIA**

**Tareas:**
- [ ] Agregar indicador visual de cuántas imágenes tiene cada variante
- [ ] Agregar vista previa de primera imagen en cada celda
- [ ] Mejorar diseño de la matriz (más compacto y profesional)
- [ ] Agregar tooltips explicativos
- [ ] Agregar acción bulk: "Aplicar imágenes a todas las variantes del mismo color"

### 4. **Página de Producto (Frontend)**
**Prioridad: ALTA**

La página `/iphone-18-pro` debe mostrar la primera variante por defecto y permitir cambiar entre variantes dinámicamente.

**Tareas:**
- [ ] Cargar primera variante por defecto al abrir la página
- [ ] Implementar selector visual de Storage (botones)
- [ ] Implementar selector visual de Color (botones con miniatura)
- [ ] Cambiar imágenes del hero al seleccionar otra variante
- [ ] Actualizar precio, stock, y datos dinámicamente sin recargar
- [ ] Actualizar URL con `?variant=id` al cambiar variante
- [ ] Mantener selección al recargar página

### 5. **Schema JSON-LD Completo**
**Prioridad: ALTA**

Asegurar que Google Search Console y Merchant Center detecten correctamente todas las variantes.

**Tareas:**
- [ ] Verificar que `buildProductGroupSchema` incluya todas las variantes
- [ ] Verificar que cada variante tenga `offers` con su precio/stock
- [ ] Validar que `item_group_id` esté en el feed de Merchant Center
- [ ] Probar en Google Rich Results Test

### 6. **Optimizaciones de Rendimiento**
**Prioridad: BAJA**

**Tareas:**
- [ ] Lazy load de imágenes de variantes no visibles
- [ ] Cachear variantes en memoria después de cargarlas
- [ ] Optimizar consultas de Firestore con índices compuestos

### 7. **Testing y Validación**
**Prioridad: MEDIA**

**Tareas:**
- [ ] Probar flujo completo: Crear maestro → Agregar variantes → Publicar
- [ ] Verificar que stock del maestro se actualiza correctamente
- [ ] Verificar que thumbnail del maestro usa imagen de primera variante
- [ ] Probar edición de variante individual
- [ ] Verificar que SEO se genera correctamente para todas las variantes
- [ ] Validar que navbar solo muestra maestros
- [ ] Probar que URLs `/iphone-18-pro-256gb-negro` redirigen o no existen

## 📚 Recursos y Referencias

### Ejemplos de E-commerce que funcionan así:
- **Apple**: `/iphone-15-pro` → selector de almacenamiento y color
- **Samsung**: `/galaxy-s24` → selector de modelo y color
- **Amazon**: Un ASIN para el producto, variantes en dropdown

### Documentación relevante:
- [Google Merchant Center - Variantes](https://support.google.com/merchants/answer/6324507)
- [Schema.org - ProductGroup](https://schema.org/ProductGroup)
- [Next.js - Dynamic Routes](https://nextjs.org/docs/routing/dynamic-routes)

## 🎯 Próximos Pasos Inmediatos

1. **Implementar gestor de imágenes por variante en VariantMatrix**
2. **Ocultar Tabs 2 y 3 para productos maestros nuevos**
3. **Actualizar página de producto para cargar primera variante por defecto**
4. **Agregar selectores visuales de Storage y Color**
5. **Validar JSON-LD schemas con Google Rich Results Test**

---

**Estado actual:** Sistema base implementado, pendiente completar gestión de imágenes por variante y frontend de selección de variantes.
