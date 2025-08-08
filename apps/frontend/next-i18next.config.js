/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'zh'],
    localePath: './public/locales',
    defaultNS: 'common',
    fallbackLng: 'es',
  },
  // Optional: Configure reloadOnPrerender for development
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  
  // Interpolation configuration
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  
  // Configure detection options
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
  },
  
  // Configure debug mode for development
  debug: process.env.NODE_ENV === 'development',
  
  // Configure saveMissing for development
  saveMissing: process.env.NODE_ENV === 'development',
};