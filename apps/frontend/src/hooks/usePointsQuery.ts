import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export interface PointsLedgerEntry {
  id: number;
  user_id: string;
  order_id: string | null;
  reward_id: number | null;
  points: number;
  type: string | null;
  created_at: string;
  order_number?: string;
}

export interface UserPointsBalance {
  user_id: string;
  total_points: number;
}

export interface PointsSummary {
  balance: UserPointsBalance | null;
  transactions: PointsLedgerEntry[];
}

// Query keys for points
export const pointsKeys = {
  all: ['points'] as const,
  user: (userId?: string) => [...pointsKeys.all, 'user', userId] as const,
  summary: (userId?: string) => [...pointsKeys.user(userId), 'summary'] as const,
  balance: (userId?: string) => [...pointsKeys.user(userId), 'balance'] as const,
  ledger: (userId?: string) => [...pointsKeys.user(userId), 'ledger'] as const,
};

// Hook to get user's complete points summary
export function usePointsSummary() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: pointsKeys.summary(user?.id),
    queryFn: async () => {
      const data = await api.get<PointsSummary>('/points/me');
      return data;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Hook to get just the user's points balance
export function usePointsBalance() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: pointsKeys.balance(user?.id),
    queryFn: async () => {
      const data = await api.get<UserPointsBalance>('/points/balance');
      return data;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Hook to get just the user's points ledger
export function usePointsLedger() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: pointsKeys.ledger(user?.id),
    queryFn: async () => {
      const data = await api.get<PointsLedgerEntry[]>('/points/me/ledger');
      return data;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Main hook that provides all points functionality with React Query
export function usePointsQuery() {
  const pointsSummaryQuery = usePointsSummary();
  
  return {
    // Data
    pointsData: pointsSummaryQuery.data,
    balance: pointsSummaryQuery.data?.balance,
    transactions: pointsSummaryQuery.data?.transactions || [],
    
    // Loading states
    isLoading: pointsSummaryQuery.isLoading,
    isFetching: pointsSummaryQuery.isFetching,
    
    // Error states
    error: pointsSummaryQuery.error,
    isError: pointsSummaryQuery.isError,
    
    // Actions
    refetch: pointsSummaryQuery.refetch,
    
    // Status
    isSuccess: pointsSummaryQuery.isSuccess,
    isStale: pointsSummaryQuery.isStale,
  };
}
