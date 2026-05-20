AGENTS — Reglas para IA en Firebase Studio
Regla #1: Rendimiento primero
Server Components por defecto
Client Components SOLO para interactividad (clicks, estado, efectos)
ISR con revalidate = 30 segundos
Bundle JS objetivo: < 150KB gzipped
Skeleton screens, NUNCA spinners
Imágenes: WebP, sizes correctos, lazy loading nativo
Regla #2: Design tokens obligatorios
CERO valores hardcodeados en componentes
Colores, espaciado, tipografía → variables CSS en globals.css
Usar Tailwind con tokens: bg-[var(--surface)], text-[var(--text-primary)]
NUEVOS tokens deben agregarse a globals.css, NO inline
Regla #3: Dark mode nativo
Dark mode es el DEFAULT
Light mode via toggle con localStorage
CSS custom properties para ambos temas
prefers-color-scheme como fallback inicial
NUNCA asumir fondo blanco
Colores dark: Base #111111, Surface #1A1A1A, Text #F0F0F0
Colores light: Base #FAFAFA, Surface #F0F0F0, Text #1A1A1A
Sin negro puro (#000) ni blanco puro (#FFFFFF) como fondo o texto principal
Regla #4: Mobile-first estricto
Diseñar para 375px primero
Breakpoints: sm(640), md(768), lg(1024)
Touch targets mínimos 44×44px
Sin hover-only states (no hay mouse en móviles)
Regla #5: Cinematic Minimalism
Gradientes: PROHIBIDOS
Glassmorphism/blur: PROHIBIDO (excepto overlay de modal)
Animaciones: 150-250ms, ease-out, propósito claro
Máximo 3 elementos decorativos por pantalla
Si se puede quitar sin perder funcionalidad → QUITAR
Regla #6: Tipografía definida
Headings: Cabinet Grotesk (Bold/Medium)
Body: Manrope (Regular/Medium/SemiBold)
NUNCA usar system-ui, Inter, Roboto como fuentes del proyecto
Tamaños según DESIGN_PRINCIPLES.md
Fuentes auto-hospedadas desde /public/fonts/ en formato woff2
Regla #7: Estructura del proyecto
Feature-based architecture (ver ARCHITECTURE.md)
components/ui/ → primitivos reutilizables
components/layout/ → Header, Footer, Sidebar
features/menu/ → lógica del menú público
features/auth/ → autenticación y roles
lib/supabase/ → clients (browser, server, admin)
Regla #8: Supabase
Browser client para Client Components
Server client para Server Components
Admin client SOLO en Server Actions con verificación de rol
NUNCA exponer service_role_key al frontend
RLS ya configurado — confiar en las políticas
Regla #9: Roles de usuario
super_admin: acceso total (el desarrollador)
admin: CRUD categorías, productos, settings (el dueño)
editor: solo toggle is_available en productos (personal)
Frontend público: sin auth, lee datos vía anon key
Admin PWA: requiere auth, protege rutas por rol
Regla #10: Frontend vs Admin
Frontend (público): NO es PWA, Server Components, ISR
Admin (PWA): SÍ es PWA, Client Components, Service Worker
Rutas admin bajo /admin/*
Layout diferente para cada sección
Prohibiciones absolutas
Lógica duplicada
Diseño genérico tipo "template"
Ignorar accesibilidad (ARIA, contraste, navegación teclado)
Magic numbers o valores hardcodeados
Dependencias innecesarias
Framer Motion para animaciones (CSS-only)
Lottie para animaciones
console.log en producción
Any type en TypeScript
Negro puro (#000000) o blanco puro (#FFFFFF) como fondo o texto principal
