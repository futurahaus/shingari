# Estructura General del Proyecto

- /app
  - /admin
    - /dashboard
      - page.tsx (Dashboard de administrador, solo accesible para usuarios con rol 'admin')
      - layout.tsx (Sidebar con opciones: Dashboard, Usuarios, Productos)
  - /app/(main): Contiene las páginas principales de la app (productos, dashboard, perfil, etc)
  - /app/carrito: Página dedicada al carrito de compras, muestra los productos agregados siguiendo el diseño de Figma.
- /contexts
  - AuthContext.tsx (Incluye 'role' en el usuario para control de acceso por roles)

## Notas
- El dashboard de administrador usará datos mock inicialmente.
- El acceso a /admin/dashboard estará protegido para solo usuarios con rol 'admin'.
- El sidebar del admin solo muestra: Dashboard, Usuarios, Productos. 