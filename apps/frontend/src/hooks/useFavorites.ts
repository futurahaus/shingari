import { useState, useEffect, useCallback } from 'react';
import { favoritesService, FavoritesListResponse } from '@/lib/favorites';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';

export function useFavorites() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [favorites, setFavorites] = useState<FavoritesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load favorites when user is authenticated
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites(null);
      return;
    }

    setIsLoading(true);
    try {
      const favoritesData = await favoritesService.getFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading favorites:', error);
             addNotification('error', 'Error', 'No se pudieron cargar los favoritos');
    } finally {
      setIsLoading(false);
    }
  }, [user, addNotification]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Check if a product is in favorites
  const isFavorite = useCallback(
    (productId: string | number): boolean => {
      if (!favorites?.favorites) return false;
      const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
      return favorites.favorites.some(fav => fav.product_id === numericProductId);
    },
    [favorites]
  );

  // Add product to favorites
  const addToFavorites = useCallback(
    async (productId: string | number, productName?: string) => {
      if (!user) {
                 addNotification('warning', 'Autenticación requerida', 'Debes iniciar sesión para agregar favoritos');
        return false;
      }

      const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;

      try {
        await favoritesService.addFavorite(numericProductId);
        await loadFavorites(); // Refresh favorites list
                 addNotification(
           'success',
           'Favorito agregado',
           productName
             ? `${productName} se agregó a tus favoritos`
             : 'Producto agregado a favoritos'
         );
        return true;
             } catch (error: unknown) {
         console.error('Error adding to favorites:', error);
         addNotification(
           'error',
           'Error',
           error instanceof Error ? error.message : 'No se pudo agregar a favoritos'
         );
         return false;
       }
    },
    [user, addNotification, loadFavorites]
  );

  // Remove product from favorites
  const removeFromFavorites = useCallback(
    async (productId: string | number, productName?: string) => {
      if (!user) return false;

      const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;

      try {
        await favoritesService.removeFavorite(numericProductId);
        await loadFavorites(); // Refresh favorites list
                 addNotification(
           'success',
           'Favorito eliminado',
           productName
             ? `${productName} se eliminó de tus favoritos`
             : 'Producto eliminado de favoritos'
         );
        return true;
             } catch (error: unknown) {
         console.error('Error removing from favorites:', error);
         addNotification(
           'error',
           'Error',
           error instanceof Error ? error.message : 'No se pudo eliminar de favoritos'
         );
         return false;
       }
    },
    [user, addNotification, loadFavorites]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (productId: string | number, productName?: string) => {
      if (isFavorite(productId)) {
        return await removeFromFavorites(productId, productName);
      } else {
        return await addToFavorites(productId, productName);
      }
    },
    [isFavorite, addToFavorites, removeFromFavorites]
  );

  return {
    favorites: favorites?.favorites || [],
    totalFavorites: favorites?.total || 0,
    isLoading,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    refreshFavorites: loadFavorites,
  };
} 