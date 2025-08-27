import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { PaginatedProductsResponse, Category } from '../interfaces/product.interfaces';

// Función para obtener productos paginados
const fetchAdminProducts = async (page: number, limit: number = 20, search?: string, sortField?: string, sortDirection?: string, categoryId?: string): Promise<PaginatedProductsResponse> => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    // Agregar parámetro de búsqueda si existe
    if (search && search.trim()) {
        params.append('search', search.trim());
    }
    if (sortField) {
        params.append('sortField', sortField);
    }
    if (sortDirection) {
        params.append('sortDirection', sortDirection);
    }
    // Agregar filtro de categoría si existe
    if (categoryId && categoryId !== 'all') {
        params.append('categoryId', categoryId);
    }

    const response = await api.get<PaginatedProductsResponse>(`/products/admin/all?${params.toString()}`);
    return response;
};

// Función para obtener categorías
const fetchCategories = async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/products/categories?includeAllTranslations=true');
    return response;
};

interface UseAdminProductsOptions {
    page: number;
    limit?: number;
    search?: string;
    sortField?: string;
    sortDirection?: string;
    categoryId?: string;
    enabled?: boolean;
}

export const useAdminProducts = ({ page, limit = 20, search = '', sortField = 'created_at', sortDirection = 'desc', categoryId, enabled = true }: UseAdminProductsOptions) => {
    const { showError } = useNotificationContext();

    const {
        data,
        isLoading: loading,
        error,
        refetch
    } = useQuery({
        queryKey: ['admin-products', page, limit, search, sortField, sortDirection, categoryId],
        queryFn: () => fetchAdminProducts(page, limit, search, sortField, sortDirection, categoryId),
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

// Hook para obtener categorías
export const useCategories = () => {
    const { showError } = useNotificationContext();

    const {
        data: categories = [],
        isLoading: loading,
        error,
        refetch
    } = useQuery<Category[]>({
        queryKey: ['admin-categories'],
        queryFn: fetchCategories,
        staleTime: 10 * 60 * 1000, // 10 minutos - las categorías cambian menos frecuentemente
        gcTime: 15 * 60 * 1000, // 15 minutos en cache
        retry: 2,
    });

    // Manejar errores con useEffect
    React.useEffect(() => {
        if (error) {
            const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
            showError('Error', `Error al cargar categorías: ${errorMsg}`);
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