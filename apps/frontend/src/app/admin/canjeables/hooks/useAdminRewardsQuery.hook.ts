import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { RewardsResponse, CreateRewardDto, UpdateRewardDto, Reward } from '../interfaces/reward.interfaces';

// Function to fetch rewards with pagination, search, and sorting
const fetchAdminRewards = async (
  page: number, 
  limit: number = 10, 
  search?: string, 
  sortField?: string, 
  sortDirection?: string
): Promise<RewardsResponse> => {
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

  const response = await api.get<RewardsResponse>(`/rewards?${params.toString()}`);
  return response;
};

interface UseAdminRewardsOptions {
  page: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortDirection?: string;
  enabled?: boolean;
}

export const useAdminRewards = ({ 
  page, 
  limit = 10, 
  search = '', 
  sortField = 'updated_at', 
  sortDirection = 'desc', 
  enabled = true 
}: UseAdminRewardsOptions) => {
  const { showError } = useNotificationContext();

  const {
    data,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-rewards', page, limit, search, sortField, sortDirection],
    queryFn: () => fetchAdminRewards(page, limit, search, sortField, sortDirection),
    staleTime: 2 * 60 * 1000, // 2 minutes - rewards can change
    gcTime: 5 * 60 * 1000, // 5 minutes in cache
    retry: 2,
    enabled,
  });

  // Handle errors with useEffect
  React.useEffect(() => {
    if (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error', `Error al cargar canjeables: ${errorMsg}`);
      console.error('Error fetching admin rewards:', error);
    }
  }, [error, showError]);

  return {
    rewards: data?.rewards || [],
    total: data?.total || 0,
    currentPage: data?.page || page,
    lastPage: data?.lastPage || 1,
    limit: data?.limit || limit,
    loading,
    error: error ? (error instanceof Error ? error.message : 'Error desconocido') : null,
    refetch
  };
};

// Hook for creating a reward
export const useCreateReward = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotificationContext();

  return useMutation({
    mutationFn: async (rewardData: CreateRewardDto) => {
      const response = await api.post<Reward>('/rewards', rewardData);
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch rewards queries
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      showSuccess('Éxito', 'Canjeable creado exitosamente');
    },
    onError: (error: Error) => {
      const errorMsg = error.message || 'Error desconocido';
      showError('Error', `Error al crear canjeable: ${errorMsg}`);
      console.error('Error creating reward:', error);
    },
  });
};

// Hook for updating a reward
export const useUpdateReward = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotificationContext();

  return useMutation({
    mutationFn: async ({ id, rewardData }: { id: number; rewardData: UpdateRewardDto }) => {
      const response = await api.put<Reward>(`/rewards/${id}`, rewardData);
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch rewards queries
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      showSuccess('Éxito', 'Canjeable actualizado exitosamente');
    },
    onError: (error: Error) => {
      const errorMsg = error.message || 'Error desconocido';
      showError('Error', `Error al actualizar canjeable: ${errorMsg}`);
      console.error('Error updating reward:', error);
    },
  });
};

// Hook for deleting a reward
export const useDeleteReward = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotificationContext();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/rewards/${id}`);
      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch rewards queries
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      showSuccess('Éxito', 'Canjeable eliminado exitosamente');
    },
    onError: (error: Error) => {
      const errorMsg = error.message || 'Error desconocido';
      showError('Error', `Error al eliminar canjeable: ${errorMsg}`);
      console.error('Error deleting reward:', error);
    },
  });
};
