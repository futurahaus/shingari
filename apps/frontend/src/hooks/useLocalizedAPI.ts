'use client';

import { api } from '@/lib/api';
import { useI18n } from '@/contexts/I18nContext';
import { useCallback, useMemo } from 'react';

/**
 * Hook that provides API methods with automatic locale parameter injection
 */
export function useLocalizedAPI() {
  const { locale } = useI18n();

  const get = useCallback(async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    // Add locale to query parameters
    const separator = endpoint.includes('?') ? '&' : '?';
    const localizedEndpoint = `${endpoint}${separator}locale=${locale}`;
    
    return api.get<T>(localizedEndpoint, options);
  }, [locale]);

  const post = useCallback(async <T, D extends Record<string, unknown>>(
    endpoint: string,
    data: D,
    options: RequestInit = {}
  ): Promise<T> => {
    // For POST requests, we might want to include locale in the body or headers
    // depending on the endpoint. For now, we'll add it as a query parameter
    const separator = endpoint.includes('?') ? '&' : '?';
    const localizedEndpoint = `${endpoint}${separator}locale=${locale}`;
    
    return api.post<T, D>(localizedEndpoint, data, options);
  }, [locale]);

  const put = useCallback(async <T, D extends Record<string, unknown>>(
    endpoint: string,
    data: D,
    options: RequestInit = {}
  ): Promise<T> => {
    const separator = endpoint.includes('?') ? '&' : '?';
    const localizedEndpoint = `${endpoint}${separator}locale=${locale}`;
    
    return api.put<T, D>(localizedEndpoint, data, options);
  }, [locale]);

  const del = useCallback(async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const separator = endpoint.includes('?') ? '&' : '?';
    const localizedEndpoint = `${endpoint}${separator}locale=${locale}`;
    
    return api.delete<T>(localizedEndpoint, options);
  }, [locale]);

  const patch = useCallback(async <T, D extends Record<string, unknown>>(
    endpoint: string,
    data: D,
    options: RequestInit = {}
  ): Promise<T> => {
    const separator = endpoint.includes('?') ? '&' : '?';
    const localizedEndpoint = `${endpoint}${separator}locale=${locale}`;
    
    return api.patch<T, D>(localizedEndpoint, data, options);
  }, [locale]);

  return useMemo(() => ({
    locale,
    get,
    post,
    put,
    delete: del,
    patch,
    // Also provide the original api for cases where locale is not needed
    api,
  }), [locale, get, post, put, del, patch]);
}

/**
 * Helper function to add locale to any URL
 */
export function addLocaleToUrl(url: string, locale: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}locale=${locale}`;
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