// Example component showing how to use the new React Query-based favorites hooks

import React from 'react';
import { useFavoritesQuery, useIsFavorite, useToggleFavorite } from '@/hooks/useFavoritesQuery';

// Example 1: Using the complete favorites hook
export function FavoritesList() {
  const { 
    favorites, 
    totalFavorites, 
    isLoading, 
    error, 
    toggleFavorite 
  } = useFavoritesQuery();

  if (isLoading) return <div>Cargando favoritos...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Mis Favoritos ({totalFavorites})</h2>
      {favorites?.map((favorite) => (
        <div key={favorite.product_id} className="flex items-center justify-between p-2 border rounded">
          <span>{favorite.product.name}</span>
          <button
            onClick={() => toggleFavorite(favorite.product_id)}
            className="text-red-500 hover:text-red-700"
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}

// Example 2: Using individual hooks for a product card
export function ProductFavoriteButton({ productId }: { productId: number }) {
  const { data: favoriteCheck, isLoading: isCheckingFavorite } = useIsFavorite(productId);
  const { toggleFavorite, isLoading: isToggling } = useToggleFavorite();

  const isFavorite = favoriteCheck?.isFavorite || false;
  const isLoading = isCheckingFavorite || isToggling;

  return (
    <button
      onClick={() => toggleFavorite(productId, isFavorite)}
      disabled={isLoading}
      className={`p-2 rounded ${
        isFavorite 
          ? 'bg-red-500 text-white' 
          : 'bg-gray-200 text-gray-700'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
    >
      {isLoading ? '...' : isFavorite ? '❤️ Favorito' : '🤍 Agregar'}
    </button>
  );
}

// Example 3: Using the legacy hook (for backward compatibility)
export function LegacyFavoritesComponent() {
  const { 
    totalFavorites, 
    isLoading, 
    isFavorite, 
    toggleFavorite 
  } = useFavoritesQuery(); // This now uses React Query under the hood

  return (
    <div>
      <h3>Legacy Component (using React Query internally)</h3>
      <p>Total: {totalFavorites}</p>
      <p>Loading: {isLoading ? 'Sí' : 'No'}</p>
      <p>Product 123 is favorite: {isFavorite(123) ? 'Sí' : 'No'}</p>
      <button onClick={() => toggleFavorite(123)}>
        Toggle Product 123
      </button>
    </div>
  );
}