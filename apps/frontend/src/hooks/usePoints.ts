import { useState, useEffect } from 'react';
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

export function usePoints() {
  const { user } = useAuth();
  const [pointsData, setPointsData] = useState<PointsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoints = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await api.get<PointsSummary>('/points/me');
        setPointsData(data);
      } catch (err) {
        console.error('Error fetching points:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch points');
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [user]);

  const refetch = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const data = await api.get<PointsSummary>('/points/me');
      setPointsData(data);
    } catch (err) {
      console.error('Error refetching points:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch points');
    } finally {
      setLoading(false);
    }
  };

  return {
    pointsData,
    loading,
    error,
    refetch,
  };
}
