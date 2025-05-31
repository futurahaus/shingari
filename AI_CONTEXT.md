# AI Context for Shingari Project

## Project Overview

Shingari es un monorepo gestionado con Yarn Workspaces, compuesto por una aplicación backend (NestJS) y una aplicación frontend (Next.js). El proyecto utiliza TypeScript de forma extensiva.

## Backend (`apps/backend`)

Aplicación construida con NestJS.

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
        -   `guards/jwt-auth.guard.ts`: Guard para proteger rutas.
        -   `dto/`: Data Transfer Objects para validación de entradas.
    -   **`database/`**: Módulo para la gestión de la base de datos.
        -   Probablemente encapsula la conexión y la lógica de acceso a la base de datos (ej. Prisma o Supabase client).
        -   `database.service.ts`: Servicio para interactuar con la base de datos.
        -   `database.logger.ts`: Logger específico para la base de datos.
    -   **`user/`**: Módulo para la gestión de usuarios (posiblemente perfiles, etc., más allá de la autenticación pura).
        -   `user.service.ts`: Lógica de negocio.
        -   `user.controller.ts`: Endpoints HTTP.
        -   `user.module.ts`: Definición del módulo.
-   **`test/`**: Contiene tests end-to-end (e2e).
-   **`generated/`**: Posiblemente para artefactos generados (ej. cliente Prisma).

### Tecnologías Clave Backend:

-   NestJS
-   TypeScript
-   Supabase (para autenticación y posiblemente base de datos)
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
-   **`components/`**: Componentes reutilizables de React.
    -   Probablemente organizados por funcionalidad o tipo (ej. `ui/`, `common/`, `auth/`).
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
-   **Base de Datos**: La interacción con la base de datos parece centralizada a través del `DatabaseModule` en el backend. No se ha especificado si se usa Prisma directamente en el `schema.prisma` o si se interactúa con Supabase a través de su cliente JS. *(Nota: Previamente trabajamos con un `schema.prisma`, pero fue eliminado, por lo que el enfoque actual puede ser completamente basado en el cliente de Supabase)*.
-   **Testing**: Ambos proyectos tienen configuraciones de Jest. El backend tiene tests unitarios para servicios y tests e2e. El frontend tiene tests para componentes.

## Cómo Mantener Actualizado este Archivo

-   Al introducir nuevos módulos, actualizar las secciones `modules/` (backend) o la estructura de `src/` (frontend).
-   Al cambiar tecnologías clave (ej. ORM, librería de estado), actualizar las listas de "Tecnologías Clave".
-   Al modificar flujos importantes (ej. autenticación, pagos), actualizar la descripción correspondiente.

---

*Este archivo fue generado y actualizado por última vez el 2025-05-31 14:53:00.*
*Por favor, actualiza la fecha y cualquier información relevante cuando hagas cambios significativos.* 