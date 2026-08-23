# ⚡ ACCIÓN INMEDIATA - Migración de Variantes

## 🎯 Problema Actual

Tienes 3 documentos separados en Firestore cuando deberían ser 1 producto con 2 variantes embebidas.

## 🚀 Solución en 3 Comandos

### 1. Ejecutar la Migración

```bash
npx tsx scripts/migrate-to-embedded-variants.ts
```

Esto convertirá automáticamente:
- **De:** 3 documentos separados (9alYt7c7jXxWRqKBf893, CfqbEcHktAwYAd6bCGAy, P98ritvQxAjmcAL7dBpM)
- **A:** 1 documento con array `variants[]`

### 2. Iniciar el Servidor

```bash
npm run dev
```

### 3. Verificar en el Navegador

Abre: `http://localhost:3000/[tu-slug]`

## ✅ Resultado Esperado

Verás el selector de variantes con:
- Botones de capacidad (128GB, 256GB, 512GB, etc.)
- Botones de color (Negro, Azul, Blanco, etc.)
- Cambio dinámico de precio, stock e imágenes al seleccionar

## 📋 Checklist

- [ ] Ejecutar: `npx tsx scripts/migrate-to-embedded-variants.ts`
- [ ] Ver mensaje: "🎉 Migración completada exitosamente!"
- [ ] Ejecutar: `npm run dev`
- [ ] Abrir la página del producto
- [ ] Confirmar que aparece el selector de variantes
- [ ] Probar cambiar entre variantes

## 🐛 Si algo falla

```bash
# Verificar estructura actual
npx tsx scripts/check-variants.ts [tu-slug]

# Ver logs detallados
# Abre F12 en el navegador → Console tab
```

## 📚 Documentación

- **MIGRATION_GUIDE.md** - Guía completa paso a paso
- **TROUBLESHOOTING_VARIANTS.md** - Problemas comunes y soluciones
- **VARIANT_IMPLEMENTATION_SUMMARY.md** - Documentación técnica

## 🎉 Eso es Todo

Una vez ejecutada la migración, el selector aparecerá automáticamente y funcionará de forma lógica y consistente como solicitaste.
