import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useNotificationContext();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Category[]>('/products/categories');
      setCategories(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      showError('Error', 'No se pudieron cargar las categorías');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
}; 