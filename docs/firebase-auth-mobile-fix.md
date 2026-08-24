# Solución: Error "missing initial state" en autenticación con Google en móviles

## El Problema

Desde el **24 de junio de 2024**, los navegadores móviles (Chrome M115+, Safari 16.1+, Firefox 109+) bloquean de forma más agresiva el almacenamiento de terceros (third-party storage). Esto causa el error:

```
Unable to process request due to missing initial state.
This may happen if browser sessionStorage is inaccessible or accidentally cleared.
```

### Causa raíz

Cuando usas `signInWithRedirect()` con Firebase Auth, el SDK intenta usar un iframe cross-origin que conecta con tu `authDomain` (en nuestro caso `iphone-en-cuotas.firebaseapp.com`), pero:

- Tu app corre en `www.iphoneencuotas.com`
- Firebase Auth intenta acceder a `iphone-en-cuotas.firebaseapp.com`
- Los navegadores móviles **bloquean** el acceso al almacenamiento entre estos dos dominios diferentes
- Se pierde el "estado" del intento de login al volver de Google

**En PC funciona** porque el bloqueo es menos agresivo en navegadores de escritorio.

## La Solución Implementada

Cambiamos completamente a **`signInWithPopup()`** en lugar de `signInWithRedirect()`.

### ¿Por qué `signInWithPopup` resuelve el problema?

`signInWithPopup` evita **completamente** el problema del almacenamiento cross-origin porque:
- No depende de iframes cross-origin
- Abre la autenticación en una ventana popup de Google
- El estado se mantiene en la ventana principal, no en almacenamiento del navegador
- Funciona igual en móviles y desktop

### Archivos modificados

1. **`src/lib/firebase/auth.ts`**
   - Eliminamos el parámetro `useRedirect` de `signInWithGoogle()`
   - Eliminamos `signInWithRedirect` de los imports
   - Ahora siempre usa `signInWithPopup()`

2. **`src/context/AuthContext.tsx`**
   - Eliminamos el parámetro opcional `useRedirect` de la función `signIn()`

3. **`src/app/(auth)/login/page.tsx`**
   - Eliminamos la función `isMobile()`
   - Simplificamos el llamado a `signIn()` sin parámetros

4. **`next.config.ts`** (ya estaba bien configurado)
   - Ya tenía `Cross-Origin-Opener-Policy: same-origin-allow-popups`
   - Este header es necesario para que funcionen los popups de OAuth

## Referencias

- [Firebase Best Practices for signInWithRedirect](https://firebase.google.com/docs/auth/web/redirect-best-practices)
- [Proxy Firebase Auth with Next.js on Vercel](https://duncanleung.com/blog/missing-initial-state-firebase-auth-proxy-nextjs-vercel/)
- [Vercel & Firebase Auth Redirect Errors Fix](https://openillumi.com/en/en-fix-firebase-auth-redirect-error-vercel-nextjs/)

## Alternativas No Implementadas

Si en el futuro necesitas mantener `signInWithRedirect` por alguna razón (ej: bloqueadores de popups), tendrías que:

1. **Opción 1: Custom authDomain** (requiere Firebase Hosting o proxy)
   - Cambiar `authDomain: "www.iphoneencuotas.com"` en `firebaseConfig`
   - Agregar rewrites en `next.config.ts` para proxyear `/__/auth/*`
   - Autorizar `https://www.iphoneencuotas.com/__/auth/handler` en Google Cloud Console

2. **Opción 2: Reverse Proxy en Vercel**
   - Configurar rewrites en `vercel.json` o `next.config.ts`
   - Reenviar todas las requests de `/__/auth/*` a `iphone-en-cuotas.firebaseapp.com/__/auth/*`

Pero estas opciones son **más complejas** y **no necesarias** si `signInWithPopup` funciona bien (que es nuestro caso).

## Verificación

Para verificar que el fix funciona:

1. Abre la app en un navegador móvil (Chrome en Android o Safari en iOS)
2. Ve a `/login`
3. Haz clic en "Continuar con Google"
4. Debería abrir un popup con la selección de cuenta de Google
5. Después de seleccionar la cuenta, el popup se cierra y te redirige al dashboard

**No debería aparecer más el error "missing initial state"**
