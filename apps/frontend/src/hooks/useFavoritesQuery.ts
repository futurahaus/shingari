import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService } from '@/lib/favorites';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';

// Query keys for favorites
export const favoritesKeys = {
  all: ['favorites'] as const,
  lists: () => [...favoritesKeys.all, 'list'] as const,
  list: (userId?: string) => [...favoritesKeys.lists(), userId] as const,
  checks: () => [...favoritesKeys.all, 'check'] as const,
  check: (productId: number) => [...favoritesKeys.checks(), productId] as const,
};

// Hook to get user's favorites list
export function useFavoritesList() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: favoritesKeys.list(user?.id),
    queryFn: () => favoritesService.getFavorites(),
    enabled: !!user, // Only fetch when user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Hook to check if a product is favorite
export function useIsFavorite(productId: number) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: favoritesKeys.check(productId),
    queryFn: () => favoritesService.isFavorite(productId),
    enabled: !!user && !!productId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
  });
}

// Hook to add product to favorites
export function useAddToFavorites() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  return useMutation({
    mutationFn: (productId: number) => favoritesService.addFavorite(productId),
    onSuccess: (_, productId) => {
      // Update the favorites list cache
      queryClient.invalidateQueries({ queryKey: favoritesKeys.list(user?.id) });
      
      // Update the specific product check cache
      queryClient.setQueryData(favoritesKeys.check(productId), { isFavorite: true });
      
      addNotification('success', 'Favorito agregado', 'Producto agregado a favoritos');
    },
    onError: (error: Error) => {
      addNotification('error', 'Error', error.message || 'No se pudo agregar a favoritos');
    },
  });
}

// Hook to remove product from favorites
export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  return useMutation({
    mutationFn: (productId: number) => favoritesService.removeFavorite(productId),
    onSuccess: (_, productId) => {
      // Update the favorites list cache
      queryClient.invalidateQueries({ queryKey: favoritesKeys.list(user?.id) });
      
      // Update the specific product check cache
      queryClient.setQueryData(favoritesKeys.check(productId), { isFavorite: false });
      
      addNotification('success', 'Favorito eliminado', 'Producto eliminado de favoritos');
    },
    onError: (error: Error) => {
      addNotification('error', 'Error', error.message || 'No se pudo eliminar de favoritos');
    },
  });
}

// Hook that combines add/remove functionality
export function useToggleFavorite() {
  const addMutation = useAddToFavorites();
  const removeMutation = useRemoveFromFavorites();
  
  const toggleFavorite = (productId: number, isFavorite: boolean) => {
    if (isFavorite) {
      return removeMutation.mutate(productId);
    } else {
      return addMutation.mutate(productId);
    }
  };
  
  return {
    toggleFavorite,
    isLoading: addMutation.isPending || removeMutation.isPending,
    error: addMutation.error || removeMutation.error,
  };
}

// Main hook that provides all favorites functionality with React Query
export function useFavoritesQuery() {
  const favoritesQuery = useFavoritesList();
  const addMutation = useAddToFavorites();
  const removeMutation = useRemoveFromFavorites();
  const { toggleFavorite, isLoading: isToggling } = useToggleFavorite();
  
  // Helper function to check if a product is favorite from the cached list
  const isFavorite = (productId: string | number): boolean => {
    if (!favoritesQuery.data?.favorites) return false;
    const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
    return favoritesQuery.data.favorites.some(fav => fav.product_id === numericProductId);
  };
  
  return {
    // Data
    favorites: favoritesQuery.data?.favorites || [],
    totalFavorites: favoritesQuery.data?.total || 0,
    
    // Loading states
    isLoading: favoritesQuery.isLoading,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    isToggling,
    
    // Error states
    error: favoritesQuery.error || addMutation.error || removeMutation.error,
    
    // Actions
    isFavorite,
    addToFavorites: addMutation.mutate,
    removeFromFavorites: removeMutation.mutate,
    toggleFavorite: (productId: string | number) => {
      const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
      const isCurrentlyFavorite = isFavorite(productId);
      toggleFavorite(numericProductId, isCurrentlyFavorite);
    },
    
    // Utils
    refetch: favoritesQuery.refetch,
  };
}