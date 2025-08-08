'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';

interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'es', label: 'ESP', flag: '🇪🇸' },
  { code: 'zh', label: 'CHN', flag: '🇨🇳' },
];

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    setLocale(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
        aria-label="Select language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                  locale === language.code
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.label}</span>
                {locale === language.code && (
                  <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Simplified version for mobile/compact spaces
export function LanguageSelectorCompact() {
  const { locale, setLocale } = useI18n();

  const toggleLanguage = () => {
    const newLocale = locale === 'es' ? 'zh' : 'es';
    setLocale(newLocale);
  };

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
      aria-label={`Switch to ${locale === 'es' ? 'Chinese' : 'Spanish'}`}
      title={`Current: ${currentLanguage.label}`}
    >
      <span className="text-base">{currentLanguage.flag}</span>
      <span className="text-xs font-semibold">{currentLanguage.label}</span>
    </button>
  );
}