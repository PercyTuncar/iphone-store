# 🚀 ACCIÓN INMEDIATA REQUERIDA

**Tu código está listo. Ahora debes configurar Vercel.**

---

## ⚡ Pasos que debes hacer AHORA (15 minutos)

### 1️⃣ Actualizar variable en Vercel (5 min)

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `iphone-store`
3. **Settings** → **Environment Variables**
4. Busca `NEXT_PUBLIC_SITE_URL`
5. Edítala o créala con este valor exacto:
   ```
   https://www.iphoneencuotas.com
   ```
6. Asegúrate que esté en **Production**
7. Guarda

### 2️⃣ Forzar nuevo deployment (2 min)

**Opción A - Desde Vercel:**
- **Deployments** → último deployment → ⋯ → **Redeploy**
- ❌ Desmarca "Use existing Build Cache"
- Confirma

**Opción B - Desde tu terminal (recomendado):**
```bash
git commit --allow-empty -m "chore: force rebuild for env var"
git push origin main
```

### 3️⃣ Esperar el deployment (3-5 min)

Vercel te mostrará el progreso. Espera a que diga **"Ready"**.

### 4️⃣ Verificar que funcionó (5 min)

Abre estas páginas y presiona **Ctrl+U** (ver código fuente):

✅ https://www.iphoneencuotas.com/
✅ https://www.iphoneencuotas.com/iphone-en-cuotas
✅ https://www.iphoneencuotas.com/iphone/iphone-15-pro

**Busca esta línea:**
```html
<link rel="canonical" href="https://www.iphoneencuotas.com/...">
```

Si tiene `www`, ✅ **funcionó**.  
Si NO tiene `www`, ⚠️ algo salió mal.

---

## 📋 Siguientes pasos (después de verificar)

### 5️⃣ Actualizar producto en Firestore (5 min)

1. Ve a https://www.iphoneencuotas.com/admin
2. Edita el producto "iPhone 15 Pro"
3. Verifica que el campo **Canonical URL** diga `https://www.iphoneencuotas.com/iphone/iphone-15-pro`
4. Si no tiene `www`, edítalo manualmente
5. **Guarda**

### 6️⃣ Google Search Console (5 min)

1. Ve a https://search.google.com/search-console
2. Selecciona propiedad `www.iphoneencuotas.com`
3. **Sitemaps** → Agregar: `https://www.iphoneencuotas.com/sitemap.xml`
4. **Inspección de URL** → Pega cada URL y haz clic en **Solicitar indexación**:
   - `https://www.iphoneencuotas.com/iphone-en-cuotas`
   - `https://www.iphoneencuotas.com/iphone/iphone-15-pro`

---

## ✅ ¿Cómo saber si todo salió bien?

### Inmediatamente:
- ✅ Canonical URLs tienen `www` en todas las páginas
- ✅ Footer/Navbar muestran solo el iPhone 15 Pro (no 404s)
- ✅ Redirect funciona: `iphoneencuotas.com` → `www.iphoneencuotas.com` (301)

### En 3-7 días:
- ✅ Google Search Console muestra más páginas en "Cobertura"
- ✅ Desaparecen warnings de "duplicada"

### En 2-4 semanas:
- ✅ Las páginas aparecen en búsquedas de Google
- ✅ Tráfico orgánico empieza a crecer

---

## 🆘 Si algo falla

**"Sigo viendo URLs sin www"**
→ Ctrl+Shift+R para limpiar cache
→ Prueba en modo incógnito
→ Verifica que hiciste redeploy SIN cache

**"Los productos no aparecen en navegación"**
→ Abre consola del navegador (F12)
→ Busca errores relacionados con Firestore
→ Verifica reglas de Firestore permiten lectura pública

**"404 en productos existentes"**
→ Prueba en modo incógnito
→ Si funciona logueado pero no en incógnito: problema de reglas Firestore

---

## 📚 Documentación completa

- **Instrucciones paso a paso:** `INSTRUCCIONES-DESPLIEGUE-SEO.md`
- **Resumen técnico completo:** `RESUMEN-IMPLEMENTACION-SEO.md`
- **Commit con cambios:** `79c8fca`

---

## 🎯 Lo que se arregló en el código

✅ Variable de entorno corregida en `.env.example`  
✅ Sistema de navegación dinámico (sin 404s)  
✅ Footer carga productos desde Firestore  
✅ Navbar carga productos dinámicamente  
✅ BottomTabBar carga productos dinámicamente  
✅ Documentación completa de despliegue

**Solo falta:** Configurar Vercel (pasos 1 y 2 arriba) 👆

---

**⏰ Tiempo total estimado:** 15-20 minutos  
**🎯 Prioridad:** ALTA — Este es el 90% de tu problema de indexación en Google
