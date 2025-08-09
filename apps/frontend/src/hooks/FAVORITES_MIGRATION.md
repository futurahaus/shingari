# Migración de Favoritos a React Query

## ✅ Cambios Implementados

Se ha migrado el sistema de favoritos para usar React Query, eliminando múltiples requests innecesarios al backend.

### Nuevos Hooks Disponibles

#### 1. `useFavoritesQuery()` - Hook Principal
Reemplaza al anterior `useFavorites()` con mejor gestión de cache y estado.

```tsx
import { useFavoritesQuery } from '@/hooks/useFavoritesQuery';

function MyComponent() {
  const { 
    favorites,           // Array de favoritos
    totalFavorites,      // Número total
    isLoading,          // Estado de carga
    error,              // Errores
    isFavorite,         // Función para verificar
    addToFavorites,     // Agregar producto
    removeFromFavorites, // Remover producto
    toggleFavorite,     // Toggle favorito
    refetch             // Refrescar datos
  } = useFavoritesQuery();
}
```

#### 2. `useFavoritesList()` - Solo Lista
Para obtener únicamente la lista de favoritos.

```tsx
import { useFavoritesList } from '@/hooks/useFavoritesQuery';

function FavoritesList() {
  const { data, isLoading, error } = useFavoritesList();
}
```

#### 3. `useIsFavorite(productId)` - Verificación Individual
Para verificar si un producto específico es favorito.

```tsx
import { useIsFavorite } from '@/hooks/useFavoritesQuery';

function ProductCard({ productId }) {
  const { data, isLoading } = useIsFavorite(productId);
  const isFavorite = data?.isFavorite || false;
}
```

#### 4. `useAddToFavorites()` y `useRemoveFromFavorites()` - Mutaciones
Para operaciones específicas de agregar/remover.

```tsx
import { useAddToFavorites, useRemoveFromFavorites } from '@/hooks/useFavoritesQuery';

function ProductActions({ productId }) {
  const addMutation = useAddToFavorites();
  const removeMutation = useRemoveFromFavorites();
  
  const handleAdd = () => addMutation.mutate(productId);
  const handleRemove = () => removeMutation.mutate(productId);
}
```

#### 5. `useToggleFavorite()` - Toggle
Para alternar el estado de favorito.

```tsx
import { useToggleFavorite } from '@/hooks/useFavoritesQuery';

function FavoriteButton({ productId, isFavorite }) {
  const { toggleFavorite, isLoading } = useToggleFavorite();
  
  const handleClick = () => toggleFavorite(productId, isFavorite);
}
```

### Hook Legacy (Retrocompatibilidad)

El hook original `useFavorites()` sigue funcionando pero ahora usa React Query internamente:

```tsx
import { useFavorites } from '@/hooks/useFavorites';

// Funciona igual que antes, pero optimizado con React Query
function LegacyComponent() {
  const { favorites, isLoading, toggleFavorite } = useFavorites();
}
```

## 🚀 Beneficios

### 1. **Eliminación de Requests Duplicados**
- React Query cachea automáticamente las respuestas
- No se hacen múltiples requests para los mismos datos
- Cache inteligente con invalidación automática

### 2. **Mejor Performance**
- **Stale Time**: 2 minutos para lista, 1 minuto para verificaciones
- **Cache Time**: 5 minutos para lista, 3 minutos para verificaciones
- **Background Refetch**: Actualización automática en segundo plano

### 3. **Optimistic Updates**
- Los cambios se reflejan inmediatamente en la UI
- Cache se actualiza automáticamente tras mutaciones exitosas
- Rollback automático en caso de error

### 4. **Estados Mejorados**
- Loading states más granulares
- Error handling centralizado
- Retry automático en fallos de red

### 5. **Invalidación Inteligente**
- Al agregar/remover favoritos se invalida automáticamente la lista
- Cache de verificaciones individuales se actualiza
- Sincronización automática entre componentes

## 📋 Query Keys

Se implementó un sistema de keys estructurado:

```tsx
const favoritesKeys = {
  all: ['favorites'],
  lists: () => [...favoritesKeys.all, 'list'],
  list: (userId) => [...favoritesKeys.lists(), userId],
  checks: () => [...favoritesKeys.all, 'check'],
  check: (productId) => [...favoritesKeys.checks(), productId],
};
```

## 🔧 Configuración

React Query ya está configurado en el proyecto con:
- **Stale Time**: 5 minutos por defecto
- **Cache Time**: 10 minutos por defecto
- **Retry**: 1 intento
- **Refetch on Window Focus**: Deshabilitado

## 📱 Ejemplos de Uso

Ver archivo: `apps/frontend/src/components/examples/FavoritesExample.tsx`

## ⚡ Migración Recomendada

### Para Nuevos Componentes:
Usar directamente `useFavoritesQuery()` y hooks específicos.

### Para Componentes Existentes:
El hook `useFavorites()` sigue funcionando sin cambios, pero ahora está optimizado.

### Para Mejor Performance:
Migrar gradualmente a los hooks específicos según necesidades:
- Lista completa → `useFavoritesList()`
- Verificación → `useIsFavorite(productId)`
- Acciones → `useToggleFavorite()`