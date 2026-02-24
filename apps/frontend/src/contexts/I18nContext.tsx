'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Translation types
interface TranslationFiles {
  [key: string]: string | number | boolean | TranslationFiles | undefined;
}

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  availableLocales: string[];
  isReady: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Available locales
const AVAILABLE_LOCALES = ['es', 'zh'];
const DEFAULT_LOCALE = 'es';

// Translation store
const translationCache: { [locale: string]: TranslationFiles } = {};

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

// Helper to get initial locale synchronously
function getInitialLocale(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  
  const savedLocale = localStorage.getItem('locale') || navigator.language.split('-')[0];
  return AVAILABLE_LOCALES.includes(savedLocale) ? savedLocale : DEFAULT_LOCALE;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<string>(() => getInitialLocale());
  const [translations, setTranslations] = useState<TranslationFiles>({});
  const [isLoading, setIsLoading] = useState(true);

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
    let value: TranslationFiles = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k] as TranslationFiles;
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
            'common.view_details': 'Ver detalles',
            'auth.registration_success': 'Registro exitoso. Revisa tu correo electrónico para confirmar tu cuenta.',
            'auth.email_already_registered': 'Este correo electrónico ya está registrado',
            'auth.registration_failed': 'Error en el registro. Por favor, inténtalo más tarde.',
            'auth.confirm_email_first': 'Por favor, confirma tu correo electrónico antes de iniciar sesión',
            'auth.invalid_credentials': 'Usuario o contraseña incorrectos',
          };
          return fallbacks[key] || key;
        }
        // Fallback for common auth keys when translation not found (locale-aware)
        const authFallbacks: Record<string, { es: string; zh: string }> = {
          'auth.registration_success': { es: 'Registro exitoso. Revisa tu correo electrónico para confirmar tu cuenta.', zh: '注册成功。请检查您的邮箱以确认您的账户。' },
          'auth.email_already_registered': { es: 'Este correo electrónico ya está registrado', zh: '此邮箱已被注册' },
          'auth.registration_failed': { es: 'Error en el registro. Por favor, inténtalo más tarde.', zh: '注册失败。请稍后重试。' },
          'auth.confirm_email_first': { es: 'Por favor, confirma tu correo electrónico antes de iniciar sesión', zh: '请先确认您的邮箱后再登录' },
          'auth.invalid_credentials': { es: 'Usuario o contraseña incorrectos', zh: '用户名或密码错误' },
        };
        const fb = authFallbacks[key];
        return fb ? fb[locale === 'zh' ? 'zh' : 'es'] : key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters if provided
    if (params) {
      return Object.entries(params).reduce((str: string, [paramKey, paramValue]) => {
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
    isReady: !isLoading,
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