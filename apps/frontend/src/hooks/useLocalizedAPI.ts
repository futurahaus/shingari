'use client';

import { api } from '@/lib/api';
import { useI18n } from '@/contexts/I18nContext';

/**
 * Hook that provides API methods with automatic locale parameter injection
 */
export function useLocalizedAPI() {
  const { locale } = useI18n();

  const get = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    // Add locale to query parameters
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set('locale', locale);
    
    // Remove the origin and keep only the pathname and search
    const localizedEndpoint = url.pathname + url.search;
    
    return api.get<T>(localizedEndpoint, options);
  };

  const post = async <T, D extends Record<string, unknown>>(
    endpoint: string,
    data: D,
    options: RequestInit = {}
  ): Promise<T> => {
    // For POST requests, we might want to include locale in the body or headers
    // depending on the endpoint. For now, we'll add it as a query parameter
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set('locale', locale);
    const localizedEndpoint = url.pathname + url.search;
    
    return api.post<T, D>(localizedEndpoint, data, options);
  };

  const put = async <T, D extends Record<string, unknown>>(
    endpoint: string,
    data: D,
    options: RequestInit = {}
  ): Promise<T> => {
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set('locale', locale);
    const localizedEndpoint = url.pathname + url.search;
    
    return api.put<T, D>(localizedEndpoint, data, options);
  };

  const del = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set('locale', locale);
    const localizedEndpoint = url.pathname + url.search;
    
    return api.delete<T>(localizedEndpoint, options);
  };

  const patch = async <T, D extends Record<string, unknown>>(
    endpoint: string,
    data: D,
    options: RequestInit = {}
  ): Promise<T> => {
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set('locale', locale);
    const localizedEndpoint = url.pathname + url.search;
    
    return api.patch<T, D>(localizedEndpoint, data, options);
  };

  return {
    locale,
    get,
    post,
    put,
    delete: del,
    patch,
    // Also provide the original api for cases where locale is not needed
    api,
  };
}

/**
 * Helper function to add locale to any URL
 */
export function addLocaleToUrl(url: string, locale: string): string {
  const urlObj = new URL(url, window.location.origin);
  urlObj.searchParams.set('locale', locale);
  return urlObj.pathname + urlObj.search;
}

/**
 * Helper function to get translated content from a product/category object
 */
export function getTranslatedField(
  translations: Array<{ locale: string; name?: string; description?: string }> | undefined,
  locale: string,
  field: 'name' | 'description',
  fallback: string | undefined
): string | undefined {
  if (!translations || translations.length === 0) {
    return fallback;
  }

  const translation = translations.find(t => t.locale === locale);
  if (translation && translation[field]) {
    return translation[field];
  }

  return fallback;
}

/**
 * Hook specifically for products with translation support
 */
export function useProductTranslations() {
  const { locale } = useI18n();

  const getProductName = (product: {
    name: string;
    translations?: Array<{ locale: string; name: string; description?: string }>;
  }): string => {
    return getTranslatedField(product.translations, locale, 'name', product.name) || product.name;
  };

  const getProductDescription = (product: {
    description?: string;
    translations?: Array<{ locale: string; name: string; description?: string }>;
  }): string | undefined => {
    return getTranslatedField(product.translations, locale, 'description', product.description);
  };

  const getCategoryName = (category: {
    name: string;
    translations?: Array<{ locale: string; name: string }>;
  }): string => {
    return getTranslatedField(category.translations, locale, 'name', category.name) || category.name;
  };

  return {
    locale,
    getProductName,
    getProductDescription,
    getCategoryName,
  };
}