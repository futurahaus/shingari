import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { Product, PaginatedProductsResponse } from '../interfaces/product.interfaces';

// Función para obtener productos paginados
const fetchAdminProducts = async (page: number, limit: number = 20): Promise<PaginatedProductsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  const response = await api.get<PaginatedProductsResponse>(`/products/admin/all?${params.toString()}`);
  return response;
};

interface UseAdminProductsOptions {
  page: number;
  limit?: number;
  enabled?: boolean;
}

export const useAdminProducts = ({ page, limit = 20, enabled = true }: UseAdminProductsOptions) => {
  const { showError } = useNotificationContext();

  const {
    data,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-products', page, limit],
    queryFn: () => fetchAdminProducts(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutos - los productos pueden cambiar
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
    retry: 2,
    enabled,
  });

  // Manejar errores con useEffect
  React.useEffect(() => {
    if (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error', `Error al cargar productos: ${errorMsg}`);
      console.error('Error fetching admin products:', error);
    }
  }, [error, showError]);

  return {
    products: data?.data || [],
    total: data?.total || 0,
    currentPage: data?.page || page,
    lastPage: data?.lastPage || 1,
    limit: data?.limit || limit,
    loading,
    error: error ? (error instanceof Error ? error.message : 'Error desconocido') : null,
    refetch
  };
}; 