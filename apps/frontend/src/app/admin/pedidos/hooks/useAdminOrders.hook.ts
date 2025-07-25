import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';

export interface Order {
  id: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  user_trade_name?: string;
  status: string;
  total_amount: string;
  currency: string;
  created_at: string;
  updated_at: string;
  // Add more fields as needed
}

export interface PaginatedOrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

const fetchAdminOrders = async (page: number, limit: number = 20, search?: string, sortField?: string, sortDirection?: string): Promise<PaginatedOrdersResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search && search.trim()) {
    params.append('search', search.trim());
  }
  if (sortField) {
    params.append('sortField', sortField);
  }
  if (sortDirection) {
    params.append('sortDirection', sortDirection);
  }
  // TODO: Confirm endpoint with backend
  const response = await api.get<PaginatedOrdersResponse>(`/orders/admin/all?${params.toString()}`);
  return response;
};

interface UseAdminOrdersOptions {
  page: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortDirection?: string;
  enabled?: boolean;
}

export const useAdminOrders = ({ page, limit = 20, search = '', sortField = 'created_at', sortDirection = 'desc', enabled = true }: UseAdminOrdersOptions) => {
  const { showError } = useNotificationContext();
  const {
    data,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-orders', page, limit, search, sortField, sortDirection],
    queryFn: () => fetchAdminOrders(page, limit, search, sortField, sortDirection),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled,
  });
  React.useEffect(() => {
    if (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error', `Error al cargar pedidos: ${errorMsg}`);
      console.error('Error fetching admin orders:', error);
    }
  }, [error, showError]);
  return {
    orders: data?.data || [],
    total: data?.total || 0,
    currentPage: data?.page || page,
    lastPage: data?.lastPage || 1,
    limit: data?.limit || limit,
    loading,
    error: error ? (error instanceof Error ? error.message : 'Error desconocido') : null,
    refetch
  };
}; 