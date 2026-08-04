# 🔥 PROBLEMA CRÍTICO ENCONTRADO

## Error Identificado

```
3 INVALID_ARGUMENT: Invalid resource field value in the request
```

Este error indica que **las credenciales de Firebase están mal configuradas o el proyecto no existe**.

---

## 🔍 Diagnóstico

He ejecutado el script de verificación y encontré que:

1. ✅ El servidor Next.js arranca correctamente
2. ✅ El código de Firebase está bien implementado  
3. ❌ **Firestore NO puede conectarse** - Error de configuración

### El error específico significa:

- El `projectId` en la configuración NO coincide con un proyecto real en Firebase
- O las credenciales están desactualizadas
- O el proyecto fue eliminado/renombrado

---

## 🔧 Solución Inmediata

### Paso 1: Verificar que el proyecto existe en Firebase

Ve a: https://console.firebase.google.com/

¿Ves un proyecto llamado **"iphone-en-cuotas"**?

- ✅ **SÍ existe** → Continúa al Paso 2
- ❌ **NO existe** → Necesitas crear el proyecto o usar uno diferente

### Paso 2: Obtener las credenciales correctas

1. Ve a tu proyecto en Firebase Console
2. **Project Settings** (⚙️ arriba a la izquierda)
3. Scroll hasta **"Your apps"**
4. Busca tu **Web app** o crea una nueva
5. Copia las credenciales que aparecen

Deberías ver algo como:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.firebasestorage.app", // ← Importante este formato
  messagingSenderId: "...",
  appId: "1:...:web:...",
  measurementId: "G-..."
};
```

### Paso 3: Actualizar `.env.local`

Compara tus variables actuales con las de Firebase Console:

**En `.env.local` tienes:**
```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=iphone-en-cuotas.firebasestorage.app
```

**Verifica que coincida EXACTAMENTE con lo que dice en Firebase Console.**

### Paso 4: Si el storage bucket está mal

El formato correcto del storage bucket en Firebase cambió recientemente:

- ❌ Formato viejo: `proyecto.appspot.com`
- ✅ Formato nuevo: `proyecto.firebasestorage.app`

Si tu proyecto es antiguo, puede que necesites el formato viejo.

---

## 🧪 Verificación Rápida

Ejecuta este comando para verificar la conexión:

```bash
npx tsx scripts/check-products.ts
```

**Resultado esperado:**
- ✅ Sin error "INVALID_ARGUMENT"
- ✅ "Total de productos en Firestore: X" (puede ser 0 si no hay productos)

**Si sigue fallando:**
- El problema es definitivamente las credenciales
- Necesitas copiarlas de nuevo desde Firebase Console

---

## 📝 Checklist de Verificación

- [ ] El proyecto "iphone-en-cuotas" existe en Firebase Console
- [ ] Las credenciales en `.env.local` coinciden con Firebase Console
- [ ] El formato del `storageBucket` es correcto
- [ ] Has reiniciado el servidor después de cambiar `.env.local`
- [ ] El script `check-products.ts` se ejecuta sin error "INVALID_ARGUMENT"

---

## 🎯 Por Qué Esto Explica TODO

Este error explica **todos** tus problemas:

1. ❌ **Navbar no muestra datos del usuario**
   → No puede leer/escribir en `users/{uid}` en Firestore

2. ❌ **Productos no se muestran**
   → No puede leer `products` en Firestore

3. ❌ **Login puede fallar o no persistir sesión**
   → `ensureUserDocument()` falla al intentar escribir en Firestore

**TODO se debe a que Firestore no puede conectarse debido a credenciales inválidas.**

---

## 🔄 Próximos Pasos

1. Verifica el proyecto existe en Firebase Console
2. Copia las credenciales EXACTAS
3. Actualiza `.env.local`
4. Reinicia el servidor: `Ctrl+C` y `npm run dev`
5. Ejecuta: `npx tsx scripts/check-products.ts`
6. Si muestra productos (o 0 productos pero sin error), ✅ **funcionará todo**

---

**Fecha:** 04 de agosto de 2026  
**Problema raíz:** Credenciales de Firebase inválidas o proyecto inexistente
