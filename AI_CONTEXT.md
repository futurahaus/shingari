# AI Context for Shingari Project

## Project Overview

Shingari es un monorepo gestionado con Yarn Workspaces, compuesto por una aplicación backend (NestJS) y una aplicación frontend (Next.js). El proyecto utiliza TypeScript de forma extensiva.

## Backend (`apps/backend`)

Aplicación construida con NestJS. **Todas las rutas de la API del backend están prefijadas con `/api`** (configurado mediante `app.setGlobalPrefix('api');` en `main.ts`).

### Estructura Principal de `apps/backend/src`:

-   **`main.ts`**: Punto de entrada de la aplicación NestJS. Configura el servidor, middleware global, y arranca la aplicación.
-   **`app.module.ts`**: Módulo raíz de la aplicación. Importa otros módulos principales.
-   **`app.controller.ts`**: Controlador raíz simple.
-   **`app.service.ts`**: Servicio raíz simple.
-   **`config/`**: Directorio para archivos de configuración (probablemente para `ConfigModule` de NestJS).
-   **`middleware/`**: Directorio para middlewares personalizados.
-   **`modules/`**: Directorio principal que contiene los módulos de la aplicación.
    -   **`auth/`**: Módulo de autenticación.
        -   Responsable del registro, login, validación de usuarios, generación y refresco de tokens JWT.
        -   Utiliza Supabase para la gestión de usuarios y JWT para la gestión de sesiones.
        -   `auth.service.ts`: Lógica de negocio.
        -   `auth.controller.ts`: Endpoints HTTP.
        -   `auth.module.ts`: Definición del módulo.
        -   `strategies/jwt.strategy.ts`: Estrategia de Passport para JWT.
        -   `guards/jwt-auth.guard.ts`: Guard para proteger rutas que requieren autenticación.
        -   `guards/admin.guard.ts`: Guard para proteger rutas que requieren privilegios de administrador. Verifica el rol del usuario contra la base de datos usando PrismaService.
        -   `dto/`: Data Transfer Objects para validación de entradas.
            -   `assign-role.dto.ts`: DTO para asignación de roles (consumer/business).
            -   `complete-profile.dto.ts`: DTO para completar perfil de usuario con información empresarial.
        -   **Funcionalidad de Roles**: Sistema de asignación de roles que permite a los usuarios elegir entre 'consumer' y 'business' después de verificar su email.
            -   Endpoint `POST /auth/assign-role`: Asigna un rol específico a un usuario autenticado.
            -   Los roles se almacenan en la tabla `roles` y se relacionan con usuarios a través de `user_roles`.
            -   Manejo automático de roles duplicados y creación de roles si no existen.
            -   **Redirección basada en roles**:
                -   Usuarios con rol 'consumer' (Consumidor Final) son redirigidos a `/dashboard`
                -   Usuarios con rol 'business' (Empresa) son redirigidos a `/complete-profile`
        -   **Funcionalidad de Perfil Completo**: Sistema para completar información empresarial de usuarios.
            -   Endpoint `PUT /auth/profile`: Actualiza el perfil del usuario autenticado.
            -   Los datos básicos (nombre, apellidos, ciudad, provincia, país, código postal, teléfono) se almacenan en la tabla `public.users`.
            -   Los datos específicos de empresa (nombre comercial, nombre fiscal, NIF, direcciones, cómo nos conoció) se almacenan en los metadatos del usuario en `auth.users`.
            -   Manejo de errores y validación de datos de entrada.
    -   **`database/`**: Módulo para la gestión de la base de datos.
        -   Probablemente encapsula la conexión y la lógica de acceso a la base de datos (ej. Prisma o Supabase client).
        -   `database.service.ts`: Servicio para interactuar con la base de datos.
        -   `database.logger.ts`: Logger específico para la base de datos.
    -   **`prisma/`**: Módulo para la gestión de Prisma ORM.
        -   `prisma.service.ts`: Servicio que extiende PrismaClient para interactuar con la base de datos.
        -   `prisma.module.ts`: Definición del módulo Prisma.
        -   `prisma.controller.ts`: Controlador simple para Prisma.
    -   **`user/`**: Módulo para la gestión de usuarios (posiblemente perfiles, etc., más allá de la autenticación pura).
        -   `user.service.ts`: Lógica de negocio para gestión de usuarios, incluyendo CRUD completo y gestión de roles.
        -   `user.controller.ts`: Endpoints HTTP para gestión de usuarios.
            -   `PUT /user/profile`: Actualizar perfil del usuario autenticado.
            -   `GET /user/profile`: Obtener perfil del usuario autenticado.
            -   **Endpoints de Administración** (protegidos por AdminGuard):
                -   `GET /user/admin/all`: Obtener todos los usuarios del sistema.
                -   `GET /user/admin/:id`: Obtener usuario específico por ID.
                -   `POST /user/admin/create`: Crear nuevo usuario con roles.
                -   `PUT /user/admin/:id`: Actualizar usuario existente.
                -   `DELETE /user/admin/:id`: Eliminar usuario del sistema.
        -   `user.module.ts`: Definición del módulo.
        -   **Funcionalidad de Gestión de Usuarios**: Sistema completo de administración de usuarios.
            -   **Acceso a auth.users**: Utiliza Prisma para acceder directamente al esquema `auth.users` de Supabase.
            -   **CRUD Completo**: Crear, leer, actualizar y eliminar usuarios con integración con Supabase Auth.
            -   **Gestión de Roles**: Asignación y eliminación de roles (admin, business, consumer) con creación automática de roles si no existen.
            -   **Integración con Supabase**: Creación y actualización de usuarios en Supabase Auth con sincronización de roles en la base de datos local.
            -   **Datos Enriquecidos**: Incluye información de verificación de email, último acceso, metadatos del usuario y roles asignados.
    -   **`products/`**: Módulo para la gestión de productos.
        -   `products.service.ts`: Lógica de negocio para productos, incluyendo CRUD, listado público con filtros/paginación, gestión de descuentos y **soporte multilenguaje**.
        -   `products.controller.ts`: Endpoints HTTP para productos.
            -   `GET /products`: Listado público de productos (paginado, búsqueda por nombre, filtro por categorías, orden por precio, **soporte multilenguaje**).
            -   `GET /products/:id`: Obtener un producto específico (**soporte multilenguaje**).
            -   `POST /products`: Crear producto (protegido por AdminGuard).
            -   `PUT /products/:id`: Actualizar producto (protegido por AdminGuard).
            -   `DELETE /products/:id`: Eliminar lógicamente un producto (protegido por AdminGuard).
            -   `GET /products/discounts`: Obtener descuentos de productos para el usuario autenticado (puede filtrar por `productId`).
            -   `GET /products/categories`: Obtener categorías de productos (**soporte multilenguaje**).
            -   `GET /products/categories/parents`: Obtener categorías padre (**soporte multilenguaje**).
            -   **Endpoints de Traducciones** (protegidos por AdminGuard):
                -   `POST /products/:id/translations`: Crear traducción para un producto.
                -   `PUT /products/:id/translations/:locale`: Actualizar traducción de un producto.
                -   `DELETE /products/:id/translations/:locale`: Eliminar traducción de un producto.
                -   `POST /products/categories/:id/translations`: Crear traducción para una categoría.
                -   `PUT /products/categories/:id/translations/:locale`: Actualizar traducción de una categoría.
                -   `DELETE /products/categories/:id/translations/:locale`: Eliminar traducción de una categoría.
        -   `products.module.ts`: Definición del módulo.
        -   `dto/`: Data Transfer Objects para productos (creación, actualización, consulta, respuesta, descuentos, **traducciones**).
            -   `locale.dto.ts`: DTO para manejo de parámetros de idioma.
            -   `create-product-translation.dto.ts`: DTO para crear traducciones de productos.
            -   `create-category-translation.dto.ts`: DTO para crear traducciones de categorías.
        -   **Funcionalidad de Productos**: Implementación de catálogo de productos con funcionalidades públicas y protegidas.
            -   **Endpoints Públicos**: Los endpoints `GET /products` y `GET /products/:id` son públicos y no requieren autenticación.
            -   **Precios Dinámicos**: Los precios se calculan dinámicamente basados en el rol del usuario (precio al por mayor para usuarios 'business').
            -   **Gestión de IVA**: Los usuarios con rol 'business' ven precios al por mayor SIN IVA incluido, mientras que otros usuarios ven precios con IVA incluido.
            -   **Descuentos Personalizados**: Sistema de descuentos específicos por usuario con fechas de validez.
            -   **Filtros y Paginación**: Soporte para filtrado por categorías, búsqueda por nombre, ordenamiento por precio y paginación.
            -   **Soporte Multilenguaje**: Sistema completo de traducciones para productos y categorías.
                -   **Idiomas Soportados**: Español (es) por defecto y Chino (zh).
                -   **Traducciones de Productos**: Nombre y descripción traducibles.
                -   **Traducciones de Categorías**: Nombre traducible.
                -   **Búsqueda Multilenguaje**: Búsqueda en contenido original y traducido.
                -   **Fallback**: Si no existe traducción, se usa el contenido original.
                -   **Gestión de Traducciones**: CRUD completo para traducciones (solo administradores).
    -   **`favorites/`**: Módulo para la gestión de productos favoritos de los usuarios.
        -   `favorites.service.ts`: Lógica de negocio para favoritos, incluyendo agregar, eliminar y obtener favoritos del usuario.
        -   `favorites.controller.ts`: Endpoints HTTP para favoritos.
            -   `POST /favorites`: Agregar producto a favoritos (protegido por JwtAuthGuard).
            -   `DELETE /favorites/:productId`: Eliminar producto de favoritos (protegido por JwtAuthGuard).
            -   `GET /favorites`: Obtener lista de favoritos del usuario (protegido por JwtAuthGuard).
            -   `GET /favorites/:productId/check`: Verificar si un producto está en favoritos (protegido por JwtAuthGuard).
        -   `favorites.module.ts`: Definición del módulo.
        -   `dto/`: Data Transfer Objects para favoritos (agregar favorito, respuesta de favoritos, mensajes simples).
        -   **Funcionalidad de Favoritos**: Sistema completo de favoritos para usuarios autenticados.
            -   **Validación de Productos**: Verifica que el producto exista antes de agregarlo a favoritos.
            -   **Prevención de Duplicados**: Evita agregar el mismo producto múltiples veces a favoritos.
            -   **Gestión Completa**: Permite agregar, eliminar, listar y verificar estado de favoritos.
            -   **Información Enriquecida**: Incluye datos completos del producto al obtener favoritos.
            -   **Protección por JWT**: Todos los endpoints requieren autenticación.
-   **`test/`**: Contiene tests end-to-end (e2e).
-   **`generated/`**: Posiblemente para artefactos generados (ej. cliente Prisma).

### Tecnologías Clave Backend:

-   NestJS
-   TypeScript
-   Supabase (para autenticación y posiblemente base de datos)
-   Prisma ORM (para acceso a base de datos con soporte multi-esquema)
-   JWT (JSON Web Tokens)
-   Passport.js (para estrategias de autenticación)
-   Jest (para testing)
-   ESLint, Prettier (para linting y formateo)

## Frontend (`apps/frontend`)

Aplicación construida con Next.js.

### Estructura Principal de `apps/frontend/src`:

-   **`app/`**: Directorio principal para la estructura de rutas y componentes de Next.js (App Router).
    -   `page.tsx`: Página principal.
    -   `layout.tsx`: Layout principal de la aplicación.
    -   `auth/verify-email/page.tsx`: Página de verificación de email con integración de selección de roles.
    -   `complete-profile/page.tsx`: Página para completar perfil empresarial con formulario de datos.
    -   `dashboard/page.tsx`: Panel de control del usuario autenticado.
    -   `dashboard/perfil/page.tsx`: Página de perfil del usuario autenticado.
    -   `admin/usuarios/page.tsx`: Página de administración de usuarios con funcionalidad CRUD completa.
        -   **Gestión de Usuarios**: Interfaz completa para administrar usuarios del sistema.
        -   **Tabla de Usuarios**: Muestra todos los usuarios con información detallada (email, roles, estado de verificación, último acceso).
        -   **CRUD Completo**: Modales para crear, editar y eliminar usuarios con validación de formularios.
        -   **Gestión de Roles**: Asignación y eliminación de roles directamente desde la interfaz.
        -   **Integración con API**: Utiliza los endpoints del backend para todas las operaciones.
        -   **Estados de Carga**: Indicadores de carga y manejo de errores con opción de reintento.
        -   **Confirmaciones**: Modales de confirmación para acciones destructivas como eliminar usuarios.
    -   `products/page.tsx`: Página pública de productos con filtros y paginación.
    -   `products/[id]/page.tsx`: Página de detalle de producto específico.
    -   `ui/page.tsx`: Página de demostración de componentes UI con ejemplos de uso.
    -   `ui/`: Directorio del sistema de diseño UI.
        -   `colors.ts`: Paleta de colores oficial del proyecto con colores principales, secundarios, estados y escala de grises.
        -   `ColorPalette.tsx`: Componente React que muestra visualmente toda la paleta de colores.
        -   `README.md`: Documentación completa del sistema de diseño UI.
        -   `components/`: Componentes UI reutilizables.
            -   `Button.tsx`: Componente de botón con soporte para tipos primario/secundario e iconos.
-   **`components/`**: Componentes reutilizables de React.
    -   Probablemente organizados por funcionalidad o tipo (ej. `ui/`, `common/`, `auth/`).
    -   `auth/RoleSelectionModal.tsx`: Modal para selección de roles (consumer/business) después de verificación de email.
    -   `auth/LoginModal.tsx`: Modal de inicio de sesión con soporte para redirección post-login.
    -   `auth/HashBasedLoginModal.tsx`: Componente que maneja la apertura automática del modal de login basado en hash de URL.
    -   `auth/ForgotPasswordModal.tsx`: Modal para recuperación de contraseña.
    -   `layout/SearchHeader.tsx`: Header con barra de búsqueda y botón de login.
    -   `layout/Navbar.tsx`: Barra de navegación.
    -   `layout/Footer.tsx`: Pie de página.
    -   `layout/Sidebar.tsx`: Barra lateral para páginas del dashboard.
    -   `ProductCard.tsx`: Componente para mostrar información de productos.
-   **`lib/`**: Librerías auxiliares y utilidades.
    -   `api.ts`: Cliente para interactuar con el backend (maneja tokens, refresh, etc.).
-   **`contexts/`**: React Contexts para gestión de estado global (ej. `AuthContext`).
-   **`middleware.ts`**: Middleware de Next.js para manejar lógica en el servidor antes de renderizar (ej. protección de rutas).
-   **`public/`**: Archivos estáticos.

### Tecnologías Clave Frontend:

-   Next.js
-   React
-   TypeScript
-   Jest y React Testing Library (para testing)
-   ESLint, Prettier (para linting y formateo)
-   Tailwind CSS (inferido por `postcss.config.mjs`, es común en proyectos Next.js)

## Consideraciones Generales

-   **Autenticación**: Flujo de autenticación basado en JWT, con tokens de acceso y refresco. El backend maneja la lógica de Supabase.
    -   **Sistema de Login Modal**: Implementación de modal de login que se abre automáticamente cuando la URL contiene `#login` con parámetros opcionales `?from=/ruta`.
    -   **Redirección Post-Login**: Después del login exitoso, el usuario es redirigido a la ruta especificada en el parámetro `from` o al dashboard por defecto.
    -   **Protección de Rutas**: Las páginas protegidas verifican la autenticación antes de hacer llamadas a la API y redirigen al login si es necesario.
-   **Base de Datos**: La interacción con la base de datos se realiza principalmente a través de Prisma ORM, utilizando el archivo `schema.prisma` ubicado en `apps/backend/prisma/`. El `DatabaseModule` en el backend probablemente encapsula la lógica de acceso a la base de datos utilizando el cliente Prisma generado.
    -   **Acceso Multi-Esquema**: Prisma está configurado para acceder tanto al esquema `auth` (usuarios de Supabase) como al esquema `public` (datos de la aplicación).
    -   **Sincronización de Usuarios**: Los usuarios se crean en Supabase Auth y se sincronizan con roles en la base de datos local.
    -   **Sistema de Traducciones**: Nuevas tablas `product_translations` y `category_translations` para soporte multilenguaje.
        -   **product_translations**: Almacena traducciones de nombre y descripción de productos.
        -   **category_translations**: Almacena traducciones de nombre de categorías.
        -   **Relaciones**: Las traducciones están relacionadas con sus entidades principales mediante claves foráneas.
        -   **Índices**: Optimización con índices en `product_id`, `category_id` y `locale`.
-   **Sistema de Roles**: Implementación de roles de usuario (consumer/business/admin) con asignación automática después de la verificación de email.
    -   Los roles se almacenan en la tabla `roles` y se relacionan con usuarios a través de `user_roles`.
    -   Flujo de verificación de email mejorado con modal de selección de roles.
    -   Manejo de roles duplicados y creación automática de roles si no existen.
    -   **Rol de Administrador**: Nuevo rol 'admin' para acceso completo al sistema de gestión de usuarios.
-   **Sistema de Perfiles**: Implementación de perfiles de usuario con información básica y empresarial.
    -   Los datos básicos del usuario se almacenan en la tabla `public.users` (nombre, apellidos, ciudad, provincia, país, código postal, teléfono).
    -   Los datos específicos de empresa se almacenan en los metadatos del usuario en `auth.users` (nombre comercial, nombre fiscal, NIF, direcciones, cómo nos conoció).
    -   Formulario de completar perfil disponible en `/complete-profile` para usuarios con rol 'business'.
-   **Sistema de Gestión de Usuarios**: Sistema completo de administración de usuarios para administradores.
    -   **Acceso Directo a auth.users**: Utiliza Prisma para acceder directamente a los usuarios de Supabase Auth.
    -   **CRUD Completo**: Crear, leer, actualizar y eliminar usuarios con integración completa con Supabase.
    -   **Gestión de Roles**: Asignación y eliminación de roles desde la interfaz de administración.
    -   **Información Enriquecida**: Muestra estado de verificación de email, último acceso, roles asignados y metadatos del usuario.
    -   **Interfaz Intuitiva**: Tabla con filtros, modales para operaciones CRUD, y confirmaciones para acciones destructivas.
-   **Sistema de Productos**: Implementación de catálogo de productos con funcionalidades públicas y protegidas.
    -   **Endpoints Públicos**: Los endpoints `GET /products` y `GET /products/:id` son públicos y no requieren autenticación.
    -   **Precios Dinámicos**: Los precios se calculan dinámicamente basados en el rol del usuario (precio al por mayor para usuarios 'business').
    -   **Gestión de IVA**: Los usuarios con rol 'business' ven precios al por mayor SIN IVA incluido, mientras que otros usuarios ven precios con IVA incluido.
    -   **Descuentos Personalizados**: Sistema de descuentos específicos por usuario con fechas de validez.
    -   **Filtros y Paginación**: Soporte para filtrado por categorías, búsqueda por nombre, ordenamiento por precio y paginación.
    -   **Soporte Multilenguaje**: Sistema completo de traducciones para productos y categorías.
        -   **Idiomas Soportados**: Español (es) por defecto y Chino (zh).
        -   **Parámetro de Locale**: Todos los endpoints públicos aceptan parámetro `locale` (ej: `?locale=zh`).
        -   **Traducciones de Productos**: Nombre y descripción traducibles con fallback al contenido original.
        -   **Traducciones de Categorías**: Nombre traducible con fallback al contenido original.
        -   **Búsqueda Multilenguaje**: Búsqueda en contenido original y traducido simultáneamente.
        -   **Gestión de Traducciones**: CRUD completo para traducciones (solo administradores).
        -   **Cache Inteligente**: Cache separado por locale para optimizar rendimiento.
-   **Testing**: Ambos proyectos tienen configuraciones de Jest. El backend tiene tests unitarios para servicios y tests e2e. El frontend tiene tests para componentes.
- **Endpoints**: Se pueden encontrar los endpoints disponibles para dev en http://localhost:3001/api-docs

## Cómo Mantener Actualizado este Archivo

-   Al introducir nuevos módulos, actualizar las secciones `modules/` (backend) o la estructura de `src/` (frontend).
-   Al cambiar tecnologías clave (ej. ORM, librería de estado), actualizar las listas de "Tecnologías Clave".
-   Al modificar flujos importantes (ej. autenticación, pagos), actualizar la descripción correspondiente.

---

*Este archivo fue generado y actualizado el 2025-01-03 22:30:00.*
*Última actualización: 2025-01-17 - Implementado sistema completo de soporte multilenguaje para productos y categorías.*

*Por favor, actualiza la fecha y cualquier información relevante cuando hagas cambios significativos.*