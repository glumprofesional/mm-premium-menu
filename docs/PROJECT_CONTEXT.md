PROJECT CONTEXT — M&M Multiespacio
Negocio
M&M Multiespacio es un boliche nocturno. El menú digital se accede escaneando un código QR en las mesas.

Problema
Los clientes no conocen la carta completa. El menú impreso se desactualiza, se ensucia y es costoso reimprimir.

Solución
Menú digital premium accesible por QR. Flujo: Escanear → Ver → Consumir.

Usuarios
Cliente (frontend público)
Escanea QR → ve el menú → elige producto
NO necesita login, NO necesita PWA
Dispositivos: móviles diversos, algunos antiguos
Entorno: boliche oscuro, mala conectividad
Admin (backend PWA)
super_admin: el desarrollador (acceso total)
admin: el dueño del boliche (gestiona categorías, productos, precios)
editor: personal delegado (solo toggle disponibilidad)
Necesita PWA instalable para uso frecuente
Categorías del menú (orden alfabético)
Aguas y Gaseosas
Cervezas
Champagne
Energizantes
Espumantes
Importados
Licores
Tragos
Vinos
Vodka
Whisky
Decisiones de UX/UI
Pantalla 1 — Categorías
Tarjetas horizontales individuales
Imagen real sin fondo (400×400px, WebP, transparente, <50KB) a la izquierda
Nombre y descripción a la derecha
SIN cantidad de productos
Logo = botón home
Pantalla 2 — Productos por categoría
Tarjetas horizontales
Miniatura izquierda, datos + precio a la derecha
Precio siempre visible
Detalle de producto
Modal con información completa
Botón para volver al inicio
Header
En categorías: Logo centrado | Lupa izquierda | Toggle dark/light derecha
Dentro de categoría: Flecha ← + Nombre categoría | Toggle derecha
Logo = home (vuelve a categorías)
Header sticky
Intro animation
Logo + texto al escanear QR
Máximo 1.5 segundos
Se puede skippear con touch
Solo primera vez por sesión (sessionStorage)
Modo oscuro/claro
Dark mode por defecto (el boliche es oscuro)
Toggle para light mode
Preferencia guardada en localStorage
Arquitectura de la aplicación
Frontend (público)
NO es PWA — escanea, ve, cierra
Server Components por defecto
ISR con revalidación cada 30 segundos
Acceso: mm-menu.vercel.app o similar
Backend (admin PWA)
SÍ es PWA — instalable para el dueño
Client Components para interactividad
Protegido por autenticación Supabase Auth
Acceso: mm-menu.vercel.app/admin
Stack tecnológico
Framework: Next.js 16.2.4 (App Router)
Lenguaje: TypeScript
Estilos: TailwindCSS 4 + Design Tokens
Base de datos: Supabase (PostgreSQL)
Auth: Supabase Auth
Storage: Supabase Storage
Deploy: Vercel
Desarrollo: Firebase Studio con IA
Reutilización
La arquitectura debe ser reutilizable para otros boliches/clientes. Los ajustes por cliente se manejan en la tabla settings y variables de entorno. NO es multi-tenant por ahora — se replica para cada cliente.