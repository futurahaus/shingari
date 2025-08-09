// Example demonstrating how the footer works with internationalization

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';

export function FooterI18nExample() {
  const { locale, setLocale } = useI18n();

  const footerTranslations = {
    es: {
      home: "Home",
      offers: "Ofertas",
      contact: "Contacto",
      others: "Otros",
      brands: "Marcas",
      instagram: "Instagram",
      twitter: "Twitter",
      facebook: "Facebook",
      all_rights_reserved: "@2025 Todos los derechos reservados."
    },
    zh: {
      home: "首页",
      offers: "优惠",
      contact: "联系",
      others: "其他",
      brands: "品牌",
      instagram: "Instagram",
      twitter: "Twitter",
      facebook: "Facebook",
      all_rights_reserved: "@2025 保留所有权利。"
    }
  };

  const currentTranslations = footerTranslations[locale as keyof typeof footerTranslations] || footerTranslations.es;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Footer Internationalization Demo</h2>
        <p className="text-gray-600 mb-4">
          Current locale: <strong>{locale}</strong>
        </p>
        
        {/* Locale switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setLocale('es')}
            className={`px-4 py-2 rounded ${
              locale === 'es' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Español
          </button>
          <button
            onClick={() => setLocale('zh')}
            className={`px-4 py-2 rounded ${
              locale === 'zh' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            中文
          </button>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded p-4 mb-6">
          <p className="text-purple-800">
            <strong>🦶 Footer I18n:</strong> All footer texts are now internationalized.
          </p>
          <p className="text-purple-600 text-sm mt-1">
            The footer includes navigation links, social media labels, and copyright text in multiple languages.
          </p>
        </div>
      </div>

      {/* Footer Demo */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <footer className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
            {/* Navigation Menu */}
            <nav className="w-full mb-8">
              <ul className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-24">
                <li className="font-normal text-[14px] leading-6 tracking-[0px] text-center text-gray-600">
                  {currentTranslations.home}
                </li>
                <li className="font-normal text-[14px] leading-6 tracking-[0px] text-center text-gray-600">
                  {currentTranslations.offers}
                </li>
                <li className="font-normal text-[14px] leading-6 tracking-[0px] text-center text-gray-600">
                  {currentTranslations.contact}
                </li>
                <li className="font-normal text-[14px] leading-6 tracking-[0px] text-center text-gray-600">
                  {currentTranslations.others}
                </li>
                <li className="font-normal text-[14px] leading-6 tracking-[0px] text-center text-gray-600">
                  {currentTranslations.brands}
                </li>
              </ul>
            </nav>
            
            {/* Social Media */}
            <div className="flex justify-center items-center gap-8 mb-6">
              {/* Instagram */}
              <a href="#" aria-label={currentTranslations.instagram} className="text-gray-400 hover:text-gray-600">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="5" strokeWidth="1"/>
                  <circle cx="12" cy="12" r="3.5" strokeWidth="1"/>
                  <circle cx="17" cy="7" r="1.5" fill="currentColor"/>
                </svg>
              </a>
              {/* Twitter */}
              <a href="#" aria-label={currentTranslations.twitter} className="text-gray-400 hover:text-gray-600">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M22 5.92a8.38 8.38 0 01-2.36.65A4.13 4.13 0 0021.4 4.1a8.19 8.19 0 01-2.6 1A4.11 4.11 0 0012 8.09v.5A11.65 11.65 0 013 5.13s-4 9 5 13a11.64 11.64 0 01-7 2c9 5.5 20 0 20-11.5a4.1 4.1 0 00-.08-.74A5.94 5.94 0 0022 5.92z" strokeWidth="1"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" aria-label={currentTranslations.facebook} className="text-gray-400 hover:text-gray-600">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="1"/>
                  <path d="M15 8h-2a1 1 0 00-1 1v2h3l-.5 3h-2.5v7" strokeWidth="1"/>
                </svg>
              </a>
            </div>
            
            {/* Copyright */}
            <div className="text-center mt-2">
              <p className="text-base text-gray-600">
                {currentTranslations.all_rights_reserved}
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        
        {/* Translation Keys */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-bold mb-4">🔧 Footer Translation Keys</h4>
          <div className="space-y-2 text-sm">
            {Object.keys(currentTranslations).map(key => (
              <div key={key} className="flex flex-col gap-1 p-2 bg-white rounded">
                <code className="text-blue-600 text-xs">footer.{key}</code>
                <span className="text-gray-800">{currentTranslations[key as keyof typeof currentTranslations]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Special Features */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-bold mb-4 text-blue-800">✨ I18n Features</h4>
          <div className="space-y-3 text-sm text-blue-700">
            <div>
              <strong>Navigation Links:</strong>
              <div className="text-xs mt-1">
                ES: Home, Ofertas, Contacto, Otros, Marcas<br/>
                ZH: 首页, 优惠, 联系, 其他, 品牌
              </div>
            </div>
            <div>
              <strong>Social Media Labels:</strong>
              <div className="text-xs mt-1">
                Universal: Instagram, Twitter, Facebook<br/>
                (Accessible via aria-label)
              </div>
            </div>
            <div>
              <strong>Copyright Notice:</strong>
              <div className="text-xs mt-1">
                ES: &quot;@2025 Todos los derechos reservados.&quot;<br/>
                ZH: &quot;@2025 保留所有权利。&quot;
              </div>
            </div>
            <div>
              <strong>Accessibility:</strong>
              <div className="text-xs mt-1">
                ARIA labels localized for screen readers
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Implementation */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded p-4">
        <h4 className="font-semibold mb-2 text-green-800">📋 Implementation Highlights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
          <div>
            <strong>Navigation Items:</strong>
            <code className="block text-xs mt-1 bg-white p-1 rounded">
              {`<li>{t('footer.home')}</li>`}
            </code>
          </div>
          <div>
            <strong>Social Media Accessibility:</strong>
            <code className="block text-xs mt-1 bg-white p-1 rounded">
              {`aria-label={t('footer.instagram')}`}
            </code>
          </div>
          <div>
            <strong>Copyright Text:</strong>
            <code className="block text-xs mt-1 bg-white p-1 rounded">
              {`<p>{t('footer.all_rights_reserved')}</p>`}
            </code>
          </div>
          <div>
            <strong>Structure Preserved:</strong>
            <code className="block text-xs mt-1 bg-white p-1 rounded">
              {`useTranslation() + existing styles`}
            </code>
          </div>
        </div>
      </div>

      {/* Language Comparison */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
        <h4 className="font-semibold mb-2 text-yellow-800">🌍 Language Comparison</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
          <div>
            <strong>Spanish (Español):</strong>
            <ul className="text-xs mt-1 space-y-1">
              <li>• Home → Home</li>
              <li>• Offers → Ofertas</li>
              <li>• Contact → Contacto</li>
              <li>• Others → Otros</li>
              <li>• Brands → Marcas</li>
              <li>• Copyright → &quot;Todos los derechos reservados&quot;</li>
            </ul>
          </div>
          <div>
            <strong>Chinese (中文):</strong>
            <ul className="text-xs mt-1 space-y-1">
              <li>• Home → 首页</li>
              <li>• Offers → 优惠</li>
              <li>• Contact → 联系</li>
              <li>• Others → 其他</li>
              <li>• Brands → 品牌</li>
              <li>• Copyright → &quot;保留所有权利&quot;</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-6 bg-cyan-50 border border-cyan-200 rounded p-4">
        <h4 className="font-semibold mb-2 text-cyan-800">🎯 User Experience Benefits</h4>
        <ul className="text-sm text-cyan-700 space-y-1">
          <li>• <strong>Instant localization:</strong> Footer updates immediately when language changes</li>
          <li>• <strong>Cultural awareness:</strong> Copyright text adapted to local conventions</li>
          <li>• <strong>Accessibility compliance:</strong> Social media links have localized ARIA labels</li>
          <li>• <strong>Professional appearance:</strong> Consistent language throughout the site footer</li>
          <li>• <strong>SEO friendly:</strong> Localized navigation helps with search engine indexing</li>
          <li>• <strong>Global reach:</strong> Users worldwide can understand footer navigation</li>
        </ul>
      </div>
    </div>
  );
}