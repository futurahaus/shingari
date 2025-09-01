'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface RedemptionLine {
  id: number;
  reward_id: number;
  reward_name: string;
  quantity: number;
  points_cost: number;
  total_points: number;
}

interface Redemption {
  id: number;
  user_id: string;
  status: string;
  total_points: number;
  created_at: string | Date;
  lines: RedemptionLine[];
}

export function useUserRedemptions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['redemptions'],
    queryFn: async (): Promise<Redemption[]> => {
      return api.get<Redemption[]>('/rewards/my-redemptions');
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useRedemptionDetail(redemptionId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['redemption', redemptionId],
    queryFn: async (): Promise<Redemption> => {
      const redemptions = await api.get<Redemption[]>('/rewards/my-redemptions');
      const redemption = redemptions.find(r => r.id.toString() === redemptionId);
      if (!redemption) {
        throw new Error('Redemption not found');
      }
      return redemption;
    },
    enabled: !!user && !!redemptionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useRedemptionsQuery() {
  const redemptionsQuery = useUserRedemptions();
  
  return {
    // Data
    redemptions: redemptionsQuery.data || [],
    
    // Loading states
    isLoading: redemptionsQuery.isLoading,
    
    // Error states
    error: redemptionsQuery.error,
    
    // Actions
    refetch: redemptionsQuery.refetch,
    
    // Status
    isSuccess: redemptionsQuery.isSuccess,
    isError: redemptionsQuery.isError,
  };
}
