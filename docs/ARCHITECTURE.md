# Arquitectura de Software: Menú Premium M&M

## 1. Filosofía Arquitectónica: Performance-First & Modular Reusability

La arquitectura del proyecto está diseñada bajo el paradigma de **Clean Architecture** adaptado al ecosistema moderno de Next.js (App Router). El objetivo principal es garantizar una **velocidad extrema** (performance técnica) y una **fluidez premium** (performance emocional), manteniendo una base de código modular que permita la escalabilidad y la reutilización para futuros clientes del sector hostelería.

### Pilares Fundamentales:
*   **Separación de Responsabilidades:** Clara división entre lógica de negocio, acceso a datos y presentación.
*   **Feature-Based Architecture:** La estructura está organizada por "características" (features) para facilitar el mantenimiento y el escalado horizontal.
*   **Minimalismo de JavaScript:** Estrategia agresiva para enviar el mínimo JS posible al cliente.
*   **TypeScript Strict:** Tipado estricto en todo el proyecto para minimizar errores en tiempo de ejecución y maximizar la mantenibilidad asistida por IA.

---

## 2. Estructura de Directorios (Feature-Based)

Adoptamos una estructura clara que separa el núcleo de la aplicación de las características específicas:

```text
src/
├── app/                  # Next.js App Router (Routing & Layouts)
│   ├── (public)/         # Rutas públicas (Menú QR)
│   ├── (admin)/          # Rutas de administración (Protegidas)
│   └── api/              # API Routes (Serverless Functions)
├── components/           # Componentes UI Reutilizables
│   ├── ui/               # Componentes atómicos (Botones, Inputs, etc.)
│   ├── layout/           # Componentes de estructura (Nav, Footer)
│   └── shared/           # Componentes compartidos entre features
├── features/             # Lógica de negocio organizada por dominio
│   ├── menu/             # Feature: Visualización del menú
│   ├── catalog/          # Feature: Gestión de productos y categorías
│   └── auth/             # Feature: Autenticación y seguridad
├── lib/                  # Configuraciones de librerías externas (Supabase, etc.)
├── services/             # Capa de servicios (Comunicación con APIs/DB)
├── hooks/                # Hooks personalizados (Lógica de UI reutilizable)
├── store/                # Gestión de estado global (si fuera necesario)
├── types/                # Definiciones de tipos TypeScript globales
└── utils/                # Funciones de utilidad puras
```

---

## 3. Capas de la Aplicación

### 3.1. UI Layer (Capa de Presentación)
*   **React Server Components (RSC):** Utilizados por defecto para el renderizado inicial, fetching de datos y componentes estáticos. Maximiza la velocidad y reduce el bundle size.
*   **Client Components:** Reservados exclusivamente para interactividad (formularios, botones con estado, efectos táctiles). Marcados con `"use client"`.
*   **Atomic Design:** Los componentes se construyen desde lo más simple (UI atoms) hasta lo complejo (features).

### 3.2. Data Layer (Capa de Datos)
*   **Supabase:** Fuente de verdad principal (PostgreSQL, Auth, Storage).
*   **Server Actions:** Método preferido para mutaciones de datos (POST, PATCH, DELETE) desde el cliente, eliminando la necesidad de APIs REST tradicionales internas.
*   **Direct DB Access:** Los Server Components acceden directamente a los servicios de datos para el renderizado.

### 3.3. Services Layer (Lógica de Negocio)
*   Los servicios encapsulan la comunicación con Supabase y lógica compleja. Esto permite que la UI sea "tonta" y que los servicios sean testeables y reutilizables.

---

## 4. Estrategia de Componentes Next.js

### Cuándo usar Server Components (Default):
*   Fetching de datos inicial.
*   Acceso a recursos del servidor (base de datos, variables de entorno secretas).
*   Componentes que no requieren interactividad (textos, imágenes estáticas, layouts).

### Cuándo usar Client Components:
*   Interactividad (onClick, onChange, hooks como `useState`, `useEffect`).
*   Uso de APIs del navegador (localStorage, geolocalización).
*   Animaciones complejas que dependen del estado del cliente.

**Regla de Oro:** Mantener los Client Components en las "hojas" del árbol de componentes para evitar que grandes porciones de la app se conviertan en client-side rendering.

---

## 5. Estrategia de Optimización y Performance

### 5.1. Image Optimization
*   Uso estricto del componente `next/image`.
*   Formatos modernos (WebP/AVIF).
*   Lazy loading automático y placeholders de baja resolución (LQIP) para evitar Cumulative Layout Shift (CLS).

### 5.2. Caching & Incremental Static Regeneration (ISR)
*   Uso de `fetch` con etiquetas de caché para invalidación selectiva.
*   Páginas de menú cacheadas en el edge para entrega instantánea.

### 5.3. PWA & Offline Support
*   Configuración de Service Workers para asegurar que el menú sea accesible incluso con conectividad intermitente (Scan -> Cache -> View).

---

## 6. Arquitectura Multi-Cliente y Reusabilidad

Para permitir que esta solución sea escalable a otros clientes:
*   **Theme Configuration:** Los estilos (colores, fuentes) se manejan a través de variables de CSS/Tailwind configurables por proyecto.
*   **Modular Features:** Las funcionalidades (ej. sistema de alérgenos, carrito de compras) se activan o desactivan mediante flags de configuración.
*   **Separación de Configuración:** Los datos específicos del cliente (branding, menú) residen en la base de datos, no en el código.

---

## 7. Convenciones de Nomenclatura y Reglas de Código

*   **Carpetas:** `kebab-case`.
*   **Componentes:** `PascalCase.tsx`.
*   **Hooks:** `useCustomHook.ts`.
*   **Funciones/Variables:** `camelCase`.
*   **Strict Types:** No se permite el uso de `any`. Todas las interfaces de datos de la DB deben estar tipadas.
*   **Security:** Variables sensibles (API Keys de servidor) estrictamente en `.env` y nunca expuestas al cliente.

---

## 8. Anti-Patrones a Evitar

*   **Prop Drilling:** Evitar pasar props a través de muchos niveles; usar composición de componentes o contextos específicos.
*   **Over-Engineering:** No añadir librerías innecesarias. Preferir soluciones nativas de Next.js.
*   **Client-Side Fetching:** Evitar `useEffect` para cargar datos iniciales; usar Server Components.
*   **Heavy Animations:** No usar animaciones que bloqueen el hilo principal o degraden el rendimiento en móviles antiguos.
*   **Visual Clutter:** No añadir elementos que no aporten valor directo a la tarea del usuario.

---

## 9. Seguridad y Autenticación

*   **Supabase Auth:** Manejo de sesiones para el panel administrativo.
*   **Row Level Security (RLS):** Implementación estricta en la base de datos para asegurar que los usuarios solo puedan modificar sus propios datos.
*   **Input Validation:** Validación rigurosa tanto en cliente como en servidor (usando librerías como Zod).
