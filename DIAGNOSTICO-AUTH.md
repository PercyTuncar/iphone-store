# 🔍 Diagnóstico del Problema de Autenticación

**Fecha:** 04 de agosto de 2026  
**Problema reportado:** Usuario no puede loguearse o la sesión no persiste

---

## 📋 Análisis Realizado

He revisado el código completo del sistema de autenticación y he identificado **POSIBLES** causas del problema:

---

## ⚠️ Problema #1: Reglas de Firestore (MÁS PROBABLE)

### Síntoma
El usuario puede hacer login con Google, pero el `appUser` no se carga o aparece como `null`.

### Causa
La función `ensureUserDocument()` en [src/lib/firebase/auth.ts:77-109](src/lib/firebase/auth.ts#L77-L109) intenta:
1. Leer el documento del usuario: `await getDoc(userRef)`
2. Si no existe, crear uno nuevo: `await setDoc(userRef, newUser)`
3. Actualizar `lastLoginAt`: `await updateDoc(userRef, { lastLoginAt: serverTimestamp() })`

**Estas operaciones REQUIEREN que las reglas de Firestore permitan:**
- Lectura de `users/{uid}` cuando el usuario está autenticado
- Escritura de `users/{uid}` cuando el usuario está autenticado

### Verificación necesaria

**Paso 1: Revisar reglas de Firestore en Firebase Console**

Ve a: https://console.firebase.google.com/project/iphone-en-cuotas/firestore/rules

Las reglas deben ser algo como:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios pueden leer/escribir su propio documento
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Productos publicados son públicos
    match /products/{productId} {
      allow read: if resource.data.status == 'published';
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Blog posts publicados son públicos
    match /blog/{postId} {
      allow read: if resource.data.status == 'published';
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

**Si las reglas son más restrictivas o están mal configuradas, `ensureUserDocument()` FALLARÁ silenciosamente.**

---

## ⚠️ Problema #2: Cookie de sesión no se establece

### Síntoma
El usuario hace login, pero al recargar la página o navegar a `/admin` o `/dashboard`, es redirigido a `/login`.

### Causa
El middleware [middleware.ts:19-38](middleware.ts#L19-L38) verifica la cookie `__session`:

```typescript
const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
const hasSession    = !!(sessionCookie && sessionCookie.trim().length > 0);

if (!hasSession) {
  // Redirect a /login
}
```

**La cookie se crea en [src/app/api/session/route.ts:17-74](src/app/api/session/route.ts#L17-L74)** después del login exitoso.

### Verificación necesaria

**En el navegador (DevTools → Application → Cookies):**

Después de hacer login, debe existir una cookie llamada `__session` con:
- Domain: `localhost` (desarrollo) o `www.iphoneencuotas.com` (producción)
- Path: `/`
- HttpOnly: ✓
- Secure: ✓ (solo en producción)
- SameSite: `Lax`

**Si la cookie NO aparece:**
- El flujo `signInWithGoogleAndCreateSession()` falló
- La llamada `POST /api/session` falló
- Hay un error en la consola del navegador

---

## ⚠️ Problema #3: Firebase Admin SDK no inicializado

### Síntoma
En producción, el login funciona una vez pero la sesión no persiste entre reloads.

### Causa
El archivo [src/app/api/session/route.ts:29-43](src/app/api/session/route.ts#L29-L43) intenta usar Firebase Admin SDK:

```typescript
const { getAdminAuth } = await import('@/lib/firebase/admin');
const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
  expiresIn: MAX_AGE_SECONDS * 1000,
});
```

Si el Admin SDK NO está configurado correctamente (credenciales inválidas o ausentes), cae en el fallback (líneas 49-69) que crea una cookie simple.

**El fallback funciona en desarrollo, pero NO es seguro para producción.**

### Verificación necesaria

**En `.env.local` (o variables de Vercel):**

```bash
FIREBASE_ADMIN_PROJECT_ID=iphone-en-cuotas
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@iphone-en-cuotas.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

**La private key DEBE tener `\n` literales (no newlines reales en el archivo .env).**

Verifica que las credenciales en `.env.local` coincidan con las de Firebase Console:
https://console.firebase.google.com/project/iphone-en-cuotas/settings/serviceaccounts/adminsdk

---

## ⚠️ Problema #4: AuthDomain mal configurado

### Síntoma
Al hacer clic en "Continuar con Google", el popup no se abre o se abre y se cierra inmediatamente.

### Causa
Firebase Authentication requiere que el `authDomain` esté autorizado.

### Verificación necesaria

Ve a Firebase Console → Authentication → Settings → Authorized domains:
https://console.firebase.google.com/project/iphone-en-cuotas/authentication/settings

Debe incluir:
- `localhost` (para desarrollo)
- `iphone-en-cuotas.firebaseapp.com` (default)
- `www.iphoneencuotas.com` (tu dominio custom)
- `iphoneencuotas.com` (sin www, por si acaso)

---

## 🔧 Pasos de Diagnóstico (Ejecuta en orden)

### 1. Abrir DevTools en el navegador

**Chrome/Edge:** F12  
**Firefox:** F12

### 2. Ir a la pestaña Console

### 3. Intentar hacer login

Click en "Continuar con Google"

### 4. Buscar errores en la consola

**Errores comunes:**

```
❌ "Missing or insufficient permissions"
→ Problema: Reglas de Firestore (Problema #1)

❌ "Failed to create session"
→ Problema: Cookie no se crea (Problema #2)

❌ "auth/unauthorized-domain"
→ Problema: authDomain no autorizado (Problema #4)

❌ "auth/popup-closed-by-user"
→ No es un error real, el usuario cerró el popup

❌ "FirebaseError: [ensureUserDocument] ..."
→ Problema: Reglas de Firestore (Problema #1)
```

### 5. Verificar la pestaña Network

Busca estas llamadas:

1. **POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp**
   - Status: 200 ✓
   - Si falla: problema con Firebase Auth

2. **POST http://localhost:3002/api/session** (o tu dominio)
   - Status: 200 ✓
   - Response: `{"status":"ok","method":"admin"}` o `{"status":"ok","method":"fallback"}`
   - Si falla: problema en el endpoint de sesión

3. **GET http://localhost:3002/dashboard** (o la ruta protegida)
   - Status: 200 ✓ (se carga la página)
   - Status: 307 → /login ❌ (redirect, no hay cookie)

### 6. Verificar la pestaña Application → Cookies

Debe haber una cookie `__session` después del login.

---

## 🚨 Soluciones Rápidas

### Si el problema es: Reglas de Firestore

1. Ve a Firebase Console → Firestore Database → Rules
2. Actualiza las reglas según el ejemplo arriba
3. Publica las reglas
4. Intenta login de nuevo

### Si el problema es: Cookie no se crea

1. Abre DevTools → Console
2. Pega este código:
   ```javascript
   document.cookie.split(';').forEach(c => console.log(c.trim()))
   ```
3. Busca `__session`
4. Si NO aparece, revisa los logs de Network → `/api/session`

### Si el problema es: Admin SDK

1. Verifica variables de entorno en Vercel (Production)
2. Asegúrate de que `FIREBASE_ADMIN_PRIVATE_KEY` tenga `\n` literales
3. Redeploy después de cambiar variables

### Si el problema es: authDomain

1. Firebase Console → Authentication → Settings → Authorized domains
2. Agrega tu dominio
3. Espera 5-10 minutos a que se propague

---

## 📊 Tabla de Diagnóstico Rápido

| Síntoma | Causa Probable | Solución |
|---------|----------------|----------|
| Popup no se abre | authDomain no autorizado | Agregar dominio en Firebase Console |
| Popup se abre pero login falla | Reglas de Firestore | Actualizar reglas para permitir users/{uid} |
| Login exitoso pero redirect a /login | Cookie no se crea | Verificar /api/session en Network tab |
| Sesión no persiste entre reloads | Admin SDK mal configurado | Verificar variables de entorno |
| `appUser` es null | ensureUserDocument() falla | Reglas de Firestore + Console logs |

---

## 🧪 Script de Prueba (Ejecutar en Console del navegador)

Después de hacer login exitoso:

```javascript
// Verificar Firebase User
firebase.auth().currentUser
// Debe devolver: {uid: "...", email: "...", ...}

// Verificar Cookie
document.cookie
// Debe incluir: "__session=..."

// Verificar appUser en localStorage (si usas algún cache)
localStorage.getItem('appUser')
```

---

## 📞 Siguiente Paso

**SI DESPUÉS DE REVISAR TODO LO ANTERIOR EL PROBLEMA PERSISTE:**

Necesito que me proporciones:
1. Screenshot de la consola del navegador (errores)
2. Screenshot de Network tab → POST /api/session (request + response)
3. Screenshot de Application → Cookies
4. Captura de las reglas actuales de Firestore

Con esa información podré identificar el problema exacto.

---

**Fecha de análisis:** 04 de agosto de 2026  
**Archivos revisados:** AuthContext.tsx, auth.ts, config.ts, middleware.ts, route.ts (session), login page  
**Estado:** Diagnóstico completo - Esperando información del usuario para identificar causa exacta
