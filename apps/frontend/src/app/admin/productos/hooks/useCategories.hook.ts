import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';

export interface CategoryTranslation {
  id: number;
  category_id: number;
  locale: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
  parentId?: string;
  translations?: CategoryTranslation[];
}

// Función para obtener categorías
const fetchCategories = async (includeAllTranslations: boolean = false): Promise<Category[]> => {
  const params = includeAllTranslations ? '?includeAllTranslations=true' : '';
  const response = await api.get<Category[]>(`/products/categories${params}`);
  return response;
};

export const useCategories = (includeAllTranslations: boolean = false) => {
  const { showError } = useNotificationContext();

  const {
    data: categories = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['categories', includeAllTranslations],
    queryFn: () => fetchCategories(includeAllTranslations),
    staleTime: 10 * 60 * 1000, // 10 minutos - las categorías no cambian frecuentemente
    gcTime: 30 * 60 * 1000, // 30 minutos en cache
    retry: 2,
  });

  // Manejar errores con useEffect
  useEffect(() => {
    if (error) {
      showError('Error', 'No se pudieron cargar las categorías');
      console.error('Error fetching categories:', error);
    }
  }, [error, showError]);

  return {
    categories,
    loading,
    error: error ? (error instanceof Error ? error.message : 'Error desconocido') : null,
    refetch
  };
}; 