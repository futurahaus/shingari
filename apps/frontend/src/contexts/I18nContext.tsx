'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Translation types
interface TranslationFiles {
  [key: string]: any;
}

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  availableLocales: string[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Available locales
const AVAILABLE_LOCALES = ['es', 'zh'];
const DEFAULT_LOCALE = 'es';

// Translation store
let translationCache: { [locale: string]: TranslationFiles } = {};

// Helper to load translations
async function loadTranslation(locale: string): Promise<TranslationFiles> {
  if (translationCache[locale]) {
    return translationCache[locale];
  }

  try {
    const response = await fetch(`/locales/${locale}/common.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translation for ${locale}`);
    }
    const translations = await response.json();
    translationCache[locale] = translations;
    return translations;
  } catch (error) {
    console.error(`Error loading translations for ${locale}:`, error);
    // Fallback to default locale if available
    if (locale !== DEFAULT_LOCALE && translationCache[DEFAULT_LOCALE]) {
      return translationCache[DEFAULT_LOCALE];
    }
    return {};
  }
}

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<string>(DEFAULT_LOCALE);
  const [translations, setTranslations] = useState<TranslationFiles>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load initial locale from localStorage or browser
  useEffect(() => {
    const savedLocale = typeof window !== 'undefined' 
      ? localStorage.getItem('locale') || navigator.language.split('-')[0] 
      : DEFAULT_LOCALE;
    
    const initialLocale = AVAILABLE_LOCALES.includes(savedLocale) ? savedLocale : DEFAULT_LOCALE;
    
    if (initialLocale !== locale) {
      setLocaleState(initialLocale);
    }
  }, []);

  // Load translations when locale changes
  useEffect(() => {
    setIsLoading(true);
    loadTranslation(locale).then((newTranslations) => {
      setTranslations(newTranslations);
      setIsLoading(false);
    });
  }, [locale]);

  // Update HTML lang attribute
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (newLocale: string) => {
    if (AVAILABLE_LOCALES.includes(newLocale) && newLocale !== locale) {
      setLocaleState(newLocale);
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', newLocale);
      }
    }
  };

  // Translation function with nested key support
  const t = (key: string, params?: Record<string, string | number>): string => {
    // Don't return key while loading, try to find translation first
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // If still loading and no translation found, return a fallback or the key
        if (isLoading) {
          // For common keys, provide immediate fallbacks
          const fallbacks: Record<string, string> = {
            'common.search': 'Buscar',
            'navigation.login': 'Iniciar Sesión',
            'navigation.products': 'Productos',
            'navigation.about': 'Nosotros',
            'navigation.contact': 'Contacto',
            'common.add_to_favorites': 'Agregar a favoritos',
            'common.remove_from_favorites': 'Eliminar de favoritos',
            'common.no_image': 'Sin imagen',
            'common.view_details': 'Ver detalles'
          };
          return fallbacks[key] || key;
        }
        // Return the key if translation not found and not loading
        console.warn(`Translation missing for key: ${key} in locale: ${locale}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string for key: ${key}`);
      return key;
    }

    // Replace parameters if provided
    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      }, value);
    }

    return value;
  };

  const contextValue: I18nContextType = {
    locale,
    setLocale,
    t,
    availableLocales: AVAILABLE_LOCALES,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Utility hook for common patterns
export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}