DESIGN PRINCIPLES — M&M Premium Menu
Filosofía: Cinematic Minimalism
Premium no es agregar, es reducir. Cada elemento visual debe justificar su existencia. Si se puede quitar sin perder funcionalidad, se quita.

Principios fundamentales
1. Restricción sobre decoración
Gradientes: PROHIBIDOS
Glassmorphism / blur: PROHIBIDO
Sombras decorativas: solo las mínimas necesarias para profundidad
Animaciones: 150-250ms, ease-out, solo en interacciones
Máximo 3 elementos decorativos por pantalla
2. Intencionalidad sobre tendencia
Cada decisión visual debe tener un propósito funcional
No agregar features porque "queda lindo"
Diseño mobile-first, oscuro-first
3. Rendimiento emocional
La velocidad de carga ES parte del diseño
Skeleton screens, NO spinners
Transiciones sutiles que comunican estado
60fps sin jank en dispositivos de gama media
Paleta de colores
Dark mode (default)
Base: #111111 (fondo principal — gris profundo, suave a la vista)
Surface: #1A1A1A (tarjetas, superficies elevadas)
Surface Alt: #222222 (elementos elevados adicionales)
Surface Hover: #252525 (hover sobre superficies)
Border: #2A2A2A (bordes sutiles)
Text Primary: #F0F0F0 (texto principal — blanco suave, no puro)
Text Secondary: #999999 (texto secundario)
Text Muted: #666666 (texto deshabilitado o captions)
Accent: #C8A96E (dorado — premium)
Accent Hover: #D4B87A (dorado hover)
Accent Subtle: rgba(200, 169, 110, 0.15) (fondo accent sutil)
Success: #22C55E (disponible)
Danger: #EF4444 (no disponible)
Light mode
Base: #FAFAFA (fondo principal — off-white, no puro)
Surface: #F0F0F0 (tarjetas, superficies elevadas)
Surface Alt: #E8E8E8 (elementos elevados adicionales)
Surface Hover: #E0E0E0 (hover sobre superficies)
Border: #D4D4D4 (bordes sutiles)
Text Primary: #1A1A1A (texto principal — casi negro, no puro)
Text Secondary: #666666 (texto secundario)
Text Muted: #999999 (texto deshabilitado o captions)
Accent: #C8A96E (se mantiene dorado)
Accent Hover: #B8964E (dorado más oscuro en light)
Accent Subtle: rgba(200, 169, 110, 0.12) (fondo accent sutil)
Success: #16A34A
Danger: #DC2626
Tipografía
Cabinet Grotesk — Headings
Categorías, títulos, precios
Pesos: Bold (700) para títulos, Medium (500) para subtítulos
Tamaños: 24px categorías, 18px subcategorías, 16px precios
Manrope — Body
Descripciones, texto general, UI
Pesos: Regular (400) body, Medium (500) labels, SemiBold (600) botones
Tamaños: 14px body, 12px captions, 16px inputs
Espaciado — Grilla 8px
4px: micro-espacios (iconos adyacentes)
8px: elementos relacionados
16px: separación entre elementos
24px: separación entre secciones
32px: separación entre bloques grandes
48px: separación entre pantallas conceptuales
Componentes específicos
Header
Altura: 56px
Sticky con backdrop sutil
Dark mode: fondo #111111 con opacity 0.95
Light mode: fondo #FAFAFA con opacity 0.95
Border bottom: 1px solid var(--border)
CategoryCard — Horizontal
Imagen izquierda (80×80px), sin fondo, WebP
Nombre + descripción derecha
SIN cantidad de productos
Tacto: escala sutil al presionar (transform: scale(0.98), 150ms)
Border radius: 12px
ProductCard — Horizontal
Miniatura izquierda (64×64px)
Nombre, descripción corta, precio derecha
Precio siempre visible, accent color
Si no disponible: opacity reducida + badge "No disponible"
Border radius: 12px
ProductModal
Fondo oscuro con blur mínimo (solo aquí se permite blur, es overlay)
Imagen grande arriba
Nombre, descripción completa, precio destacado
Botón cerrar y volver al inicio
Animación: slide-up 200ms ease-out
Intro Animation
Logo centrado + texto del brand
Duración máxima: 1.5 segundos
Se puede skippear con touch
Solo primera vez por sesión (sessionStorage flag)
Animación: CSS-only (fade-in + scale), NO Lottie, NO Framer Motion
Toggle Dark/Light
Icono sol/luna
Transición suave 200ms
Persistencia en localStorage
Default: dark
Reglas de imagen
Tipo	Formato	Tamaño	Peso máx	Fondo
Categoría	WebP	400×400px	50KB	Transparente
Producto	WebP	300×300px	100KB	Con o sin fondo
Logo brand	SVG/WebP	Variable	20KB	Transparente
OG Image	WebP/PNG	1200×630px	200KB	Con fondo
Anti-patrones (PROHIBIDO)
Spinners de carga → usar skeleton screens
Scroll horizontal en tarjetas de categoría → lista vertical
Conteo de productos en tarjetas de categoría
Imágenes de fondo en tarjetas
Parallax, scroll snap agresivo
Popups, banners, notificaciones push
Autoplay de cualquier tipo
Texto justificado (usar left-align)
Mayúsculas sostenidas en body (solo labels cortos)
Métricas de rendimiento
FCP < 1.2s
TTI < 2.0s
LCP < 2.0s
Bundle JS < 150KB (gzipped)
60fps sin jank (los 120fps se benefician automáticamente)