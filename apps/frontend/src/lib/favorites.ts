import { api } from './api';

export interface FavoriteProduct {
  id: number;
  name: string;
  description?: string;
  images: string[];
  price: number;
  originalPrice?: number;
  discount: number;
  sku: string;
  status: string;
  iva?: number;
}

export interface FavoriteResponse {
  user_id: string;
  product_id: number;
  created_at: string;
  product: FavoriteProduct;
}

export interface FavoritesListResponse {
  favorites: FavoriteResponse[];
  total: number;
}

export interface SimpleMessageResponse {
  message: string;
  success: boolean;
}

export class FavoritesService {
  /**
   * Add a product to favorites
   */
  async addFavorite(productId: number): Promise<FavoriteResponse> {
    return api.post<FavoriteResponse, { productId: number }>('/favorites', {
      productId,
    });
  }

  /**
   * Remove a product from favorites
   */
  async removeFavorite(productId: number): Promise<SimpleMessageResponse> {
    return api.delete<SimpleMessageResponse>(`/favorites/${productId}`);
  }

  /**
   * Get user's favorites list
   */
  async getFavorites(): Promise<FavoritesListResponse> {
    return api.get<FavoritesListResponse>('/favorites');
  }

  /**
   * Check if a product is in favorites
   */
  async isFavorite(productId: number): Promise<{ isFavorite: boolean }> {
    return api.get<{ isFavorite: boolean }>(`/favorites/${productId}/check`);
  }
}

export const favoritesService = new FavoritesService(); 