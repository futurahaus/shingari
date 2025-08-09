import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useLocalizedAPI } from './useLocalizedAPI';
import { useI18n } from '@/contexts/I18nContext';
import { api } from '@/lib/api';
import { Product } from '@/components/ProductCard';
import { Category } from '@/app/admin/productos/hooks/useCategories.hook';

// Types for products API
export interface PaginatedProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export interface ProductFilters {
  categoryFilters?: string | string[];
  search?: string;
  sortByPrice?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

// Query keys for products (now include locale for reactivity)
export const productsKeys = {
  all: (locale: string) => ['products', locale] as const,
  lists: (locale: string) => [...productsKeys.all(locale), 'list'] as const,
  list: (locale: string, filters: ProductFilters) => [...productsKeys.lists(locale), filters] as const,
  details: (locale: string) => [...productsKeys.all(locale), 'detail'] as const,
  detail: (locale: string, id: string) => [...productsKeys.details(locale), id] as const,
  categories: (locale: string) => [...productsKeys.all(locale), 'categories'] as const,
  infinite: (locale: string, filters: Omit<ProductFilters, 'page'>) => [...productsKeys.lists(locale), 'infinite', filters] as const,
};

// Helper function to build query params
export function buildProductParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.sortByPrice) params.append('sortByPrice', filters.sortByPrice);
  
  if (filters.categoryFilters) {
    if (Array.isArray(filters.categoryFilters)) {
      filters.categoryFilters.forEach(category => {
        params.append('categoryFilters', category);
      });
    } else {
      params.append('categoryFilters', filters.categoryFilters);
    }
  }
  
  return params;
}

// Hook for paginated products list
export function useProductsList(filters: ProductFilters = {}) {
  const localizedAPI = useLocalizedAPI();
  const { locale } = useI18n();
  
  return useQuery({
    queryKey: productsKeys.list(locale, filters),
    queryFn: async () => {
      const params = buildProductParams(filters);
      const url = params.toString() ? `/products?${params.toString()}` : '/products';
      return localizedAPI.get<PaginatedProductsResponse>(url);
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// Hook for infinite scroll products
export function useProductsInfinite(filters: Omit<ProductFilters, 'page'> = {}) {
  const localizedAPI = useLocalizedAPI();
  const { locale } = useI18n();
  
  return useInfiniteQuery({
    queryKey: productsKeys.infinite(locale, filters),
    queryFn: async ({ pageParam = 1 }) => {
      const params = buildProductParams({ ...filters, page: pageParam });
      const url = params.toString() ? `/products?${params.toString()}` : '/products';
      return localizedAPI.get<PaginatedProductsResponse>(url);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.lastPage ? lastPage.page + 1 : undefined;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// Hook for individual product details
export function useProduct(id: string) {
  const { locale } = useI18n();
  
  return useQuery({
    queryKey: productsKeys.detail(locale, id),
    queryFn: async () => {
      // For individual products, we might not need localized API since product details 
      // are usually the same, but include locale for consistency
      const separator = '?';
      return api.get<Product>(`/products/${id}${separator}locale=${locale}`);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
}

// Hook for product categories
export function useProductCategories() {
  const localizedAPI = useLocalizedAPI();
  const { locale } = useI18n();
  
  return useQuery({
    queryKey: productsKeys.categories(locale),
    queryFn: () => localizedAPI.get<Category[]>('/products/categories'),
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

// Hook for home page products (limited)
export function useHomeProducts(limit: number = 6) {
  return useProductsList({ limit });
}

// Hook for similar products (can be extended with more logic)
export function useSimilarProducts(product: Product, limit: number = 4) {
  const categories = product.categories;
  
  return useProductsList({
    categoryFilters: categories[0], // Use first category for now
    limit,
  });
}

// Hook for featured products with specific filters
export function useFeaturedProducts() {
  return useProductsList({ 
    limit: 8,
    // Add any specific filters for featured products
  });
}

// Hook for search products with debounced search
export function useSearchProducts(searchTerm: string, limit: number = 10) {
  return useProductsList({
    search: searchTerm,
    limit,
  });
}

// Main hook that combines products list with common patterns
export function useProductsQuery(filters: ProductFilters = {}) {
  const { locale } = useI18n();
  const productsQuery = useProductsList(filters);
  const categoriesQuery = useProductCategories();
  
  return {
    // Products data
    products: productsQuery.data?.data || [],
    total: productsQuery.data?.total || 0,
    page: productsQuery.data?.page || 1,
    lastPage: productsQuery.data?.lastPage || 1,
    
    // Categories data
    categories: categoriesQuery.data || [],
    
    // Loading states
    isLoading: productsQuery.isLoading,
    isCategoriesLoading: categoriesQuery.isLoading,
    isLoadingAny: productsQuery.isLoading || categoriesQuery.isLoading,
    
    // Error states
    error: productsQuery.error,
    categoriesError: categoriesQuery.error,
    hasError: !!productsQuery.error || !!categoriesQuery.error,
    
    // Actions
    refetch: productsQuery.refetch,
    refetchCategories: categoriesQuery.refetch,
    refetchAll: () => {
      productsQuery.refetch();
      categoriesQuery.refetch();
    },
    
    // Status
    isSuccess: productsQuery.isSuccess && categoriesQuery.isSuccess,
    isError: productsQuery.isError || categoriesQuery.isError,
    
    // Locale info for debugging
    locale,
  };
}