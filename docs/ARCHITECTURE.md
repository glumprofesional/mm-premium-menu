ARCHITECTURE — M&M Premium Menu
Estructura de directorios
src/
├── app/
│ ├── layout.tsx # Root layout (fuentes, tema)
│ ├── page.tsx # Home = Categorías
│ ├── categoria/
│ │ └── [slug]/
│ │ └── page.tsx # Productos por categoría
│ ├── admin/
│ │ ├── layout.tsx # Admin layout (PWA, auth)
│ │ ├── page.tsx # Dashboard admin
│ │ ├── categorias/
│ │ │ └── page.tsx # CRUD categorías
│ │ ├── productos/
│ │ │ └── page.tsx # CRUD productos
│ │ └── configuracion/
│ │ └── page.tsx # Settings
│ └── globals.css # Design tokens + Tailwind
│
├── components/
│ ├── ui/ # Primitivos: Button, Input, Modal, Toggle, Card
│ ├── layout/ # Header, Footer, AdminSidebar
│ └── shared/ # ProductCard, CategoryCard, SearchBar
│
├── features/
│ ├── menu/ # Lógica del menú público
│ │ ├── components/ # CategoryList, ProductList, ProductModal
│ │ └── hooks/ # useCategories, useProducts
│ ├── catalog/ # Lógica del catálogo admin
│ │ ├── components/ # CategoryForm, ProductForm
│ │ └── hooks/ # useCRUD
│ └── auth/ # Autenticación y roles
│ ├── components/ # LoginForm, RoleGuard
│ └── hooks/ # useAuth, useRole
│
├── lib/
│ ├── supabase/
│ │ ├── client.ts # Browser client
│ │ ├── server.ts # Server client
│ │ └── admin.ts # Admin client (service role)
│ └── utils.ts # Helpers generales
│
├── services/ # Funciones de acceso a datos
│ ├── categories.ts # getCategories, etc.
│ ├── products.ts # getProducts, etc.
│ └── settings.ts # getSettings, etc.
│
├── hooks/ # Hooks compartidos
├── store/ # Estado global (si se necesita)
├── types/ # Tipos TypeScript
│ ├── category.ts
│ ├── product.ts
│ ├── profile.ts
│ └── settings.ts
│
└── utils/ # Utilidades puras
├── format-price.ts
└── slugify.ts

## Esquema de base de datos

### categories
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK, auto-gen |
| name | TEXT | Nombre de la categoría |
| slug | TEXT | Único, para URLs |
| description | TEXT | Descripción corta |
| image_url | TEXT | Imagen sin fondo (WebP, 400×400px, <50KB) |
| sort_order | INTEGER | Orden de visualización |
| is_active | BOOLEAN | Visibilidad en el menú |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-actualizado por trigger |

### products
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK, auto-gen |
| category_id | UUID | FK → categories, CASCADE |
| name | TEXT | Nombre del producto |
| slug | TEXT | Único, para URLs |
| description | TEXT | Descripción |
| price | NUMERIC(10,2) | Precio en ARS |
| image_url | TEXT | Imagen del producto |
| family | TEXT | Agrupación (ej: "Quilmes", "Coca-Cola") |
| is_available | BOOLEAN | Disponibilidad (toggle en admin) |
| sort_order | INTEGER | Orden dentro de la categoría |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-actualizado por trigger |

### profiles
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK = auth.users.id |
| email | TEXT | |
| full_name | TEXT | |
| role | TEXT | 'super_admin' | 'admin' | 'editor' |
| avatar_url | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-actualizado por trigger |

### settings
| Campo | Tipo | Notas |
|-------|------|-------|
| id | UUID | PK, auto-gen |
| key | TEXT | Único |
| value | JSONB | Valor flexible |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-actualizado por trigger |

## Roles y permisos

| Rol | Categorías | Productos | Perfiles | Settings |
|-----|-----------|-----------|----------|----------|
| anon (público) | Ver activos | Ver disponibles | — | Ver |
| editor | — | Toggle disponibilidad | — | — |
| admin | CRUD completo | CRUD completo | Ver todos | CRUD |
| super_admin | CRUD completo | CRUD completo | Modificar roles | CRUD |

## Renderizado y datos

- **Server Components por defecto** (frontend público)
- **ISR** con revalidate = 30 segundos (NO Supabase Realtime)
- **Client Components** solo para: header interactivo, búsqueda, modal, toggle tema, admin
- **Server Actions** para mutaciones (crear, actualizar, eliminar)

## Git branching
main (producción)
└── develop (desarrollo)

- Todo desarrollo sale de develop
- Merge a main solo para deploy a producción
- Deploy automático en Vercel al mergear a main

## Nomenclatura

- Carpetas: kebab-case (categoria/, product-card/)
- Componentes: PascalCase (CategoryCard.tsx, ProductModal.tsx)
- Funciones: camelCase (getCategories, formatPrice)
- Hooks: camelCase con prefijo use (useCategories, useAuth)
- Tipos: PascalCase (Category, Product, Profile)
- Constantes: UPPER_SNAKE_CASE (ACCENT_COLOR,REVALIDATE_INTERVAL)