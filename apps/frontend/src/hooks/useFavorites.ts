// Legacy hook - Use useFavoritesQuery for new implementations
// This is kept for backward compatibility but delegates to React Query implementation
import { useFavoritesQuery } from './useFavoritesQuery';

export function useFavorites() {
  // Delegate to the React Query implementation
  const queryResult = useFavoritesQuery();
  
  return {
    favorites: queryResult.favorites,
    totalFavorites: queryResult.totalFavorites,
    isLoading: queryResult.isLoading,
    isFavorite: queryResult.isFavorite,
    addToFavorites: (productId: string | number) => {
      queryResult.addToFavorites(typeof productId === 'string' ? parseInt(productId, 10) : productId);
      return Promise.resolve(true); // For backward compatibility
    },
    removeFromFavorites: (productId: string | number) => {
      queryResult.removeFromFavorites(typeof productId === 'string' ? parseInt(productId, 10) : productId);
      return Promise.resolve(true); // For backward compatibility
    },
    toggleFavorite: queryResult.toggleFavorite,
    refreshFavorites: queryResult.refetch,
  };
}