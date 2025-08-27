import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';

export interface User {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  trade_name?: string;
  city?: string;
  province?: string;
  country?: string;
  phone?: string;
  profile_is_complete?: boolean;
  compras?: number;
  points?: number;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  roles: string[];
  meta_data?: unknown;
}

// Función para obtener usuarios
const fetchAdminUsers = async (): Promise<User[]> => {
  const response = await api.get('/user/admin/all');
  return Array.isArray(response) ? response : [];
};

interface UseAdminUsersOptions {
  enabled?: boolean;
}

export const useAdminUsers = ({ enabled = true }: UseAdminUsersOptions = {}) => {
  const { showError } = useNotificationContext();

  const {
    data: users = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
    staleTime: 5 * 60 * 1000, // 5 minutos - los usuarios no cambian frecuentemente
    gcTime: 10 * 60 * 1000, // 10 minutos en cache
    retry: 2,
    enabled,
  });

  // Manejar errores con useEffect
  React.useEffect(() => {
    if (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      showError('Error', `Error al cargar usuarios: ${errorMsg}`);
      console.error('Error fetching admin users:', error);
    }
  }, [error, showError]);

  return {
    users,
    loading,
    error: error ? (error instanceof Error ? error.message : 'Error desconocido') : null,
    refetch
  };
}; 