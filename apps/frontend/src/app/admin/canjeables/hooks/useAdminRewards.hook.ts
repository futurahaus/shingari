import { useState, useEffect } from 'react';
import { Reward, CreateRewardDto, UpdateRewardDto, RewardsResponse } from '../interfaces/reward.interfaces';
import { api } from '@/lib/api';

interface UseAdminRewardsParams {
  page: number;
  limit: number;
  search?: string;
  sortField?: 'created_at' | 'updated_at' | 'name' | 'points_cost';
  sortDirection?: 'asc' | 'desc';
}

export const useAdminRewards = ({ page, limit, search, sortField = 'created_at', sortDirection = 'desc' }: UseAdminRewardsParams) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortField,
        sortDirection,
      });

      if (search) {
        params.append('search', search);
      }

      console.log('Fetching rewards with params:', params.toString());
      console.log('Full API URL:', `/rewards?${params.toString()}`);
      
      const response = await api.get<RewardsResponse>(`/rewards?${params.toString()}`);
      console.log('Full API response object:', response);
      console.log('Response.data:', response.data);
      console.log('Response.data type:', typeof response.data);
      console.log('Response.data keys:', response.data ? Object.keys(response.data) : 'no data');
      
      // Check if response.data exists and has the expected structure
      if (response && response.rewards) {
        // Direct response structure (no .data wrapper)
        console.log('Using direct response structure');
        setRewards(response.rewards);
        setTotal(response.total);
        setLastPage(response.lastPage);
      } else if (response.data && response.data.rewards) {
        // Wrapped response structure (.data wrapper)
        console.log('Using wrapped response structure');
        setRewards(response.data.rewards);
        setTotal(response.data.total);
        setLastPage(response.data.lastPage);
      } else {
        console.error('Invalid response structure. Full response:', response);
        console.error('Expected: { rewards: [...], total: number, page: number, limit: number, lastPage: number }');
        setError('Respuesta del servidor inválida');
        setRewards([]);
        setTotal(0);
        setLastPage(1);
      }
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los canjeables');
      setRewards([]);
      setTotal(0);
      setLastPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [page, limit, search, sortField, sortDirection]);

  const createReward = async (rewardData: CreateRewardDto): Promise<Reward> => {
    try {
      console.log('Creating reward with data:', rewardData);
      const response = await api.post<Reward>('/rewards', rewardData);
      console.log('Create reward response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating reward:', error);
      throw error;
    }
  };

  const updateReward = async (id: number, rewardData: UpdateRewardDto): Promise<Reward> => {
    const response = await api.put<Reward>(`/rewards/${id}`, rewardData);
    return response.data;
  };

  const deleteReward = async (id: number): Promise<void> => {
    await api.delete(`/rewards/${id}`);
  };

  const refetch = () => {
    fetchRewards();
  };

  return {
    rewards,
    loading,
    error,
    total,
    lastPage,
    createReward,
    updateReward,
    deleteReward,
    refetch,
  };
};
