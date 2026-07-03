# PRD — iPhone en Cuotas
### Documento de Requisitos del Producto · Versión 1.0
**Dominio:** iphoneencuotas.com  
**Stack:** Next.js 15 (App Router) + Firebase (Firestore, Storage, Auth)  
**Fecha:** Julio 2025  
**Audiencia:** Equipo de desarrollo full-stack

---

> **Nota para el desarrollador:** Este documento es la fuente única de verdad. Cada decisión de diseño, flujo de usuario, regla de negocio y componente técnico está explicado con el suficiente detalle para que no sea necesario hacer preguntas adicionales. Léelo completo antes de escribir una sola línea de código. El orden de los capítulos sigue el orden lógico en que debes construir el sistema.

---

## ÍNDICE

1. [Visión General del Producto](#1-visión-general-del-producto)
2. [Arquitectura del Proyecto Next.js 15](#2-arquitectura-del-proyecto-nextjs-15)
3. [Firebase: Configuración y Estructura de Base de Datos](#3-firebase-configuración-y-estructura-de-base-de-datos)
4. [Sistema de Diseño y UI/UX — Estilo Apple](#4-sistema-de-diseño-y-uiux--estilo-apple)
5. [Navegación: Navbar Adaptativo y Bottom Tab Bar](#5-navegación-navbar-adaptativo-y-bottom-tab-bar)
6. [Autenticación con Google](#6-autenticación-con-google)
7. [Páginas Públicas: Home y Páginas de Producto](#7-páginas-públicas-home-y-páginas-de-producto)
8. [SEO Técnico: Schema JSON-LD, Meta Tags y Sitemap Dinámico](#8-seo-técnico-schema-json-ld-meta-tags-y-sitemap-dinámico)
9. [Flujo Completo de Compra: Reserva, Pagos y Cuotas](#9-flujo-completo-de-compra-reserva-pagos-y-cuotas)
10. [Sistema de Seguros de Prórroga](#10-sistema-de-seguros-de-prórroga)
11. [Penalidades y Reglas de Negocio Críticas](#11-penalidades-y-reglas-de-negocio-críticas)
12. [Dashboard del Administrador](#12-dashboard-del-administrador)
13. [Dashboard del Cliente](#13-dashboard-del-cliente)
14. [Sistema de Envíos y Fletes](#14-sistema-de-envíos-y-fletes)
15. [Sistema de Reseñas Verificadas](#15-sistema-de-reseñas-verificadas)
16. [Módulo de Blog Administrable](#16-módulo-de-blog-administrable)
17. [Abandono de Carrito y Notificaciones](#17-abandono-de-carrito-y-notificaciones)
18. [Optimización de Imágenes y Core Web Vitals](#18-optimización-de-imágenes-y-core-web-vitals)
19. [Historial de Auditoría y Logs del Admin](#19-historial-de-auditoría-y-logs-del-admin)
20. [Términos, Condiciones y Protección Legal](#20-términos-condiciones-y-protección-legal)
21. [Micro-interacciones y Animaciones](#21-micro-interacciones-y-animaciones)

---

## 1. Visión General del Producto

### 1.1 Qué es iPhone en Cuotas

**iPhone en Cuotas** es una plataforma de e-commerce especializada en la venta a plazos de iPhones —desde el modelo 13 hasta el 17 Pro Max— en el mercado peruano. El negocio opera bajo el dominio **iphoneencuotas.com** y tiene una propuesta de valor clara: cualquier persona puede acceder a un iPhone nuevo, reacondicionado o de diferentes grados de calidad (A+, A, B) pagando en cuotas sin necesidad de tarjeta de crédito bancaria, utilizando medios de pago locales como Yape, Plin y transferencias bancarias.

El desafío central del producto —y el que dicta cada decisión de diseño— es el siguiente: **el cliente debe confiar tanto en el negocio como para entregar dinero por adelantado antes de recibir el equipo**. Esto requiere que la plataforma transmita autoridad, transparencia y profesionalismo al nivel de las páginas oficiales de Apple, al mismo tiempo que ofrece una experiencia de usuario fluida, moderna y motivadora.

### 1.2 Objetivos del Producto

El producto tiene tres objetivos estratégicos que deben estar presentes en cada decisión técnica y de diseño:

**Primero, posicionamiento orgánico en Google.** Cada página de modelo de iPhone debe aparecer en los primeros resultados de búsqueda para términos como "comprar iPhone 15 Pro en cuotas Perú" o "iPhone 13 precio cuotas sin tarjeta". Esto se logra a través de SEO técnico impecable, páginas independientes por modelo, estructura semántica correcta, Schema JSON-LD dinámico y velocidad de carga excelente (Core Web Vitals en verde).

**Segundo, conversión de visitantes en compradores.** Una vez que el usuario llega a una página de producto, la experiencia debe eliminar todas las fricciones y objeciones posibles. El diseño al estilo Apple, la transparencia en los precios y condiciones, las reseñas verificadas de clientes reales, y el flujo de pago intuitivo deben hacer que el botón "Reservar" sea la decisión más natural del mundo.

**Tercero, operación eficiente para el administrador.** El negocio es manejado por una sola persona o un equipo pequeño. El panel de administración debe permitir publicar nuevos modelos, gestionar pedidos, aprobar pagos, actualizar estados de envío y moderar reseñas de forma rápida y sin necesidad de conocimientos técnicos.

### 1.3 Alcance del Producto

El sistema incluye los siguientes módulos principales, cada uno descrito en detalle en los capítulos siguientes:

La plataforma comprende un **sitio web público** con páginas de Home, páginas individuales por modelo de iPhone (desde el 13 hasta el 17 Pro Max), un módulo de Blog, páginas de login y registro. Incluye un **sistema de autenticación** con Google OAuth. El **flujo de compra** cubre desde la reserva hasta el seguimiento de cuotas con línea de tiempo interactiva. El **panel de administrador** permite gestión completa de productos, pedidos, pagos, envíos, reseñas, blog y configuración SEO por página. El **dashboard del cliente** ofrece seguimiento de su pedido, estado de cuotas y gestión del seguro. Y el **sistema SEO técnico** incluye sitemap dinámico, robots.txt, Schema JSON-LD por página y optimización de Core Web Vitals.

---

## 2. Arquitectura del Proyecto Next.js 15

### 2.1 Por qué Next.js 15 con App Router

Next.js 15 utiliza el **App Router** como sistema de rutas principal. A diferencia del Pages Router anterior, el App Router está construido sobre React Server Components (RSC), lo que significa que los componentes se renderizan en el servidor por defecto. Para SEO, esto es fundamental: Google recibe el HTML completamente renderizado desde el primer momento, sin necesitar ejecutar JavaScript en el cliente para ver el contenido. Esto acelera la indexación y mejora el ranking directamente.

El App Router también introduce el concepto de **layouts anidados**: puedes tener un layout raíz que aplica a todo el sitio (el navbar, el footer), layouts específicos para el área de admin que requieren autenticación, y layouts para el área del cliente. Esto evita re-renderizar componentes comunes en cada navegación.

Otro concepto clave son las **Server Actions**: funciones asíncronas que se ejecutan en el servidor y pueden llamarse directamente desde componentes del cliente o del servidor, sin necesidad de crear endpoints de API manualmente. Las usaremos para operaciones de escritura en Firestore (aprobar pagos, actualizar estados, publicar productos).

### 2.2 Estructura Completa de Carpetas y Archivos

La siguiente estructura es la que debe implementarse. Cada archivo y carpeta tiene un propósito específico que se explica a continuación:

```
iphoneencuotas/
├── .env.local                          # Variables de entorno secretas (Firebase, URLs)
├── .env.example                        # Plantilla de variables (sin valores reales, va al repo)
├── .gitignore                          # Ignorar .env.local, node_modules, .next
├── next.config.ts                      # Configuración de Next.js (imágenes, redirects, headers)
├── tailwind.config.ts                  # Configuración de Tailwind con el design system personalizado
├── tsconfig.json                       # Configuración de TypeScript
├── package.json                        # Dependencias y scripts
├── middleware.ts                       # Middleware de Next.js para protección de rutas
│
├── public/                             # Archivos estáticos servidos directamente
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── og-default.jpg                  # Imagen Open Graph por defecto del sitio
│   └── robots.txt                      # NOTA: este archivo será reemplazado por la ruta dinámica
│
├── src/
│   ├── app/                            # Todo el sistema de rutas (App Router)
│   │   │
│   │   ├── layout.tsx                  # Layout raíz: aplica a TODO el sitio
│   │   │                               # Aquí van: fuentes, providers globales (AuthProvider,
│   │   │                               # ThemeProvider), navbar, footer y el toaster de notificaciones.
│   │   │
│   │   ├── globals.css                 # Estilos globales y variables CSS del design system
│   │   │
│   │   ├── page.tsx                    # Página Home (/)
│   │   │                               # Server Component. Carga los modelos publicados desde
│   │   │                               # Firestore en el servidor y los pasa como props.
│   │   │
│   │   ├── not-found.tsx               # Página 404 personalizada con diseño Apple
│   │   │
│   │   ├── error.tsx                   # Página de error global (errores de servidor)
│   │   │
│   │   ├── sitemap.ts                  # Genera el sitemap.xml dinámicamente
│   │   │                               # Lee los slugs publicados de Firestore en tiempo de build
│   │   │                               # o en cada request (revalidación). Incluye Home, cada
│   │   │                               # modelo de iPhone publicado, y cada post de blog publicado.
│   │   │
│   │   ├── robots.ts                   # Genera robots.txt dinámicamente
│   │   │                               # Permite indexar todo excepto /admin y /dashboard.
│   │   │
│   │   ├── (auth)/                     # Grupo de rutas de autenticación (el paréntesis NO
│   │   │   │                           # aparece en la URL, es solo para organización interna)
│   │   │   ├── login/
│   │   │   │   └── page.tsx            # Página /login — muestra botón "Continuar con Google"
│   │   │   └── auth-callback/
│   │   │       └── page.tsx            # /auth-callback — maneja el redirect post-login de Google
│   │   │                               # y redirige al usuario a donde estaba antes del login
│   │   │
│   │   ├── (public)/                   # Grupo de rutas públicas con layout compartido
│   │   │   ├── layout.tsx              # Layout con navbar y footer para páginas públicas
│   │   │   │
│   │   │   ├── iphone/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx        # Página de cada modelo: /iphone/iphone-15-pro-max
│   │   │   │                           # Server Component con generateMetadata() para SEO dinámico.
│   │   │   │                           # Carga el producto desde Firestore por su slug.
│   │   │   │
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx            # Listado del blog (/blog) — Server Component
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx        # Artículo individual (/blog/como-comprar-iphone-en-cuotas)
│   │   │   │
│   │   │   └── terminos/
│   │   │       └── page.tsx            # /terminos — Términos y condiciones
│   │   │
│   │   ├── pago-exitoso/
│   │   │   └── page.tsx                # Página post-pago online. El cliente llega aquí después
│   │   │                               # de completar el pago en el link externo. Aquí sube su
│   │   │                               # comprobante y llena sus datos de envío.
│   │   │
│   │   ├── dashboard/                  # Área privada del CLIENTE (requiere auth)
│   │   │   ├── layout.tsx              # Layout del dashboard del cliente — verifica auth,
│   │   │   │                           # si no hay sesión redirige a /login
│   │   │   ├── page.tsx                # /dashboard — resumen general del pedido del cliente
│   │   │   └── pedido/
│   │   │       └── [orderId]/
│   │   │           └── page.tsx        # /dashboard/pedido/[id] — detalle completo de un pedido
│   │   │                               # con línea de tiempo de cuotas
│   │   │
│   │   └── admin/                      # Área privada del ADMINISTRADOR (requiere auth + rol admin)
│   │       ├── layout.tsx              # Layout del admin — verifica auth Y rol admin en Firestore.
│   │       │                           # Si el usuario no tiene rol "admin", redirige a /dashboard.
│   │       ├── page.tsx                # /admin — dashboard principal con métricas clave
│   │       │
│   │       ├── productos/
│   │       │   ├── page.tsx            # /admin/productos — lista todos los modelos publicados y borradores
│   │       │   ├── nuevo/
│   │       │   │   └── page.tsx        # /admin/productos/nuevo — formulario para crear nuevo modelo
│   │       │   └── [id]/
│   │       │       └── page.tsx        # /admin/productos/[id] — editar un modelo existente
│   │       │
│   │       ├── pedidos/
│   │       │   ├── page.tsx            # /admin/pedidos — lista de todos los pedidos con filtros
│   │       │   └── [orderId]/
│   │       │       └── page.tsx        # /admin/pedidos/[id] — detalle completo de un pedido
│   │       │
│   │       ├── pagos/
│   │       │   └── page.tsx            # /admin/pagos — comprobantes pendientes de aprobación
│   │       │
│   │       ├── resenas/
│   │       │   └── page.tsx            # /admin/resenas — reseñas pendientes de moderación
│   │       │
│   │       ├── blog/
│   │       │   ├── page.tsx            # /admin/blog — lista de posts
│   │       │   ├── nuevo/
│   │       │   │   └── page.tsx        # /admin/blog/nuevo — editor de nuevo artículo
│   │       │   └── [postId]/
│   │       │       └── page.tsx        # /admin/blog/[id] — editar artículo existente
│   │       │
│   │       ├── envios/
│   │       │   └── page.tsx            # /admin/envios — configuración de fletes por departamento
│   │       │
│   │       ├── abandonos/
│   │       │   └── page.tsx            # /admin/abandonos — registro de reservas abandonadas
│   │       │
│   │       ├── notificaciones/
│   │       │   └── page.tsx            # /admin/notificaciones — enviar recordatorios a clientes
│   │       │
│   │       └── auditoria/
│   │           └── page.tsx            # /admin/auditoria — log de todas las acciones del admin
│   │
│   ├── components/                     # Componentes reutilizables de la UI
│   │   ├── ui/                         # Componentes base del design system (átomos)
│   │   │   ├── Button.tsx              # Botón con variantes: primary, secondary, ghost, danger
│   │   │   ├── Input.tsx               # Campo de texto accesible con label y mensaje de error
│   │   │   ├── Modal.tsx               # Modal/popup genérico con overlay y manejo de focus
│   │   │   ├── Badge.tsx               # Etiqueta de estado: Nuevo, Reacondicionado, En Stock
│   │   │   ├── Spinner.tsx             # Indicador de carga
│   │   │   ├── Toast.tsx               # Notificación temporal (éxito, error, info)
│   │   │   ├── Countdown.tsx           # Cuenta regresiva animada para cuotas próximas a vencer
│   │   │   ├── ProgressBar.tsx         # Barra de progreso para el pago de cuotas
│   │   │   └── Confetti.tsx            # Animación de confeti para celebrar cuota pagada
│   │   │
│   │   ├── layout/                     # Componentes de estructura de página
│   │   │   ├── Navbar.tsx              # Navbar principal con lógica adaptativa desktop/móvil
│   │   │   ├── BottomTabBar.tsx        # Menú inferior para móviles
│   │   │   ├── Footer.tsx              # Footer global del sitio
│   │   │   └── StickyBuyBar.tsx        # Barra de "Reservar" que se queda pegada en scroll
│   │   │
│   │   ├── product/                    # Componentes específicos de páginas de producto
│   │   │   ├── ProductHero.tsx         # Sección hero con foto del iPhone y precio destacado
│   │   │   ├── ProductSpecs.tsx        # Tabla/sección de especificaciones técnicas
│   │   │   ├── InstallmentPreview.tsx  # Simulador visual de cuotas: "12 cuotas de S/ 150"
│   │   │   ├── ReserveButton.tsx       # Botón CTA principal con check de auth
│   │   │   ├── PaymentModal.tsx        # Modal que aparece al presionar "Reservar"
│   │   │   ├── OfflinePaymentPanel.tsx # Panel con datos de Yape/transferencia + subida de comprobante
│   │   │   ├── OnlinePaymentPanel.tsx  # Panel con botón que redirige al link de pago externo
│   │   │   ├── InsuranceUpsell.tsx     # Componente del seguro de prórroga en el checkout
│   │   │   └── ReviewSection.tsx       # Sección de reseñas con rating y formulario
│   │   │
│   │   ├── dashboard/                  # Componentes del dashboard del cliente
│   │   │   ├── OrderTimeline.tsx       # Línea de tiempo interactiva de cuotas
│   │   │   ├── PaymentSlot.tsx         # Componente de una cuota individual (abierta/cerrada/pagada)
│   │   │   ├── UploadVoucher.tsx       # Formulario para subir comprobante de una cuota
│   │   │   ├── DeliveryTracker.tsx     # Estado de envío: Preparación > En camino > Entregado
│   │   │   └── InsurancePurchase.tsx   # Botón de "comprar seguro" desde el dashboard
│   │   │
│   │   ├── admin/                      # Componentes del panel de administrador
│   │   │   ├── ProductForm.tsx         # Formulario completo de creación/edición de producto
│   │   │   ├── SeoFields.tsx           # Sección de campos SEO dentro del formulario de producto
│   │   │   ├── SchemaPreview.tsx       # Vista previa del JSON-LD generado
│   │   │   ├── GooglePreview.tsx       # Simulación de cómo se verá en resultados de Google
│   │   │   ├── SocialPreview.tsx       # Simulación de cómo se verá en Facebook/Twitter
│   │   │   ├── PaymentApproval.tsx     # Tarjeta de comprobante pendiente con botones aprobar/rechazar
│   │   │   ├── OrderDetail.tsx         # Vista detallada de un pedido para el admin
│   │   │   ├── ShippingManager.tsx     # Configurador de fletes por departamento
│   │   │   ├── BlogEditor.tsx          # Editor WYSIWYG (TipTap) para artículos de blog
│   │   │   └── AuditLog.tsx            # Tabla de historial de acciones del admin
│   │   │
│   │   └── seo/                        # Componentes relacionados con SEO
│   │       ├── JsonLd.tsx              # Inyecta el schema JSON-LD en el <head>
│   │       └── BreadcrumbSchema.tsx    # Schema de breadcrumbs para navegación
│   │
│   ├── lib/                            # Lógica de negocio, utilidades e integraciones
│   │   ├── firebase/
│   │   │   ├── config.ts               # Inicialización de Firebase (app, db, storage, auth)
│   │   │   │                           # Usa las variables de .env.local. Exporta las instancias.
│   │   │   ├── auth.ts                 # Funciones de autenticación: signInWithGoogle, signOut,
│   │   │   │                           # getCurrentUser, subscribeToAuthState
│   │   │   ├── products.ts             # CRUD de productos en Firestore:
│   │   │   │                           # getProductBySlug, getAllProducts, createProduct,
│   │   │   │                           # updateProduct, deleteProduct, publishProduct
│   │   │   ├── orders.ts               # CRUD de pedidos: createOrder, getOrderById,
│   │   │   │                           # updateOrderStatus, getOrdersByUser, getAllOrders
│   │   │   ├── payments.ts             # CRUD de pagos/cuotas: createPayment, approvePayment,
│   │   │   │                           # rejectPayment, getPendingPayments
│   │   │   ├── blog.ts                 # CRUD del blog: createPost, getPostBySlug,
│   │   │   │                           # getAllPosts, updatePost, deletePost
│   │   │   ├── reviews.ts              # CRUD de reseñas: createReview, approveReview,
│   │   │   │                           # rejectReview, getPendingReviews, getApprovedReviews
│   │   │   ├── storage.ts              # Funciones para subir imágenes a Firebase Storage:
│   │   │   │                           # uploadProductImage, uploadVoucher, deleteImage
│   │   │   ├── shipping.ts             # CRUD de configuración de fletes por departamento
│   │   │   ├── insurance.ts            # Lógica de seguros de prórroga
│   │   │   └── audit.ts                # Escritura de logs de auditoría
│   │   │
│   │   ├── actions/                    # Server Actions de Next.js 15
│   │   │   ├── product.actions.ts      # Server Actions para operaciones de producto (admin)
│   │   │   ├── order.actions.ts        # Server Actions para crear y actualizar pedidos
│   │   │   ├── payment.actions.ts      # Server Actions para aprobar/rechazar pagos
│   │   │   ├── review.actions.ts       # Server Actions para aprobar/rechazar reseñas
│   │   │   └── notification.actions.ts # Server Actions para enviar notificaciones/alertas
│   │   │
│   │   ├── hooks/                      # Custom React Hooks del cliente
│   │   │   ├── useAuth.ts              # Hook para acceder al estado de autenticación
│   │   │   ├── useOrder.ts             # Hook para suscribirse en tiempo real al estado de un pedido
│   │   │   ├── useCountdown.ts         # Hook que calcula tiempo restante para una fecha
│   │   │   └── useAutoSave.ts          # Hook de auto-guardado para el editor del admin
│   │   │
│   │   ├── utils/
│   │   │   ├── currency.ts             # Formatear moneda: formatSoles(150.5) => "S/ 150.50"
│   │   │   ├── dates.ts                # Helpers de fechas: calcularFechaCuota, isOverdue, etc.
│   │   │   ├── seo.ts                  # Generar metadata de Next.js y schemas JSON-LD
│   │   │   ├── schema.ts               # Constructores de schemas: buildProductSchema,
│   │   │   │                           # buildBlogSchema, buildOrganizationSchema
│   │   │   └── penalties.ts            # Calcular penalidades: getPenaltyAmount(diasAtraso)
│   │   │
│   │   └── constants/
│   │       ├── iphone-models.ts        # Lista maestra de modelos de iPhone y sus specs base
│   │       ├── departments.ts          # Lista de 25 departamentos del Perú para fletes
│   │       ├── insurance-plans.ts      # Planes de seguro: precios y cobertura
│   │       └── penalty-tiers.ts        # Rangos de días y montos de penalidad
│   │
│   ├── types/                          # Definiciones TypeScript de todas las entidades
│   │   ├── product.ts                  # Tipo Product con todos sus campos (ver sección 3)
│   │   ├── order.ts                    # Tipo Order y sus estados posibles
│   │   ├── payment.ts                  # Tipo Payment/Cuota
│   │   ├── user.ts                     # Tipo User con rol y datos de perfil
│   │   ├── blog.ts                     # Tipo BlogPost
│   │   ├── review.ts                   # Tipo Review
│   │   ├── shipping.ts                 # Tipo ShippingRate
│   │   └── insurance.ts                # Tipo InsurancePlan y InsurancePurchase
│   │
│   └── context/                        # React Context Providers
│       └── AuthContext.tsx             # Provider global de autenticación
│                                       # Envuelve toda la app en layout.tsx.
│                                       # Expone: user, loading, signIn, signOut.
│                                       # Usa onAuthStateChanged de Firebase para
│                                       # mantener la sesión actualizada en tiempo real.
```

### 2.3 Relación Lógica Entre las Capas

Para que el desarrollador entienda cómo fluye la información a través del sistema, aquí se explica la relación entre las capas:

**Capa de Datos (Firebase / `src/lib/firebase/`):** Es el origen de toda la información. Firestore almacena los documentos (productos, pedidos, pagos, etc.) y Firebase Storage guarda las imágenes. Las funciones en `src/lib/firebase/` son las únicas que hablan directamente con Firebase.

**Capa de Acciones del Servidor (`src/lib/actions/`):** Son funciones que se ejecutan en el servidor de Next.js y que llaman a las funciones de Firebase. Cuando un admin aprueba un pago desde el cliente (navegador), el componente React llama a una Server Action, que a su vez llama a `approvePayment()` de `src/lib/firebase/payments.ts`. La ventaja es que las credenciales de Firebase Admin SDK nunca se exponen al navegador.

**Capa de Componentes (`src/components/`):** Son los bloques visuales de la UI. Los componentes de servidor (sin `"use client"`) pueden llamar directamente a las funciones de Firebase para leer datos. Los componentes de cliente (con `"use client"`) usan los hooks de `src/lib/hooks/` para suscribirse a datos en tiempo real.

**Capa de Rutas (`src/app/`):** Cada `page.tsx` es un Server Component por defecto. Lee los datos que necesita en el servidor, genera el HTML con esos datos, y lo envía al navegador. Luego, los Client Components dentro de esa página se hidratan para añadir interactividad.

### 2.4 El Archivo `middleware.ts`

Este archivo es crítico para la seguridad. Se ejecuta en el edge de Next.js antes de que cualquier request llegue a una página. Su función es sencilla pero vital:

Si alguien intenta acceder a cualquier ruta que empiece con `/admin` o `/dashboard` sin estar autenticado, el middleware los redirige inmediatamente a `/login?callbackUrl=/ruta/que/intentaban`. El parámetro `callbackUrl` es la clave para que después del login el usuario vuelva exactamente a donde estaba.

El middleware solo verifica si existe una cookie de sesión de Firebase (usando Firebase Admin SDK en el edge). No consulta el rol del usuario —eso se hace en el `layout.tsx` de cada área protegida, donde se puede hacer una consulta más completa a Firestore.

### 2.5 Archivos de Configuración Clave

**`next.config.ts`:** Aquí se configuran los dominios permitidos para el componente `<Image/>` de Next.js. Como las imágenes se guardan en Firebase Storage, el dominio `firebasestorage.googleapis.com` debe estar en la lista de `remotePatterns`. También se configuran los headers de seguridad HTTP (Content-Security-Policy, X-Frame-Options, etc.) y las redirecciones necesarias.

**`tailwind.config.ts`:** Extiende la configuración base de Tailwind con los colores, tipografías y tamaños del design system personalizado (ver Sección 4). Todas las variables de diseño del sistema Apple-inspired se definen aquí.

**`.env.local`:** Contiene todas las claves de Firebase (`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, etc.) y las claves del Firebase Admin SDK (solo para el servidor: `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`). Las variables con prefijo `NEXT_PUBLIC_` son accesibles desde el cliente. Las que no tienen ese prefijo son solo de servidor.

---

## 3. Firebase: Configuración y Estructura de Base de Datos

### 3.1 Servicios de Firebase a Utilizar

El stack es exclusivamente Next.js 15 y Firebase. Se usarán tres servicios de Firebase:

**Firebase Authentication** para el login con Google. Proporciona la identidad del usuario y su sesión.

**Cloud Firestore** como base de datos principal. Es una base de datos NoSQL orientada a documentos, organizada en colecciones. Se elige por su capacidad de suscripciones en tiempo real (onSnapshot), que permite actualizar la UI del cliente automáticamente cuando el admin aprueba un pago, sin que el cliente necesite recargar la página.

**Firebase Storage** para almacenar las imágenes de productos y los comprobantes de pago subidos por los clientes.

### 3.2 Estructura de Colecciones en Firestore

A continuación se detalla cada colección con todos sus campos, tipos de datos y su propósito:

#### Colección: `users`

Cada documento tiene como ID el UID que Firebase Authentication le asigna al usuario cuando se registra con Google.

```
users/{userId}
├── uid: string                     # Igual al ID del documento
├── email: string                   # Email de Google
├── displayName: string             # Nombre completo de Google
├── photoURL: string                # URL de la foto de perfil de Google
├── role: "customer" | "admin"      # Rol del usuario — CRÍTICO para seguridad
├── createdAt: Timestamp            # Fecha de registro
└── lastLoginAt: Timestamp          # Última vez que inició sesión
```

Cuando un usuario inicia sesión por primera vez, se crea su documento en esta colección con `role: "customer"`. El rol `admin` debe asignarse manualmente desde la consola de Firebase o a través de un script protegido.

#### Colección: `products`

Cada documento representa un modelo de iPhone publicado o en borrador. El ID del documento es generado automáticamente por Firestore.

```
products/{productId}
├── slug: string                    # URL única: "iphone-15-pro-max" — se usa en la ruta /iphone/[slug]
├── status: "published" | "draft" | "archived"
│
│   ── Información Básica ──
├── title: string                   # Ej: "iPhone 15 Pro Max 256GB"
├── model: string                   # Ej: "iPhone 15 Pro Max"
├── storage: string                 # "128GB" | "256GB" | "512GB" | "1TB"
├── color: string                   # Color principal del equipo
├── condition: "new" | "refurbished"
├── grade: "A+" | "A" | "B" | null # null si es nuevo
├── stock: number                   # Unidades disponibles
│
│   ── Imágenes ──
├── images: string[]                # Array de URLs (Firebase Storage o URLs externas)
├── thumbnailUrl: string            # Primera imagen, usada en cards y Open Graph
│
│   ── Precios y Cuotas ──
├── priceTotal: number              # Precio total del equipo en soles
├── installments: number            # Número de cuotas (ej: 12)
├── installmentAmount: number       # Monto por cuota (calculado: priceTotal * (1+interestRate) / installments)
├── interestRate: number            # Tasa de interés mensual en decimal (ej: 0.05 = 5%)
├── downPayment: number             # Cuota inicial o "enganche" en soles (puede ser 0)
│
│   ── Penalidades y Seguros ──
├── penaltyTier1Days: number        # Días de atraso para nivel 1 (ej: 5)
├── penaltyTier1Amount: number      # Penalidad nivel 1 en soles (ej: 59)
├── penaltyTier2Days: number        # Días de atraso para nivel 2 (ej: 10)
├── penaltyTier2Amount: number      # Penalidad nivel 2 en soles (ej: 79)
├── penaltyTier3Days: number        # Días de atraso para nivel 3 (ej: 15)
├── penaltyTier3Amount: number      # Penalidad nivel 3 en soles (ej: 99)
│
│   ── Seguros de Prórroga ──
├── insurancePlan1Month: number     # Precio seguro 1 mes en soles (ej: 49)
├── insurancePlan2Months: number    # Precio seguro 2 meses en soles (ej: 89)
├── insurancePlan3Months: number    # Precio seguro 3 meses en soles (ej: 99)
├── insuranceCheckoutDiscount1Month: number  # Precio especial en checkout (ej: 29)
│
│   ── Pagos ──
├── yapeNumber: string              # Número de Yape/Plin del negocio
├── transferAccountHolder: string   # Nombre del titular de cuenta
├── transferBank: string            # Banco (ej: "BCP", "Interbank")
├── transferAccountNumber: string   # Número de cuenta
├── transferCci: string             # Código CCI
├── onlinePaymentLink: string       # URL del link de pago externo (ej: Mercado Pago, PayU)
│
│   ── Especificaciones Técnicas (para la página del producto) ──
├── specs: {
│   ├── display: string             # Ej: "Super Retina XDR, 6.7 pulgadas"
│   ├── chip: string                # Ej: "Apple A17 Pro"
│   ├── camera: string              # Ej: "Sistema de tres cámaras de 48 MP"
│   ├── battery: string             # Ej: "Hasta 29 horas de reproducción de video"
│   ├── connectivity: string        # "5G, Wi-Fi 6E, Bluetooth 5.3"
│   └── os: string                  # "iOS 17"
│ }
│
│   ── SEO (campos controlados por el admin) ──
├── seo: {
│   ├── metaTitle: string           # Ej: "Comprar iPhone 15 Pro Max en Cuotas | iphoneencuotas.com"
│   ├── metaDescription: string     # Ej: "Compra tu iPhone 15 Pro Max en 12 cuotas..."
│   ├── h1: string                  # Ej: "Comprar iPhone 15 Pro Max en Cuotas Sin Tarjeta"
│   ├── canonicalUrl: string        # URL canónica completa
│   ├── ogTitle: string             # Título para Open Graph (Facebook, WhatsApp)
│   ├── ogDescription: string       # Descripción para Open Graph
│   ├── ogImage: string             # URL de imagen Open Graph (1200x630px)
│   ├── twitterTitle: string
│   ├── twitterDescription: string
│   └── schemaOverride: string | null  # JSON-LD personalizado (si el admin quiere sobreescribir el auto-generado)
│ }
│
│   ── Contenido de la Página ──
├── pageContent: {
│   ├── heroHeadline: string        # Texto principal del hero
│   ├── heroSubheadline: string     # Subtexto del hero
│   ├── howItWorks: string          # HTML del bloque "¿Cómo funciona?"
│   └── faqItems: {question: string, answer: string}[]
│ }
│
│   ── Estadísticas ──
├── averageRating: number           # Promedio de reseñas aprobadas (0-5)
├── reviewCount: number             # Total de reseñas aprobadas
│
│   ── Metadatos ──
├── createdAt: Timestamp
├── updatedAt: Timestamp
└── publishedAt: Timestamp | null
```

#### Colección: `orders`

Cada documento representa un pedido completo de un cliente.

```
orders/{orderId}
├── userId: string                  # UID del cliente (referencia a users/{userId})
├── productId: string               # ID del producto (referencia a products/{productId})
├── productSlug: string             # Slug del producto (para consultas rápidas)
├── productTitle: string            # Título del producto al momento de la compra
├── productThumbnail: string        # Imagen del producto al momento de la compra
│
│   ── Datos del Cliente ──
├── customerName: string            # Nombre completo ingresado por el cliente
├── customerDni: string             # DNI del cliente
├── customerEmail: string           # Email del cliente
├── customerPhone: string           # Teléfono de contacto
│
│   ── Dirección de Envío ──
├── shippingAddress: {
│   ├── department: string          # Departamento seleccionado
│   ├── province: string            # Provincia
│   ├── district: string            # Distrito
│   └── address: string             # Dirección detallada (calle, número, referencia)
│ }
├── shippingCost: number            # Costo de envío calculado según el departamento
│
│   ── Configuración Financiera del Pedido ──
├── priceTotal: number              # Precio total del equipo al momento de la compra
├── installments: number            # Número de cuotas acordadas
├── installmentAmount: number       # Monto por cuota
├── downPayment: number             # Cuota inicial pagada
│
│   ── Estado del Pedido ──
├── status: 
│   "pending_first_payment" |       # Esperando primer pago (reserva de 24h)
│   "payment_rejected_first" |      # Primer pago rechazado — proceso cancelado
│   "active" |                      # Primer pago aprobado, proceso en curso
│   "completed" |                   # Todas las cuotas pagadas
│   "delivering" |                  # En proceso de entrega
│   "delivered" |                   # Entregado por el admin
│   "cancelled" |                   # Cancelado (no pago en 24h o cuota cancelada)
│   "defaulted"                     # Cayó en penalidad máxima — perdió el equipo
│
│   ── Seguro de Prórroga ──
├── insurance: {
│   ├── hasPurchased: boolean
│   ├── plan: 1 | 2 | 3 | null      # Meses cubiertos
│   ├── monthsCovered: number        # Cuotas que puede prorrogar
│   ├── monthsUsed: number           # Cuotas ya prorrogadas
│   ├── purchasedAt: Timestamp | null
│   └── purchasedAtCheckout: boolean # true si lo compró al inicio
│ }
│
│   ── Envío ──
├── delivery: {
│   ├── status: "not_started" | "preparing" | "in_transit" | "delivered"
│   ├── estimatedDate: Timestamp | null
│   └── deliveredAt: Timestamp | null
│ }
│
│   ── Metadatos ──
├── paymentMethod: "online" | "offline"
├── reservedUntil: Timestamp        # Para pedidos en "pending_first_payment": caduca en 24h
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

#### Colección: `payments`

Cada documento representa el pago de una cuota específica.

```
payments/{paymentId}
├── orderId: string                 # Referencia al pedido
├── userId: string                  # Referencia al cliente
├── installmentNumber: number       # Número de cuota (1, 2, 3... N)
├── amount: number                  # Monto esperado en soles
├── dueDate: Timestamp              # Fecha límite de pago
│
│   ── Comprobante ──
├── voucherUrl: string | null       # URL del comprobante subido
├── voucherUploadedAt: Timestamp | null
├── voucherUploadedBy: "customer" | "admin"
│
│   ── Estado del Pago ──
├── status:
│   "locked" |                      # Cuota futura, aún no habilitada
│   "open" |                        # Habilitada, esperando pago
│   "pending_approval" |            # Comprobante subido, esperando aprobación del admin
│   "approved" |                    # Aprobado por el admin
│   "rejected" |                    # Rechazado — comprobante inválido
│   "overdue" |                     # Venció sin pago
│   "penalized" |                   # Se aplicó penalidad
│   "insured"                       # Cubierta por seguro de prórroga
│
│   ── Penalidades ──
├── penaltyApplied: boolean
├── penaltyAmount: number | null
├── penaltyAppliedAt: Timestamp | null
│
│   ── Rechazo de Pago ──
├── rejectionReason: string | null  # Motivo del rechazo (escrito por el admin)
├── rejectedAt: Timestamp | null
├── resubmitDeadline: Timestamp | null  # 24h desde el rechazo para volver a subir
│
│   ── Aprobación ──
├── approvedBy: string | null       # UID del admin que aprobó
├── approvedAt: Timestamp | null
│
└── createdAt: Timestamp
```

#### Colección: `reviews`

```
reviews/{reviewId}
├── productId: string
├── orderId: string                 # Solo pueden reseñar quienes tienen pedido "delivered"
├── userId: string
├── userName: string                # Nombre del cliente
├── userPhoto: string               # Foto de perfil (de Google)
├── rating: number                  # 1 a 5 estrellas
├── title: string                   # Título de la reseña
├── body: string                    # Texto de la reseña
├── status: "pending" | "approved" | "rejected" | "featured"
├── isSeeded: boolean               # true si fue cargada por el admin como reseña inicial
├── createdAt: Timestamp
└── approvedAt: Timestamp | null
```

#### Colección: `blog_posts`

```
blog_posts/{postId}
├── title: string
├── slug: string                    # URL única: "como-comprar-iphone-sin-tarjeta"
├── content: string                 # HTML generado por el editor WYSIWYG
├── excerpt: string                 # Resumen corto (para cards del listado)
├── featuredImage: string           # URL de la imagen destacada
├── category: string                # Ej: "Guías", "Comparativas", "Novedades"
├── relatedProductSlug: string | null  # Slug del iPhone que se promociona en el post
├── status: "draft" | "published"
├── author: string                  # Nombre del autor (el admin)
├── seo: {
│   ├── metaTitle: string
│   ├── metaDescription: string
│   ├── ogImage: string
│   └── canonicalUrl: string
│ }
├── createdAt: Timestamp
└── publishedAt: Timestamp | null
```

#### Colección: `shipping_rates`

Un solo documento con ID fijo `"peru_rates"` que contiene las tarifas de todos los departamentos.

```
shipping_rates/peru_rates
└── rates: {
    "Lima": 0,
    "Callao": 5,
    "Ica": 15,
    "Arequipa": 30,
    "Cusco": 35,
    ... (todos los 25 departamentos del Perú)
  }
```

#### Colección: `abandoned_carts`

```
abandoned_carts/{cartId}
├── userId: string
├── userEmail: string
├── userName: string
├── productId: string
├── productTitle: string
├── productSlug: string
├── productThumbnail: string
├── abandonedAt: Timestamp          # Cuando se detectó el abandono (30 min después del logout)
├── notificationSentAt: Timestamp | null
└── isConverted: boolean            # true si eventualmente compró
```

#### Colección: `audit_logs`

```
audit_logs/{logId}
├── adminId: string                 # UID del admin que realizó la acción
├── adminEmail: string
├── action: string                  # Ej: "APPROVE_PAYMENT", "REJECT_PAYMENT", "PUBLISH_PRODUCT"
├── targetId: string                # ID del documento afectado
├── targetType: "payment" | "order" | "product" | "review"
├── details: object                 # Información adicional de contexto
└── timestamp: Timestamp
```

---

## 4. Sistema de Diseño y UI/UX — Estilo Apple

### 4.1 Filosofía de Diseño

El sistema de diseño de iPhone en Cuotas está basado en los principios visuales que Apple utiliza en su sitio oficial y en iOS. Esta elección no es arbitraria: el visitante ya tiene una asociación mental entre el estilo visual de Apple y la calidad, confianza y premium. Al replicar estos principios visuales, el negocio se beneficia de esa asociación instantáneamente.

Los cuatro pilares del diseño Apple que debemos capturar son:

**Espacio en blanco generoso.** Apple nunca satura sus páginas. El espacio vacío entre elementos es intencional y hace que cada elemento tenga peso visual propio. En la práctica, esto significa padding generoso en las secciones (mínimo `py-20` en desktop), márgenes amplios alrededor del contenido, y nunca colocar dos elementos de call-to-action compitiendo visualmente el uno con el otro.

**Tipografía como jerarquía.** Los títulos son grandes, pesados y cortos. El cuerpo del texto es liviano, bien espaciado y fácil de escanear. La jerarquía visual está tan clara que el ojo del usuario puede "leer" la página en 3 segundos sin procesar todo el texto.

**Fotografía de producto como protagonista.** En Apple.com, el iPhone ocupa la pantalla completa. Nosotros haremos lo mismo: la imagen del iPhone es el héroe de cada página de producto. Fondo blanco o gris ultra claro. Sombras muy sutiles. Sin marcos ni bordes artificiales.

**Interacciones sutiles y significativas.** Los elementos de Apple responden al cursor/toque de forma elegante: transiciones suaves, sin rebotes exagerados. Cada micro-interacción tiene un propósito funcional, no es decorativa.

### 4.2 Paleta de Colores

Los colores del sistema están definidos como variables CSS en `globals.css` y extendidos en `tailwind.config.ts`:

```css
:root {
  /* Backgrounds */
  --color-bg-primary: #FFFFFF;       /* Blanco puro — fondo principal */
  --color-bg-secondary: #F5F5F7;     /* Gris Apple — fondo de secciones alternadas */
  --color-bg-dark: #1D1D1F;          /* Casi negro Apple — footer, secciones oscuras */
  --color-bg-card: #FFFFFF;          /* Fondo de tarjetas */

  /* Textos */
  --color-text-primary: #1D1D1F;     /* Negro Apple — títulos principales */
  --color-text-secondary: #6E6E73;   /* Gris medio — texto de apoyo */
  --color-text-tertiary: #AEAEB2;    /* Gris claro — placeholders, metadata */
  --color-text-inverted: #FFFFFF;    /* Texto sobre fondos oscuros */

  /* Accents */
  --color-accent: #0071E3;           /* Azul Apple — botones primarios, links activos */
  --color-accent-hover: #0077ED;     /* Azul ligeramente más brillante para hover */
  --color-accent-dark: #0051A2;      /* Azul oscuro para estados pressed */

  /* Semánticos */
  --color-success: #34C759;          /* Verde Apple — aprobado, pagado */
  --color-warning: #FF9F0A;          /* Naranja Apple — próximo a vencer */
  --color-danger: #FF3B30;           /* Rojo Apple — vencido, error, penalidad */
  --color-info: #5AC8FA;             /* Azul claro — informativo */

  /* Bordes y Divisores */
  --color-border: #D2D2D7;           /* Gris muy sutil — bordes de cards */
  --color-border-strong: #AEAEB2;    /* Gris más visible — separadores */

  /* Glassmorphism (para el Navbar flotante) */
  --color-glass-bg: rgba(255, 255, 255, 0.72);
  --color-glass-border: rgba(255, 255, 255, 0.2);
  --glass-blur: blur(20px);          /* Desenfoque característico de macOS */
}
```

### 4.3 Tipografía

Se usará la fuente **Inter** (desde Google Fonts o self-hosted) como fuente principal del sistema. Inter fue diseñada específicamente para interfaces de usuario y legibilidad en pantalla, y es visualmente muy similar a SF Pro (la fuente oficial de Apple) en la mayoría de dispositivos.

La escala tipográfica es la siguiente:

El **Display** (títulos de hero como "Tu iPhone 15 en cuotas, hoy") usa `font-size: clamp(40px, 6vw, 72px)` con `font-weight: 700`, `letter-spacing: -0.03em` (tracking negativo, característica Apple) y `line-height: 1.05`.

Los **títulos de sección** (H2) usan `font-size: clamp(28px, 4vw, 48px)` con `font-weight: 600` y `letter-spacing: -0.02em`.

Los **subtítulos** (H3) usan `font-size: 24px` con `font-weight: 500`.

El **cuerpo de texto** usa `font-size: 17px` (mismo que usa Apple en su web) con `font-weight: 400` y `line-height: 1.6`.

Los **labels y etiquetas** usan `font-size: 14px` con `font-weight: 500` y en versalitas cuando aplique.

### 4.4 Bordes, Sombras y Radios

Las tarjetas de producto usan `border-radius: 18px` (mismo radio que los íconos de iOS). El radio base para elementos más pequeños como badges e inputs es `border-radius: 10px`. Los botones pilares usan `border-radius: 980px` (completamente redondeados, como los botones de Apple.com).

Las sombras siguen un sistema de capas:

`shadow-sm` para tarjetas en reposo: `0 2px 8px rgba(0,0,0,0.08)`. Esta sombra es casi imperceptible pero da profundidad.

`shadow-md` para elementos destacados: `0 4px 24px rgba(0,0,0,0.12)`. Usada en modales y el sticky bar.

`shadow-lg` para elementos flotantes: `0 8px 40px rgba(0,0,0,0.16)`. Usada en el Navbar con glassmorphism cuando hay scroll.

### 4.5 El Efecto Glassmorphism

El Navbar flotante y algunos modales utilizan el efecto Glassmorphism que Apple popularizó en macOS Big Sur:

```css
.glass {
  background: var(--color-glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--color-glass-border);
}
```

Este efecto solo se aplica cuando hay contenido detrás del elemento (cuando el usuario ha hecho scroll). Cuando la página está en la parte superior, el navbar es completamente transparente.

### 4.6 Componente `<Image/>` y Presentación de Fotos del iPhone

Todas las imágenes del sistema deben usar el componente `<Image/>` de Next.js. Este componente, cuando se configura correctamente, sirve automáticamente imágenes en formato WebP o AVIF (los formatos más eficientes), las redimensiona al tamaño exacto que se necesita, y aplica lazy loading por defecto.

Los iPhones se mostrarán siempre sobre fondo blanco o `#F5F5F7`, sin sombras adicionales. La imagen principal del hero de cada página de producto debe ser large, de alta resolución, y ocupar como mínimo el 50% del viewport en desktop. En móvil, ocupa el 100% del ancho.

Para lograr las fotos de producto al estilo Apple (sin distractores, enfoque total en el dispositivo), el admin debe subir imágenes con fondo blanco o transparente. El sistema acepta JPG, PNG y WebP. Firebase Storage recibe el archivo original, y Next.js `<Image/>` lo optimiza en la entrega.

---

## 5. Navegación: Navbar Adaptativo y Bottom Tab Bar

### 5.1 Comportamiento General

La navegación del sitio se adapta completamente al dispositivo del usuario. La lógica de cuándo mostrar qué componente se gestiona a través de Tailwind CSS con sus breakpoints: por debajo de `md` (768px) se muestra el Bottom Tab Bar, desde `md` hacia arriba se muestra el Navbar tradicional.

### 5.2 Navbar de Desktop/Tablet

El Navbar de escritorio es un componente `<nav>` que está fijo en la parte superior de la pantalla (`position: fixed; top: 0; width: 100%; z-index: 50`). Tiene tres estados visuales según el scroll:

**Estado transparente (scroll en 0):** El fondo es completamente transparente. El logo y los links son de color oscuro si el hero es claro, o blanco si el hero es oscuro. Esto da la sensación de que el contenido "fluye" bajo la barra de navegación.

**Estado glassmorphism (scroll > 50px):** La barra adquiere el efecto de cristal translúcido con backdrop-filter. La transición entre el estado transparente y este estado es suave y dura 300ms con `ease-out`. Aparece también una sutil línea de borde inferior (`1px solid rgba(0,0,0,0.08)`) que separa visualmente el navbar del contenido.

El Navbar contiene, de izquierda a derecha: el Logo ("iPhone en Cuotas"), un menú de navegación con links a los modelos más populares (desplegable hover), el link al Blog, y a la derecha el elemento central del usuario.

**El elemento central de usuario** cambia dinámicamente según el estado de autenticación:
- **Si no está logueado:** Se muestra un botón con texto "Ingresar" en estilo ghost (sin relleno, solo borde azul) que lleva a `/login`.
- **Si está logueado:** Se muestra un círculo de 36px de diámetro con la foto de perfil de Google del usuario, o su inicial en caso de que no haya foto. Este círculo tiene un borde de 2px en color `--color-accent` para destacarlo. Al hacer clic, abre un dropdown con opciones: "Mi Pedido" (lleva al dashboard), "Cerrar sesión".

### 5.3 Bottom Tab Bar para Móviles

En dispositivos móviles, el Bottom Tab Bar reemplaza completamente al Navbar. Se trata de una barra fija en la parte inferior de la pantalla (`position: fixed; bottom: 0`), construida con glassmorphism y con altura de `64px` más el `safe-area-inset-bottom` para respetar el notch de iPhone.

La barra tiene 4 o 5 tabs distribuidos uniformemente:
- **Inicio** (ícono de casa) — lleva a `/`
- **iPhones** (ícono de dispositivo móvil) — abre un sheet deslizable desde abajo con la lista de modelos disponibles
- **Perfil / Ingresar** (ícono de persona) — Si logueado, muestra la foto del usuario y lleva al dashboard. Si no logueado, abre el flujo de login.
- **Blog** (ícono de artículo/leer) — lleva a `/blog`

El tab activo se muestra con el ícono en color `--color-accent` y una etiqueta de texto debajo del ícono. Los tabs inactivos usan el color gris `--color-text-secondary`.

---

## 6. Autenticación con Google

### 6.1 Configuración Firebase Auth + Next.js 15

La autenticación usa **Firebase Authentication** con el proveedor de Google. El flujo es el estándar OAuth 2.0 donde el usuario es redirigido a los servidores de Google para autenticarse, y Google lo devuelve con un token que Firebase valida.

En Next.js 15, la sesión del usuario se mantiene a través de una cookie HTTPOnly que el servidor establece. Esto es más seguro que guardar el token en localStorage y permite que los Server Components sepan si el usuario está autenticado.

El `AuthContext.tsx` es un Context Provider de React que se coloca en el `layout.tsx` raíz, envolviendo toda la aplicación. Internamente, usa `onAuthStateChanged` de Firebase para escuchar cambios en el estado de autenticación. Cuando Firebase confirma que hay un usuario activo, el contexto:
1. Actualiza el estado `user` con los datos del usuario
2. Consulta Firestore en `users/{userId}` para obtener el rol del usuario
3. Si es la primera vez que este usuario entra (no existe el documento), crea el documento con `role: "customer"`
4. Si ya existe, actualiza el campo `lastLoginAt`

### 6.2 Flujo de Login con Redirect a Página de Origen

Este es uno de los flujos más importantes del sistema y debe implementarse correctamente. Cuando un usuario no autenticado intenta hacer clic en el botón "Reservar" de cualquier página de producto, el sistema debe llevarlo a login y, después de completarlo, devolverlo exactamente a esa página.

Así es el flujo paso a paso:

El usuario está en `/iphone/iphone-15-pro-max` y hace clic en "Reservar". El componente `ReserveButton.tsx` verifica a través del hook `useAuth()` si el usuario tiene sesión. Como no la tiene, en lugar de navegar al flujo de reserva, usa `router.push('/login?callbackUrl=/iphone/iphone-15-pro-max')` para llevarlo a la página de login, incluyendo la URL actual como parámetro.

La página `/login/page.tsx` lee el parámetro `callbackUrl` de los `searchParams` y lo guarda en el estado local. Muestra el botón "Continuar con Google". Cuando el usuario hace clic, se inicia el flujo OAuth de Firebase con `signInWithPopup()` o `signInWithRedirect()`. Se recomienda usar `signInWithRedirect()` en móviles para mejor compatibilidad con navegadores que bloquean popups.

Una vez que Firebase completa el login y el `onAuthStateChanged` detecta al usuario, el `AuthContext` actualiza el estado. La página de login detecta este cambio y usa `router.push(callbackUrl)` para llevar al usuario de vuelta a `/iphone/iphone-15-pro-max`.

El usuario ahora está en la página del producto, autenticado, y el botón "Reservar" está disponible para él.

### 6.3 Protección de Rutas con Middleware

El `middleware.ts` intercepta TODAS las peticiones al servidor. Para rutas que empiezan con `/admin` o `/dashboard`, verifica que exista una cookie de sesión válida de Firebase. Si no existe, redirige a `/login?callbackUrl=[ruta solicitada]`. La verificación de la cookie se hace con el **Firebase Admin SDK** (no el SDK de cliente), que puede correr en el entorno edge de Next.js de forma segura.

El layout de `/admin` hace una verificación adicional consultando Firestore para confirmar que el usuario tiene `role: "admin"`. Si tiene sesión pero no tiene rol de admin, redirige a `/dashboard`. Esto previene que un cliente normal intente acceder al panel de administración aunque tenga sesión activa.

---

## 7. Páginas Públicas: Home y Páginas de Producto

### 7.1 La Página Home (`/`)

La Home es un **Server Component** que carga los productos publicados desde Firestore en el servidor. La Home tiene un propósito SEO muy específico: posicionarse para búsquedas genéricas como "iphone en cuotas Perú" o "comprar iphone a plazos sin tarjeta". No intenta posicionarse para un modelo específico —eso lo hacen las páginas individuales de producto.

La estructura de la Home sigue la siguiente secuencia visual y narrativa:

**Sección Hero.** Ocupa el 100% de la altura del viewport (`min-h-screen`). En el lado derecho (o superior en móvil), una imagen de alta calidad de un iPhone 15 Pro Max rotando suavemente (CSS animation, sin JS pesado). En el lado izquierdo: el H1 de la página que es el argumento principal de venta, por ejemplo: "Tu iPhone en cuotas. Sin banco. Sin tarjeta. Sin esperas." Debajo del H1, un subtexto que establece la propuesta de valor: "Elige tu modelo, paga en cómodas cuotas con Yape o transferencia, y recíbelo en casa. Así de simple." Luego, dos CTAs: el primario "Ver modelos disponibles" en azul Apple, y el secundario "¿Cómo funciona?" en ghost.

**Sección "Modelos Disponibles".** Una grid de tarjetas de productos publicados. En desktop, 3 columnas; en tablet, 2; en móvil, 1. Cada tarjeta muestra: la foto del iPhone, el nombre del modelo, el precio desde "X cuotas de S/ XX", un badge de condición (Nuevo / Reacondicionado / Grado A+), y un botón "Ver y Reservar" en azul que lleva a la página individual del modelo.

**Sección "¿Cómo Funciona?".** Una explicación visual del proceso en 4 pasos, con íconos y texto. Esta sección responde las objeciones más comunes antes de que el usuario las formule.

**Sección "Por Qué Confiarnos".** Tres o cuatro pilares de confianza: equipos verificados, pagos protegidos, seguimiento en tiempo real, y soporte directo por WhatsApp.

**Sección "Testimonios".** Las últimas 3 reseñas con 5 estrellas aprobadas por el admin, rotadas automáticamente. Incluye el nombre del cliente, su foto de Google, el modelo que compró y su texto.

**Footer.** Logo, links de navegación, medios de pago aceptados (íconos de Yape, Visa, Mastercard), datos de contacto y el copyright.

### 7.2 Páginas de Producto (`/iphone/[slug]`)

Esta es la página más importante del sitio para el negocio y para el SEO. Existe una página independiente por cada modelo y variante publicada por el admin. Cada página está diseñada para posicionarse en Google para un término de búsqueda muy específico, y para convertir visitantes en compradores.

La página es un **Server Component** que usa la función `generateMetadata()` de Next.js para inyectar los meta tags de forma dinámica. Cuando Googlebot visita `/iphone/iphone-15-pro-max`, Next.js llama a `generateMetadata()` antes de renderizar la página, obtiene los datos SEO del producto desde Firestore, y los incluye en el `<head>` del HTML que se envía al crawler. Esto garantiza que Google indexe el título, la descripción y los tags Open Graph correctos para cada página.

La estructura visual de la página de producto es la siguiente:

**Hero del Producto.** En desktop, es una sección dividida en dos columnas iguales. La columna izquierda contiene una galería de fotos del iPhone con miniaturas desplazables. La columna derecha contiene el H1 (definido por el admin en los campos SEO), el modelo con sus características destacadas (almacenamiento, color, condición), el precio total destacado en grande, el desglose de cuotas ("12 cuotas de S/ 185", "o el total de S/ 2,100"), el botón "Reservar Ahora" —el CTA principal— y debajo de este, las formas de pago aceptadas (logos de Yape, Plin, Visa/Mastercard).

**Sticky Buy Bar.** Mientras el usuario hace scroll hacia abajo leyendo las especificaciones, una barra aparece pegada en la parte inferior de la pantalla (en móvil) o en la parte superior debajo del navbar (en desktop). Esta barra muestra solo lo esencial: el nombre del modelo, el precio por cuota, y el botón "Reservar". La barra tiene el efecto glassmorphism para no tapar el contenido. Desaparece cuando el usuario está en la sección del hero (porque el CTA ya es visible), y aparece cuando el usuario ha bajado más de 600px.

**Sección de Especificaciones Técnicas (H2: "Características Técnicas").** Una presentación al estilo Apple de las especificaciones, dividida en subsecciones con H3: Pantalla y Diseño, Chip y Rendimiento, Sistema de Cámara, Batería, Conectividad. Cada subsección usa íconos relevantes y el texto extraído del campo `specs` del producto. El objetivo es que esta sección sea tan completa y bien estructurada que Google la use como contenido de autoridad sobre ese modelo de iPhone.

**Sección "¿Cómo funciona el pago?" (H2).** Una explicación de 3 pasos: Reserva y elige cómo pagar, Sube tu comprobante o paga con tarjeta, Recibe tu iPhone. Cada paso incluye una ilustración o ícono y una descripción breve. Esta sección responde la pregunta más frecuente del usuario y reduce la fricción.

**Sección de Reseñas (H2: "Lo que dicen nuestros clientes").** Muestra las reseñas aprobadas para este modelo específico. Incluye el rating promedio con las 5 estrellas, el número total de reseñas, y las reseñas individuales con foto, nombre, rating y texto. Al final de esta sección está el botón "Escribir Opinión" (habilitado/deshabilitado según el estado del pedido del usuario).

**Sección FAQ (H2: "Preguntas Frecuentes").** Un acordeón con las preguntas y respuestas más frecuentes, definidas por el admin para cada producto. Por ejemplo: "¿Qué pasa si me atraso en una cuota?", "¿Puedo adelantar pagos?", "¿El equipo tiene garantía?". Esta sección es vital para el SEO porque captura búsquedas de cola larga y puede aparecer como Featured Snippet en Google.

### 7.3 Estructura Semántica HTML5 Obligatoria

La estructura HTML de cada página de producto debe seguir estrictamente la jerarquía semántica para SEO:

Hay exactamente **un H1 por página**, que es el título principal enfocado en la intención de búsqueda comercial. Este es el campo `seo.h1` que el admin define. Ejemplo: "Comprar iPhone 15 Pro Max en Cuotas Sin Tarjeta – iPhone en Cuotas".

Los **H2** son los títulos de las secciones principales: "Características Técnicas", "¿Cómo funciona el pago en cuotas?", "Lo que dicen nuestros clientes", "Preguntas Frecuentes".

Los **H3** son subsecciones dentro de cada sección. Dentro de Características Técnicas: "Pantalla y Diseño", "Chip y Rendimiento", etc. Dentro de FAQ: cada pregunta es un H3.

Ningún elemento decorativo usa etiquetas de encabezado (no pongas un `<h4>` porque visualmente queda bien — usa `<p>` con clases de Tailwind para el estilo). Las etiquetas de encabezado son para la jerarquía de información, no para el estilo visual.

Todas las imágenes del iPhone deben tener atributos `alt` descriptivos. El alt de la imagen principal debe incluir el modelo, el color y el ángulo: por ejemplo, `alt="iPhone 15 Pro Max color Titanio Natural, vista frontal"`. El componente `<Image/>` de Next.js acepta el atributo `alt` directamente.

---

## 8. SEO Técnico: Schema JSON-LD, Meta Tags y Sitemap Dinámico

### 8.1 La Función `generateMetadata()` de Next.js 15

En el App Router de Next.js 15, la forma correcta de gestionar los meta tags de forma dinámica es a través de la función `generateMetadata()` exportada desde cada `page.tsx`. Esta función es asíncrona, se ejecuta en el servidor, puede consultar la base de datos, y retorna un objeto `Metadata` que Next.js convierte automáticamente en las etiquetas `<meta>` del `<head>`.

Para la página de producto (`/iphone/[slug]/page.tsx`), `generateMetadata()` recibe el `slug` del producto, consulta Firestore para obtener los campos SEO del producto, y retorna:

```typescript
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Producto no encontrado' };

  return {
    title: product.seo.metaTitle,
    description: product.seo.metaDescription,
    alternates: {
      canonical: product.seo.canonicalUrl,
    },
    openGraph: {
      title: product.seo.ogTitle,
      description: product.seo.ogDescription,
      images: [{ url: product.seo.ogImage, width: 1200, height: 630 }],
      type: 'website',
      locale: 'es_PE',
      siteName: 'iPhone en Cuotas',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.seo.twitterTitle,
      description: product.seo.twitterDescription,
      images: [product.seo.ogImage],
    },
  };
}
```

### 8.2 Schema JSON-LD de Producto

El Schema JSON-LD es el código que le dice a Google exactamente qué tipo de contenido es esta página y qué datos contiene. Para las páginas de producto, se usa el tipo `Product` de schema.org.

El schema se inyecta en el `<head>` usando el componente `JsonLd.tsx`:

```typescript
// src/components/seo/JsonLd.tsx
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

Y se usa dentro de cada `page.tsx` de producto:

```typescript
// Dentro de /iphone/[slug]/page.tsx (Server Component)
const productSchema = buildProductSchema(product);
return (
  <>
    <JsonLd data={productSchema} />
    {/* ... resto del contenido */}
  </>
);
```

La función `buildProductSchema()` en `src/lib/utils/schema.ts` construye el objeto completo:

```javascript
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "iPhone 15 Pro Max 256GB",
  "image": ["https://firebasestorage.../foto1.jpg", "...foto2.jpg"],
  "description": "Compra el iPhone 15 Pro Max en 12 cómodas cuotas...",
  "brand": {
    "@type": "Brand",
    "name": "Apple"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://iphoneencuotas.com/iphone/iphone-15-pro-max",
    "priceCurrency": "PEN",
    "price": "2100.00",
    "priceValidUntil": "2025-12-31",
    "availability": "https://schema.org/InStock",  // O OutOfStock si stock es 0
    "seller": {
      "@type": "Organization",
      "name": "iPhone en Cuotas"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",     // Del campo product.averageRating
    "reviewCount": "23"        // Del campo product.reviewCount
  },
  "review": [
    // Últimas 3 reseñas aprobadas
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "name": "Excelente, llegó perfecto",
      "author": {
        "@type": "Person",
        "name": "María García"
      },
      "datePublished": "2025-06-15"
    }
  ]
}
```

Este schema hace que Google muestre las **5 estrellas amarillas**, el **precio en soles** y el texto **"En stock"** directamente en los resultados de búsqueda, lo que aumenta significativamente el CTR (tasa de clics).

### 8.3 Vista Previa SEO en el Dashboard del Admin

Dentro del formulario de edición de producto en el dashboard del admin, hay una sección "SEO y Visibilidad" que incluye:

**Vista Previa de Resultados de Google:** Un componente `GooglePreview.tsx` que muestra en tiempo real (conforme el admin escribe) cómo se verá el resultado en la página de búsqueda de Google. Muestra la URL en verde, el meta title en azul clickeable, y la meta description en gris. Incluye advertencias visuales si el meta title supera los 60 caracteres o la description supera los 160 caracteres (los límites que Google muestra).

**Vista Previa de Redes Sociales:** Un componente `SocialPreview.tsx` que muestra cómo se verá cuando alguien comparte el link en Facebook o WhatsApp. Muestra la imagen Open Graph, el ogTitle y la ogDescription dentro de una tarjeta simulada.

**Vista Previa del Schema JSON-LD:** Un componente `SchemaPreview.tsx` que muestra el JSON-LD que se generará automáticamente basado en los datos del producto, formateado con colores (como un editor de código). Si el admin quiere sobrescribir el schema auto-generado, puede pegar su propio JSON en el campo `schemaOverride`.

### 8.4 Sitemap Dinámico (`/sitemap.ts`)

Next.js 15 soporta la generación de `sitemap.xml` a través de un archivo especial `src/app/sitemap.ts`. Este archivo exporta una función que retorna un array de objetos con las URLs del sitio.

```typescript
// src/app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. URLs estáticas siempre presentes
  const staticUrls = [
    { url: 'https://iphoneencuotas.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://iphoneencuotas.com/blog', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  // 2. URLs de productos publicados (consulta Firestore)
  const products = await getAllPublishedProducts();
  const productUrls = products.map(p => ({
    url: `https://iphoneencuotas.com/iphone/${p.slug}`,
    lastModified: p.updatedAt.toDate(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 3. URLs de posts publicados del blog
  const posts = await getAllPublishedPosts();
  const blogUrls = posts.map(p => ({
    url: `https://iphoneencuotas.com/blog/${p.slug}`,
    lastModified: p.publishedAt.toDate(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticUrls, ...productUrls, ...blogUrls];
}
```

El sitemap se regenera automáticamente con cada deploy y, para producción, se configura Incremental Static Regeneration (ISR) con `export const revalidate = 3600` (1 hora) para que se actualice sin necesidad de rebuild cuando el admin publica un nuevo producto.

### 8.5 Robots.txt Dinámico (`/robots.ts`)

```typescript
// src/app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/'],
      },
    ],
    sitemap: 'https://iphoneencuotas.com/sitemap.xml',
  };
}
```

---

## 9. Flujo Completo de Compra: Reserva, Pagos y Cuotas

### 9.1 Paso 1: El Usuario Hace Clic en "Reservar"

Cuando el usuario, ya autenticado, hace clic en el botón "Reservar" en la página del producto, se abre el `PaymentModal.tsx`. Este modal tiene el diseño de un sheet deslizable desde abajo en móviles y un modal centrado en desktop.

El modal muestra:
- Imagen del producto y nombre
- El precio total y el desglose de cuotas
- La opción del seguro de prórroga en el checkout (el "Comodín Preventivo") — esta es la primera oportunidad de venta del seguro. Aparece como una tarjeta con el texto: "Protege tu plan. Agrega 1 mes de prórroga por solo S/ [precio_especial_checkout]. Si lo necesitas después, costará S/ [precio_normal]." Tiene un checkbox para seleccionarlo, y el precio se añade al total inmediatamente (actualización reactiva en tiempo real del monto a pagar hoy).
- Debajo del seguro, las dos opciones de método de pago, presentadas como dos tarjetas seleccionables: "Pagar con Tarjeta (Online)" y "Pagar con Yape / Transferencia".
- Una casilla de verificación obligatoria (no puede continuar sin marcarla) que dice: "He leído y acepto las condiciones de compra, incluyendo la política de penalidades y la política de no devolución en caso de mora." La palabra "condiciones" es un link que abre `/terminos` en una nueva pestaña.

### 9.2 Paso 2A: Pago Online con Tarjeta

Si el usuario selecciona el método online, aparece un botón grande "Ir a la Página de Pago Seguro". Este botón redirige al usuario al link externo de pago que el admin configuró para ese producto (campo `onlinePaymentLink`). Este link puede ser de Mercado Pago, PayU, Culqi, Niubiz, o cualquier plataforma que el negocio use.

Antes de redirigir, el sistema hace lo siguiente en el fondo:
1. Crea un documento en la colección `orders` con estado `"pending_first_payment"` y establece `reservedUntil` en 24 horas desde ahora.
2. Guarda en Firestore o en una cookie temporal el `orderId` recién creado.
3. Redirige al usuario al link externo en la misma pestaña (no en otra pestaña, para mantener el flujo).

El usuario completa su pago en la plataforma externa y, cuando termina, la plataforma lo redirige a la URL de éxito configurada. Esta URL debe ser `https://iphoneencuotas.com/pago-exitoso?orderId=[id]`.

En la página `/pago-exitoso`, el usuario ve un mensaje de éxito y un formulario que le pide:
- Nombre completo
- DNI
- Teléfono de contacto
- Dirección de envío completa (con un select para el departamento, que automáticamente calcula el costo de envío)
- Campo para subir el comprobante de pago (screenshot del email de confirmación o comprobante de la plataforma)

Al enviar este formulario, el sistema actualiza el documento del pedido en Firestore con estos datos y cambia el estado del pago de la primera cuota a `"pending_approval"`. El admin recibe una notificación de nuevo pago pendiente.

### 9.3 Paso 2B: Pago Offline con Yape / Transferencia

Si el usuario selecciona el método offline, el modal cambia su contenido para mostrar el `OfflinePaymentPanel.tsx`. Este panel muestra:

- El número de Yape/Plin con un ícono grande de Yape y el número claramente visible. Incluye un botón "Copiar número" que copia al portapapeles.
- Los datos de transferencia bancaria: banco, titular, número de cuenta, código CCI, cada uno con su botón de copiar.
- El monto exacto a transferir (primera cuota o cuota inicial, más el seguro si lo seleccionó).
- Un área de instrucciones: "1. Realiza la transferencia al número/cuenta indicado. 2. Toma una captura de pantalla del comprobante. 3. Sube tu comprobante aquí y llena tus datos."
- Un botón "Ya realicé el pago — Subir comprobante" que abre el formulario de subida.

El formulario de subida solicita:
- Nombre completo
- DNI
- Teléfono
- Dirección de envío con select de departamento
- Uploader de imagen (el comprobante)

Al enviar, el sistema:
1. Sube la imagen del comprobante a Firebase Storage en la ruta `vouchers/{orderId}/cuota-1.jpg`
2. Crea el documento en `orders` con estado `"pending_first_payment"`
3. Crea el primer documento en `payments` con `installmentNumber: 1`, `status: "pending_approval"`, `voucherUrl` con la URL de la imagen subida
4. Establece `reservedUntil` en 24 horas desde ahora
5. Redirige al usuario a `/dashboard` donde puede ver el estado de su pedido

### 9.4 La Reserva de 24 Horas y el Bloqueo de Stock

Cuando se crea un pedido con `status: "pending_first_payment"`, el stock del producto se reduce en 1 inmediatamente en Firestore. El campo `reservedUntil` indica hasta cuándo dura la reserva.

Un proceso automatizado (implementado como una Firebase Cloud Function que corre cada hora, o como una verificación lazy cuando alguien consulta el stock) revisa si hay pedidos en estado `"pending_first_payment"` cuyo `reservedUntil` ya pasó. Si los encuentra, cambia el estado del pedido a `"cancelled"` y devuelve el stock al producto.

Ese pedido cancelado se mueve automáticamente a la colección de análisis que el admin puede ver en `/admin/abandonos`. En esta sección, el admin ve los datos del cliente (nombre, email) y el producto que estuvo a punto de comprar. Desde aquí puede seleccionar uno o varios registros y enviar un recordatorio personalizado.

### 9.5 Aprobación del Primer Pago por el Admin

En el dashboard del admin, en la sección `/admin/pagos`, el admin ve todas las cuotas con estado `"pending_approval"` ordenadas por fecha de más reciente a más antigua. Cada item muestra: foto del cliente, nombre, DNI, modelo de iPhone reservado, número de cuota, monto, fecha de subida, y la imagen del comprobante en tamaño miniatura (click para ampliar).

El admin tiene dos botones: "Aprobar" y "Rechazar". Si hace clic en "Rechazar", aparece un campo de texto donde escribe el motivo (por ejemplo, "El monto transferido no coincide" o "La captura está editada"). Luego hace clic en "Confirmar Rechazo".

**Si el admin aprueba el primer pago:**
- El estado del pedido cambia de `"pending_first_payment"` a `"active"`
- El primer pago en `payments` cambia a `"approved"`
- El sistema automáticamente crea los documentos para las cuotas restantes (cuota 2 hasta cuota N) con sus fechas de vencimiento calculadas (1 mes después de la fecha de la cuota anterior) y con `status: "locked"`
- Desbloquea la cuota 2 con `status: "open"` inmediatamente
- El cliente recibe una notificación visual (si tiene la app/web abierta) y un indicador visual en su dashboard cambia a "Aprobado ✓"
- Se registra en `audit_logs`: `{action: "APPROVE_PAYMENT", adminId: ..., targetId: paymentId, details: {orderId, installmentNumber: 1}}`

**Si el admin rechaza el primer pago:**
- El estado de la cuota en `payments` cambia a `"rejected"`
- El estado del pedido permanece en `"pending_first_payment"` (no se activa el proceso)
- El pedido no se considera iniciado — no hay penalidades, no hay consecuencias contractuales
- El cliente ve en su dashboard que el pago fue rechazado con el motivo, pero no hay deadline de re-envío ni penalidad (es el primer pago, el proceso no ha comenzado)
- El stock se libera inmediatamente al rechazar el primer pago
- Si el cliente quiere intentarlo de nuevo, debe volver a la página del producto e iniciar una nueva reserva

### 9.6 Flujo de Cuotas Subsiguientes

Una vez que el pedido está `"active"`, el flujo de cuotas sigue este ciclo para cada cuota del 2 al N:

**Apertura de la cuota.** Las cuotas están `"locked"` hasta que llega su turno. La cuota N+1 se desbloquea (`status: "open"`) cuando la cuota N es aprobada. Sin embargo, el cliente puede subir el comprobante de la cuota siguiente incluso si aún no ha llegado la fecha de vencimiento —el campo está abierto para recibir pagos adelantados.

**Pago adelantado.** Si el cliente decide pagar la cuota 3 cuando la cuota 2 recién fue aprobada (varios días antes del vencimiento de la 3), puede hacerlo. La cuota 3 estará con estado `"open"` y el formulario de subida de comprobante estará habilitado. Al aprobarse, la cuota 4 se desbloquea, y así sucesivamente. Las fechas de vencimiento de las cuotas siguientes no cambian — se mantienen según el calendario original. Esto beneficia al cliente porque se "adelanta" en el plan sin afectar las fechas de los demás.

**Alertas automáticas.** Cuando faltan 5 días para el vencimiento de una cuota `"open"`, el sistema muestra en el dashboard del cliente un banner de alerta naranja: "Tu cuota 3 vence el [fecha]. ¡Quedan 5 días!". Cuando faltan 3 días, el banner se vuelve más urgente con el color naranja más intenso. Cuando queda 1 día, el banner es rojo con una cuenta regresiva en tiempo real (horas:minutos:segundos). Estas alertas se generan del lado del cliente con el hook `useCountdown.ts` que lee la `dueDate` de la cuota.

**Vencimiento de la cuota.** Cuando llega la `dueDate` de una cuota `"open"` (sin comprobante subido) o `"pending_approval"` (con comprobante subido pero no aprobado aún), el sistema evalúa la situación:

Si la cuota tiene estado `"open"` y venció (sin comprobante): el estado cambia a `"overdue"` y comienza el cálculo de penalidades basado en los días transcurridos desde la fecha de vencimiento.

Si la cuota tiene estado `"pending_approval"` y venció mientras esperaba aprobación: el admin tiene el poder de aprobarla retroactivamente. Si lo aprueba, no se aplica penalidad. Esta situación es común y el admin debe manejarla caso a caso.

Si la cuota tiene estado `"rejected"` y se rechazó antes del vencimiento: el cliente tiene 24 horas desde el rechazo para subir el comprobante correcto. Si pasa ese plazo sin que el cliente lo re-envíe, la cuota pasa a `"overdue"`.

### 9.7 Penalidades y Cancelación del Pedido

Cuando una cuota pasa a `"overdue"`, el sistema comienza a contar los días de atraso usando la diferencia entre `dueDate` y el momento actual. La penalidad se calcula con la función `getPenaltyAmount(diasAtraso)` de `src/lib/utils/penalties.ts`:

```
De 1 a 5 días de atraso:    Penalidad de S/ 59 adicionales a la cuota
De 6 a 10 días de atraso:   Penalidad de S/ 79 adicionales a la cuota  
De 11 a 15 días de atraso:  Penalidad de S/ 99 adicionales a la cuota
Más de 15 días de atraso:   El pedido se CANCELA automáticamente sin devolución
```

Cuando un pedido se cancela por mora (`status: "defaulted"`):
- El stock del producto se incrementa en 1 (el equipo vuelve a estar disponible)
- Todos los pagos anteriores hechos por el cliente se registran como ganancia para el negocio
- El cliente ve en su dashboard un mensaje claro: "Tu pedido fue cancelado el [fecha] por falta de pago de la cuota [N]. Según los términos aceptados, los pagos realizados no son reembolsables."
- El botón de WhatsApp desaparece de su vista
- Se registra en `audit_logs` la cancelación

---

## 10. Sistema de Seguros de Prórroga

### 10.1 Qué Es el Seguro de Prórroga

El Seguro de Prórroga es un producto adicional que el cliente puede comprar para protegerse contra el atraso en el pago de sus cuotas. Funciona como un "tiempo extra" garantizado: si compró un seguro de 1 mes y llega la fecha de vencimiento de su cuota sin poder pagar, el seguro la cubre automáticamente sin que se aplique penalidad, dándole un mes adicional para realizar el pago.

### 10.2 Precios del Seguro

Existen dos momentos para comprar el seguro, con precios distintos diseñados psicológicamente para incentivar la compra preventiva:

**En el Checkout (precio especial):** El cliente puede agregar el seguro de 1 mes al momento de hacer la reserva. El precio es más bajo que comprarlo después — el admin configura este precio en el campo `insuranceCheckoutDiscount1Month` del producto (ejemplo: S/ 29). Este precio especial solo está disponible en el momento de la reserva inicial.

**Desde el Dashboard (precio estándar):** Una vez activo el pedido, el cliente puede comprar el seguro desde su dashboard con los precios completos que el admin configuró en el producto:
- 1 mes de prórroga: precio definido en `insurancePlan1Month` (ejemplo: S/ 49)
- 2 meses de prórroga: precio definido en `insurancePlan2Months` (ejemplo: S/ 89)
- 3 meses de prórroga: precio definido en `insurancePlan3Months` (ejemplo: S/ 99)

### 10.3 Regla Crítica: La Ventana de Compra

El seguro solo puede comprarse mientras la cuota activa todavía no ha vencido. En el momento en que el timestamp actual supera la `dueDate` de la cuota activa, el botón de compra del seguro se bloquea automáticamente y aparece el mensaje "El plazo de protección ha vencido. Se aplica penalidad por mora." Esta verificación se hace en tiempo real en el cliente con el hook `useCountdown.ts`.

### 10.4 Presentación en el Dashboard del Cliente

En el dashboard del cliente, cuando la cuota activa está con estado `"open"` y aún no ha vencido, aparece una sección de "Protege tu pago" con las opciones de compra del seguro. Si el cliente ya tiene seguro activo, esta sección muestra el estado del seguro: cuántos meses tiene disponibles y cuántos ha usado.

Si el cliente compra seguro de 2 meses y solo usa 1, el mes restante se aplica automáticamente a la siguiente cuota que esté en riesgo de vencer.

Cuando el seguro cubre una cuota automáticamente (la cuota venció pero tiene seguro disponible), la cuota cambia de `"open"` a `"insured"` y se registra en `order.insurance.monthsUsed += 1`. En el dashboard, la cuota cubierta aparece con un escudo verde y el mensaje "Cubierta por tu Seguro de Prórroga. Nueva fecha: [fecha + 1 mes]."

---

## 11. Penalidades y Reglas de Negocio Críticas

### 11.1 Resumen de Todas las Reglas de Negocio

**Regla 1 — Reserva de 24 horas:** Cuando el cliente inicia el proceso de reserva (ya sea pagando online o indicando que va a pagar con Yape), tiene exactamente 24 horas para completar y enviar su comprobante. Pasadas las 24 horas sin comprobante aprobado para la primera cuota, el pedido se cancela automáticamente y el stock se libera.

**Regla 2 — Primer pago sin consecuencias:** Si el admin rechaza el primer pago, el proceso simplemente no inicia. No hay penalidades, no hay contratos, no hay obligaciones. El cliente puede intentarlo de nuevo desde cero.

**Regla 3 — Cuotas siguientes tienen deadline de re-envío:** Si el admin rechaza el comprobante de la cuota 2 o superior, el cliente tiene exactamente 24 horas desde el momento del rechazo para subir el comprobante correcto. Este deadline se muestra claramente en el dashboard del cliente con una cuenta regresiva. Si no re-envía en 24 horas, la cuota pasa a `"overdue"` y comienzan los días de mora.

**Regla 4 — El seguro vence con la cuota:** El seguro debe comprarse ANTES de que venza la cuota. Si la cuota ya venció (aunque sea por 1 minuto), el seguro no puede comprarse y la penalidad aplica.

**Regla 5 — Más de 15 días sin pagar = cancelación total:** Si una cuota lleva más de 15 días vencida sin pago ni seguro, el pedido completo se cancela, el cliente pierde todos los pagos realizados hasta el momento, y el stock del equipo se libera.

**Regla 6 — El seguro cubre automáticamente:** Cuando el seguro está activo y una cuota vence, el sistema la cubre sin que el cliente tenga que hacer nada. El sistema detecta el vencimiento, verifica el seguro, lo aplica y actualiza el estado automáticamente.

**Regla 7 — Pago adelantado siempre se puede hacer:** Si una cuota está `"open"`, el cliente puede subir su comprobante en cualquier momento, incluso días antes del vencimiento. Las fechas de las cuotas siguientes no se recortan — se mantienen según el plan original.

**Regla 8 — Aceptación de términos es obligatoria:** Sin marcar el checkbox de términos y condiciones en el modal de reserva, el botón de proceder al pago permanece deshabilitado. No hay excepción a esta regla. Es la protección legal del negocio.

---

## 12. Dashboard del Administrador

### 12.1 Visión General

El dashboard del administrador es el centro de control del negocio. Es accesible desde `/admin` y requiere que el usuario tenga `role: "admin"` en su documento de Firestore. Está diseñado para que el admin pueda operar el negocio completamente desde aquí sin necesidad de abrir la consola de Firebase.

La pantalla principal del admin (`/admin/page.tsx`) muestra métricas clave en tarjetas: pedidos activos, pagos pendientes de aprobación, total recaudado este mes, y stock total disponible. Debajo, las últimas actividades recientes (pagos recibidos, pedidos completados).

### 12.2 Publicación de Productos: El Formulario Completo

La sección `/admin/productos/nuevo` contiene el formulario más complejo del sistema. Está organizado en pestañas o secciones con scroll para no abrumar al admin. A continuación se describe cada sección del formulario:

**Sección 1 — Información Básica:**
El admin define el título del producto (por ejemplo, "iPhone 15 Pro Max 256GB Titanio Natural"), el modelo de iPhone (select con todos los modelos desde el 13 hasta los modelos futuros que se vayan agregando), el almacenamiento (128GB, 256GB, 512GB, 1TB), el color, la condición (Nuevo o Reacondicionado), y el grado de calidad en caso de reacondicionado (A+, A, B). También define el stock disponible.

**Sección 2 — Imágenes del Producto:**
El admin puede subir hasta 8 imágenes. Tiene dos opciones para cada imagen: subir un archivo desde su computadora (se sube a Firebase Storage) o pegar la URL de una imagen externa. Las imágenes se muestran como una galería de previsualización con opción de reordenar (drag and drop) y eliminar. La primera imagen es automáticamente la imagen principal y la imagen Open Graph.

**Sección 3 — Precios y Cuotas:**
El admin ingresa el precio total del equipo. El número de cuotas (por defecto 12, editable). La tasa de interés mensual en porcentaje. El sistema calcula automáticamente y muestra en tiempo real el monto por cuota. También define si hay una cuota inicial (enganche) y cuánto es.

**Sección 4 — Penalidades y Seguros:**
El admin define los tres niveles de penalidad (días y montos). Los valores por defecto son los establecidos en `penalty-tiers.ts`, pero pueden personalizarse por producto. También define los precios del seguro de prórroga (1 mes, 2 meses, 3 meses) y el precio especial del checkout para 1 mes.

**Sección 5 — Métodos de Pago:**
El admin ingresa el número de Yape/Plin, los datos de transferencia bancaria (banco, titular, número de cuenta, CCI), y el link de pago online. Puede activar o desactivar cada método de pago de forma independiente (si solo acepta Yape para ese producto, desactiva la opción de link online).

**Sección 6 — Especificaciones Técnicas:**
Campos de texto para cada especificación técnica del iPhone: pantalla, chip, cámara, batería, conectividad, sistema operativo. El admin puede editarlos con texto libre o con formato HTML básico para negritas y saltos de línea.

**Sección 7 — Contenido de la Página:**
El admin escribe el texto que aparecerá en el hero de la página del producto (headline y subheadline), el texto del bloque "¿Cómo funciona?", y los pares de pregunta/respuesta para el FAQ (puede agregar, editar y reordenar preguntas).

**Sección 8 — SEO y Visibilidad:**
Esta es la sección más importante para el posicionamiento. El admin define:
- URL Slug (auto-generado desde el título pero editable): `iphone-15-pro-max-256gb`
- Meta Title (con contador de caracteres y barra de color que se vuelve roja si supera 60): "Comprar iPhone 15 Pro Max 256GB en Cuotas | iPhone en Cuotas"
- Meta Description (contador hasta 160): "Compra el iPhone 15 Pro Max 256GB en 12 cuotas sin tarjeta. Paga con Yape o transferencia. Entrega a todo el Perú."
- H1 de la página: "Comprar iPhone 15 Pro Max en Cuotas Sin Tarjeta de Crédito"
- URL Canónica (auto-completada con el slug pero editable)
- Open Graph Title, Description e Imagen
- Twitter Card Title, Description
- Campo de Schema JSON-LD override (opcional, para casos avanzados)

Al lado derecho de estos campos, se actualizan en tiempo real las previsualizaciones de Google y de redes sociales.

**Auto-guardado:** El formulario guarda automáticamente como borrador en Firestore cada 30 segundos (implementado con el hook `useAutoSave.ts`). El admin ve un indicador discreto "Guardado hace 15 segundos". Si cierra la pestaña y vuelve, el borrador está esperándolo.

**Publicación:** Al final del formulario, hay dos botones: "Guardar como Borrador" (guarda con `status: "draft"`) y "Publicar Ahora" (guarda con `status: "published"` y `publishedAt: now`). Al publicar, el producto aparece inmediatamente en la Home y el sitemap.xml lo incluirá en la próxima generación.

**Estado "Borrador":** Los productos en borrador son visibles en el panel del admin pero no en el sitio público. El admin puede previsualizar cómo se verá la página pública haciendo clic en "Vista Previa" (abre la URL con un parámetro especial que solo el admin autenticado puede ver).

### 12.3 Gestión de Pedidos

En `/admin/pedidos`, el admin ve todos los pedidos con filtros potentes: por estado (activos, completados, cancelados, en mora), por fecha de creación, por producto, y por método de pago (online/offline). La tabla muestra las columnas más relevantes con paginación.

Al hacer clic en un pedido, se abre la vista detallada `/admin/pedidos/[orderId]` que muestra toda la información en una sola pantalla:
- Datos del cliente (nombre, DNI, email, teléfono)
- Producto reservado con imagen y especificaciones
- Dirección de envío y costo de flete
- La línea de tiempo de cuotas con el estado de cada una
- Para cada cuota: fecha de vencimiento, monto, fecha en que se subió el comprobante, imagen del comprobante (click para ampliar), y los botones de aprobar/rechazar si está pendiente
- Si el comprobante fue rechazado, aparece el campo de motivo de rechazo y el deadline del cliente para re-enviar
- La sección de seguro: si lo tiene, cuánto le queda
- El estado de envío con los botones de actualización (En Preparación > En Camino > Entregado) y el campo de fecha estimada de entrega

### 12.4 Gestión de Pagos Pendientes

La sección `/admin/pagos` es posiblemente la que el admin visitará con más frecuencia. Muestra todas las cuotas con estado `"pending_approval"` en una lista ordenada por fecha de subida (más antiguo primero, para procesar en orden FIFO). Cada item tiene:
- Nombre del cliente y foto de perfil
- Modelo de iPhone y número de cuota
- Monto esperado
- Fecha en que se subió el comprobante
- Thumbnail del comprobante (ampliable)
- Método de pago (online/offline)
- Botones: "Aprobar ✓" y "Rechazar ✗"

El admin puede procesar múltiples pagos en secuencia rápidamente sin salir de esta sección.

### 12.5 Notificaciones de Abandono de Carrito

En `/admin/abandonos`, el admin ve la lista de usuarios que iniciaron sesión, estuvieron en una página de producto, y se fueron sin completar la reserva. El sistema registra estos eventos 30 minutos después de que el usuario cierra la sesión o el navegador, si no hay un pedido activo asociado a ese usuario.

La vista muestra: nombre del cliente, email, el producto que estaba viendo, cuándo lo abandonó, y si ya fue contactado (notificación enviada sí/no).

El admin puede seleccionar uno o múltiples registros y hacer clic en "Enviar Recordatorio". Se abre un editor de mensaje con plantilla predefinida que incluye variables dinámicas:

```
Hola $name,

El $iphone-abandonado que estuviste viendo ya casi es tuyo.

Imagina las fotos increíbles que podrías tomar con tu $iphone-abandonado...
¡Reserva hoy y estrena tu iPhone esta semana!

[Botón: Ver mi iPhone]
```

El admin puede editar el texto antes de enviar. El mensaje se envía al email del cliente usando un servicio de email configurado en las variables de entorno (por ejemplo, SendGrid o Resend con su API). Las variables `$name` e `$iphone-abandonado` se reemplazan automáticamente antes de enviar.

### 12.6 Configuración de Fletes

En `/admin/envios`, el admin ve una tabla con todos los 25 departamentos del Perú. Para cada departamento, hay un campo editable con el costo del flete en soles. Lima tiene costo 0 por defecto (envío incluido). El admin puede actualizar el costo de cualquier departamento y guardar con un solo clic. Los cambios aplican inmediatamente a todos los productos.

---

## 13. Dashboard del Cliente

### 13.1 Vista Principal

El dashboard del cliente (`/dashboard`) muestra un resumen de sus pedidos activos. Si el cliente no tiene pedidos, ve una pantalla de bienvenida con un botón que dice "Ver iPhones Disponibles" que lo lleva a la Home.

Si tiene un pedido activo, la pantalla principal del dashboard es la vista de seguimiento de ese pedido.

### 13.2 La Línea de Tiempo de Cuotas

Este es el componente más importante del dashboard del cliente y debe ser bello, claro y motivador. Es un componente `OrderTimeline.tsx` que muestra visualmente el progreso del plan de pagos.

El componente se renderiza verticalmente en móvil y horizontalmente en desktop. Cada cuota está representada por un nodo circular conectado por una línea. Los colores de los nodos indican el estado:

**Nodo gris con candado:** Cuota `"locked"` — aún no es su turno. Muestra la fecha futura de vencimiento.

**Nodo azul pulsante (animación suave):** Cuota `"open"` — es la cuota activa, esperando pago. Muestra la fecha de vencimiento y un botón "Pagar esta cuota".

**Nodo naranja:** Cuota en estado de alerta (faltan 3 días o menos para vencer).

**Nodo rojo con cuenta regresiva:** Último día antes del vencimiento. El nodo tiene una animación de pulso más rápida.

**Nodo verde con check:** Cuota `"approved"` — pagada y aprobada. Muestra la fecha en que fue pagada.

**Nodo con escudo azul:** Cuota `"insured"` — cubierta por el seguro de prórroga.

**Nodo rojo con X:** Cuota `"overdue"` o `"penalized"` — vencida con penalidad.

Cuando el admin aprueba un pago, Firestore actualiza el documento en tiempo real, y el `onSnapshot` listener del cliente detecta el cambio inmediatamente. Sin recargar la página, el nodo de esa cuota se anima de "pendiente" a "aprobado" con una animación de check verde. Si el frontend usa confeti, este es el momento de lanzarlo.

### 13.3 Subir Comprobante desde el Dashboard

Cuando el cliente está en el nodo de una cuota `"open"`, el botón "Pagar esta cuota" abre un formulario que le permite:
1. Elegir el método de pago (ver los datos de Yape/transferencia del producto, o el link de pago online)
2. Subir la captura de su comprobante de pago
3. Confirmar el envío

Si el cliente ya pagó online y fue redirigido a `/pago-exitoso`, desde allí también puede llegar a este mismo flujo. El sistema detecta si el cliente llegó desde el link externo y pre-selecciona "Pago Online" en el método.

### 13.4 Estado de Envío

Una vez que el admin marca el pedido como "Entregado" (todas las cuotas pagadas), en el dashboard del cliente aparece la sección de tracking de envío:

```
[● Preparando tu iPhone]  [○ En camino]  [○ Entregado]
Fecha estimada de entrega: 20 de julio, 2025
```

Cada vez que el admin actualiza el estado de envío, el cliente lo ve en tiempo real gracias al listener de Firestore.

También aparece el botón de WhatsApp: "Coordinar entrega por WhatsApp" que abre `https://wa.me/51944784488?text=Hola, soy [nombre], mi pedido [orderId] está completamente pagado. Quiero coordinar la entrega de mi [modelo]`. Este botón está activo hasta que el admin marque el pedido como `"delivered"`.

---

## 14. Sistema de Envíos y Fletes

### 14.1 Cálculo del Flete al Momento de la Reserva

Cuando el cliente llena el formulario con su dirección de envío (en el modal de checkout o en `/pago-exitoso`), el campo de selección de departamento es un `<select>` con los 25 departamentos del Perú. Cuando el cliente selecciona su departamento, el sistema consulta en tiempo real el `shipping_rates/peru_rates` de Firestore y muestra inmediatamente el costo del flete: "Envío a Arequipa: S/ 30".

El costo de envío se suma al desglose del pago final:
```
iPhone 15 Pro Max (1ª cuota): S/ 185
Seguro de Prórroga (si aplica): S/ 29
Flete a Arequipa: S/ 30
━━━━━━━━━━━━━━━━━━━━━━━━━
Total a pagar hoy: S/ 244
```

El flete se paga junto con la primera cuota. Las cuotas siguientes son solo del monto de la cuota.

---

## 15. Sistema de Reseñas Verificadas

### 15.1 Quién Puede Escribir una Reseña

Solo los clientes que tienen un pedido con `status: "delivered"` para el producto específico pueden escribir una reseña. Esto es verificado del lado del servidor. En el frontend, el botón "Escribir Opinión" en la sección de reseñas de la página del producto tiene tres estados posibles:

Si el usuario no está logueado: el botón dice "Inicia sesión para opinar" y redirige al login.

Si el usuario está logueado pero no tiene un pedido entregado de este producto: el botón está deshabilitado con un tooltip: "Solo clientes que ya recibieron su equipo pueden dejar una reseña."

Si el usuario está logueado y tiene un pedido entregado de este producto: el botón está activo y abre el formulario de reseña.

Si el usuario ya dejó una reseña para este producto (aprobada o pendiente): el botón dice "Ya enviaste tu opinión" y está deshabilitado.

### 15.2 Flujo de Moderación

Cuando un cliente envía su reseña, esta se guarda en Firestore con `status: "pending"`. No aparece en el sitio público hasta que el admin la apruebe.

En el dashboard del admin, la sección `/admin/resenas` muestra las reseñas pendientes con todos sus detalles (rating, título, texto, nombre del cliente, fecha). El admin puede aprobarla (aparece en el sitio), rechazarla (se elimina o se guarda como rechazada), o destacarla (aparece primero en la sección de reseñas).

Cuando el admin aprueba una reseña, el sistema automáticamente recalcula el `averageRating` y `reviewCount` del producto en Firestore. Esto actualiza inmediatamente el Schema JSON-LD de la página de producto, lo que Google detectará en la próxima visita del crawler.

### 15.3 Reseñas Semilla

Al crear un nuevo modelo de iPhone, el admin puede cargar reseñas iniciales ("semilla") para que la página no aparezca vacía desde el primer día. Estas reseñas tienen `isSeeded: true` en Firestore. El admin puede marcarlas de forma diferente en el panel o simplemente gestionarlas como si fueran reseñas aprobadas. Aparecen en el sitio igual que las reseñas reales aprobadas.

---

## 16. Módulo de Blog Administrable

### 16.1 Propósito del Blog

El blog tiene un objetivo estratégico claro: capturar tráfico de usuarios en la fase de investigación o consideración del proceso de compra. Alguien que busca "diferencias entre iPhone 14 y iPhone 15" o "cuál iPhone comprar en 2025" todavía no está listo para reservar, pero si encuentra un artículo de calidad en iPhone en Cuotas, se convierte en un visitante de la marca. Al final del artículo, un widget de conversión lo invita a "Ver el iPhone 15 en Cuotas" —eso cierra el círculo.

### 16.2 El Editor de Artículos

El editor de artículos en `/admin/blog/nuevo` usa **TipTap** como editor WYSIWYG. TipTap es una librería de React de código abierto, altamente extensible, que permite crear un editor de texto enriquecido con formato visual similar a Google Docs. El admin puede:

- Dar formato al texto (negrita, cursiva, subrayado)
- Crear encabezados jerárquicos (H2 y H3 para la estructura del artículo)
- Crear listas con viñetas y listas numeradas
- Insertar citas en bloque
- Pegar links
- Subir imágenes directamente dentro del cuerpo del artículo (se guardan en Firebase Storage)
- Insertar tablas de comparación

El editor tiene auto-guardado cada 30 segundos con el hook `useAutoSave.ts`.

### 16.3 Generación Automática de Tabla de Contenidos

Para artículos largos (más de 1500 palabras), el sistema analiza automáticamente todos los H2 y H3 del contenido del artículo y genera una Tabla de Contenidos (TOC) al inicio. Cada elemento de la TOC es un link ancla (`<a href="#seccion-id">`) que lleva al usuario directamente a esa sección.

Esto mejora la experiencia de lectura y también es positivo para el SEO: Google valora las páginas bien estructuradas con navegación interna clara.

### 16.4 Widget de Conversión en Artículos

Al final de cada artículo, y opcionalmente en la mitad del artículo, se muestra un componente de conversión. Si el campo `relatedProductSlug` del post está definido, el widget muestra la tarjeta del producto relacionado: foto del iPhone, nombre, precio por cuota, y el botón "Reservar en Cuotas". Si no hay producto relacionado, muestra un widget genérico que lleva a la Home.

Este widget es el puente entre el contenido educativo del blog y el negocio real. Es pequeño, no invasivo, pero siempre presente.

### 16.5 SEO del Blog

Cada artículo usa `generateMetadata()` de Next.js para inyectar sus meta tags individuales. El Schema JSON-LD inyectado en los artículos es del tipo `BlogPosting` o `Article`:

```javascript
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Título del artículo",
  "image": "URL de la imagen destacada",
  "author": { "@type": "Organization", "name": "iPhone en Cuotas" },
  "datePublished": "2025-07-01T00:00:00Z",
  "dateModified": "2025-07-01T00:00:00Z",
  "description": "Descripción del artículo"
}
```

Los slugs de los artículos publicados se incluyen automáticamente en el `sitemap.ts`.

---

## 17. Abandono de Carrito y Notificaciones

### 17.1 Detección del Abandono

El sistema detecta el abandono de carrito de la siguiente forma: cuando un usuario autenticado visita la página de un producto y permanece en ella más de 60 segundos (tiempo suficiente para demostrar intención) pero cierra la pestaña, navega a otra URL, o su sesión caduca sin haber creado un pedido, el evento se registra.

La implementación usa el evento `beforeunload` del navegador para detectar cuando el usuario está por salir. En ese momento, si no tiene un pedido activo, se hace una llamada a una Firebase Cloud Function (o directamente a Firestore con el SDK del cliente) que crea o actualiza el documento en `abandoned_carts`. El campo `abandonedAt` registra exactamente cuándo ocurrió.

El admin recibe una notificación en su dashboard cuando hay nuevos abandonos registrados.

### 17.2 Envío de Recordatorios

Desde `/admin/notificaciones`, el admin puede enviar recordatorios a los usuarios con carrito abandonado. El sistema de envío de emails usa un servicio de correo transaccional (Resend o SendGrid, configurado en las variables de entorno del servidor). Las variables `$name` e `$iphone-abandonado` se reemplazan automáticamente con los datos de cada usuario antes de enviar.

---

## 18. Optimización de Imágenes y Core Web Vitals

### 18.1 Por Qué Esto Importa para el SEO

Google usa los Core Web Vitals como señal de ranking. Los tres más importantes son LCP (Largest Contentful Paint — cuánto tarda en aparecer el contenido principal), CLS (Cumulative Layout Shift — cuánto "salta" el contenido mientras carga), y FID/INP (responsividad a interacciones). Si la página es lenta, Google la penaliza en el ranking sin importar qué tan buen contenido tenga.

### 18.2 Reglas Obligatorias de Imágenes

**Nunca usar `<img>` directamente.** Todas las imágenes del sistema, sin excepción, usan el componente `<Image/>` de Next.js. Este componente:
- Sirve automáticamente las imágenes en formato WebP o AVIF (los más eficientes)
- Las redimensiona al tamaño exacto necesario
- Aplica lazy loading por defecto (solo carga las imágenes cuando están cerca del viewport)
- Reserva el espacio de la imagen antes de cargarla (previene el CLS)
- Admite una imagen de baja calidad como placeholder mientras carga la imagen real (`placeholder="blur"`)

**Para imágenes de Firebase Storage:** El dominio `firebasestorage.googleapis.com` debe estar configurado en `next.config.ts` dentro de `images.remotePatterns`. Sin esto, el componente `<Image/>` rechaza las URLs de Firebase.

**La imagen del hero (LCP):** La imagen principal de cada página de producto es el elemento LCP —la imagen más grande y prominente de la página. Para optimizarla, se usa `priority={true}` en el componente `<Image/>`, lo que instruye a Next.js para que la cargue con máxima prioridad (sin lazy loading, con preload en el `<head>`). Solo la imagen del hero usa `priority={true}`; todas las demás usan el lazy loading por defecto.

---

## 19. Historial de Auditoría y Logs del Admin

### 19.1 Qué se Registra

Cada vez que el admin realiza una acción significativa en el sistema, se crea automáticamente un documento en la colección `audit_logs` con los detalles de la acción. Las acciones que se registran incluyen: aprobar un pago, rechazar un pago, publicar un producto, poner un producto como borrador, eliminar un producto, aprobar una reseña, rechazar una reseña, actualizar el estado de un pedido, actualizar el estado de envío, y enviar notificaciones de abandono de carrito.

### 19.2 Vista de Auditoría

En `/admin/auditoria`, el admin ve una tabla cronológica de todas las acciones realizadas. Incluye filtros por tipo de acción, por producto afectado, y por rango de fechas. Cada fila muestra: timestamp, acción realizada, ID del documento afectado (con link clickeable para ir directamente a ese pedido/producto/reseña), y el email del admin que la ejecutó.

Esto protege al negocio ante disputas con clientes: si un cliente dice "nunca me aprobaron el pago" o "me rechazaron sin motivo", el admin puede mostrar exactamente qué acción se tomó, cuándo, y quién la ejecutó.

---

## 20. Términos, Condiciones y Protección Legal

### 20.1 La Página de Términos y Condiciones

La página `/terminos` debe contener un documento legal claro y completo que incluya: la política de penalidades (los tres niveles de mora y sus costos exactos), la política de no devolución (en caso de mora superior a 15 días, el cliente pierde todos los pagos realizados), las condiciones del seguro de prórroga (qué cubre y qué no), el proceso de reserva y cancelación, y los datos del negocio (razón social, RUC si aplica, datos de contacto).

### 20.2 El Checkbox de Aceptación Obligatoria

En el modal de pago, antes de que el cliente pueda proceder, debe marcar explícitamente una casilla de verificación que diga exactamente: "He leído y acepto las Condiciones de Compra, incluyendo la política de penalidades por atraso y la política de no devolución en caso de mora. Entiendo que si me atraso más de 15 días en una cuota, pierdo el equipo y los pagos realizados."

El botón de proceder está deshabilitado (`disabled={!termsAccepted}`) hasta que esta casilla esté marcada. El estado del checkbox se guarda en el estado local del componente React. No se puede saltear.

---

## 21. Micro-interacciones y Animaciones

### 21.1 Principios de las Animaciones

Las animaciones del sistema siguen el principio Apple: sutiles, funcionales, con propósito. Nunca decorativas por sí solas. Cada animación existe para comunicar un cambio de estado o guiar la atención del usuario.

### 21.2 Animaciones Específicas a Implementar

**Botón "Reservar":** Tiene una transición de escala y sombra al hacer hover (`transform: scale(1.02); box-shadow: 0 4px 16px rgba(0,113,227,0.3)`). Al hacer clic, una animación de "press" (`transform: scale(0.98)`) de 100ms. Todas las transiciones usan `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (la curva de easing de Apple).

**Cuota aprobada:** Cuando el admin aprueba una cuota y el cliente tiene el dashboard abierto, el nodo de esa cuota en la línea de tiempo se anima de azul pulsante a verde con check. La animación dura 600ms y va seguida del confeti del componente `Confetti.tsx` que cae por 2 segundos. Esto libera dopamina y motiva al cliente a seguir pagando.

**Navbar al hacer scroll:** La transición del estado transparente al estado glassmorphism tarda 300ms con `ease-out`. No hay un corte abrupto — el `backdrop-filter` y la opacidad del fondo se animan suavemente.

**Modal de pago:** El modal aparece con una animación de fade-in y scale-up simultáneos (`opacity: 0 → 1; transform: scale(0.95) → scale(1)`) de 200ms. En móvil, el sheet desliza desde abajo.

**Carga de datos:** Cuando el sistema está consultando Firestore, se muestran skeleton screens (rectángulos grises con animación de shimmer) en el lugar donde aparecerá el contenido. Esto es más elegante que un spinner y previene el CLS.

**Check de términos:** Al marcar el checkbox de términos y condiciones, el botón "Continuar" se desbloquea con una transición de color y opacidad que lo hace pasar de gris a azul Apple en 200ms.

### 21.3 Respeto por el Prefers-Reduced-Motion

El sistema detecta si el usuario tiene activada la opción "Reduce Motion" en su sistema operativo (accessibility setting). Si es así, todas las animaciones de duración mayor a 100ms se eliminan. Los cambios de estado siguen siendo visibles (los colores cambian) pero sin las transiciones. Esto se implementa con `@media (prefers-reduced-motion: reduce)` en CSS.

---

## Apéndice A: Variables de Entorno Requeridas

El archivo `.env.local` (nunca comitear al repositorio) debe tener las siguientes variables:

```bash
# Firebase Client SDK (seguras para exponer al cliente)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase Admin SDK (SOLO servidor, jamás con NEXT_PUBLIC_)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# URL Base del Sitio
NEXT_PUBLIC_SITE_URL=https://iphoneencuotas.com

# Servicio de Email Transaccional (para notificaciones de abandono de carrito)
EMAIL_SERVICE_API_KEY=
EMAIL_FROM=noreply@iphoneencuotas.com

# Número de WhatsApp del Negocio (para el botón de contacto)
NEXT_PUBLIC_WHATSAPP_NUMBER=51944784488
```

---

## Apéndice B: Flujo de Datos de Pago — Diagrama Conceptual

```
Cliente hace clic en "Reservar"
        │
        ▼
¿Está logueado?
    NO → redirige a /login?callbackUrl=/iphone/[slug] → login con Google → regresa al producto
    SÍ → abre PaymentModal
        │
        ▼
¿Acepta términos? (checkbox obligatorio)
    NO → botón deshabilitado
    SÍ → continúa
        │
        ▼
¿Agrega seguro de prórroga al checkout?
    SÍ → suma precio especial al total de hoy
    NO → continúa sin seguro
        │
        ▼
¿Método de pago?
    ├── ONLINE → crea order (pending_first_payment) → redirige a link externo →
    │            cliente paga → redirigido a /pago-exitoso → sube comprobante + datos →
    │            payment (pending_approval) → notificación al admin
    │
    └── OFFLINE → muestra datos de Yape/transferencia → cliente paga manualmente →
                  sube comprobante + datos → crea order + payment (pending_approval) →
                  notificación al admin
                        │
                        ▼
                Admin revisa en /admin/pagos
                    ├── APRUEBA → order: active → se crean cuotas 2..N (locked) →
                    │            cuota 2 se abre → cliente ve dashboard actualizado
                    │
                    └── RECHAZA →
                        ├── Si es cuota 1: order permanece en pending, sin penalidad,
                        │                 proceso no inicia, stock se libera
                        └── Si es cuota 2+: cliente tiene 24h para re-subir comprobante
                                          antes de que se aplique mora
```

---

*FIN DEL DOCUMENTO — iPhone en Cuotas PRD v1.0*
*Este documento debe actualizarse cada vez que se toma una decisión de producto que cambie cualquier flujo o regla de negocio descrita aquí.*
