// Example demonstrating how React Query products hooks react to locale changes

import React from 'react';
import { useProductsQuery, useProductCategories } from '@/hooks/useProductsQuery';
import { useI18n } from '@/contexts/I18nContext';
import { ProductCard } from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';

export function LocaleReactivityExample() {
  const { locale, setLocale } = useI18n();
  
  // These queries will automatically update when locale changes
  const {
    products,
    categories,
    isLoading,
    error,
    locale: currentLocale
  } = useProductsQuery({
    limit: 6
  });

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    // No need to manually refetch - React Query handles this automatically
    // because the query keys include the locale
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Locale Reactivity Demo</h2>
        <p className="text-gray-600 mb-4">
          Current locale: <strong>{currentLocale}</strong>
        </p>
        
        {/* Locale switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleLocaleChange('es')}
            className={`px-4 py-2 rounded ${
              locale === 'es' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Español
          </button>
          <button
            onClick={() => handleLocaleChange('en')}
            className={`px-4 py-2 rounded ${
              locale === 'en' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            English
          </button>
          <button
            onClick={() => handleLocaleChange('pt')}
            className={`px-4 py-2 rounded ${
              locale === 'pt' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Português
          </button>
        </div>

        {/* Status indicator */}
        <div className="mb-4 p-3 rounded bg-blue-50 border border-blue-200">
          <p className="text-blue-800">
            <strong>📡 Query Status:</strong> {isLoading ? 'Loading...' : 'Loaded'}
          </p>
          <p className="text-blue-600 text-sm mt-1">
            When you change the locale, all product queries automatically refetch with the new language parameter.
          </p>
        </div>
      </div>

      {/* Categories section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Categories ({locale})</h3>
        {isLoading ? (
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <span
                key={category.id}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Products section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Products ({locale})</h3>
        
        {error ? (
          <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
            Error loading products: {error.message}
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Technical details */}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h4 className="font-semibold mb-2">🔧 How it works:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Query keys include the current locale: [&quot;products&quot;, &quot;{locale}&quot;, ...]</li>
          <li>• When locale changes, React Query sees different keys</li>
          <li>• Old cache is preserved, new data is fetched for new locale</li>
          <li>• No manual refetch needed - completely automatic</li>
          <li>• Each locale has its own cache space</li>
        </ul>
      </div>
    </div>
  );
}

// Simple categories-only example
export function CategoriesLocaleExample() {
  const { locale, setLocale } = useI18n();
  const { data: categories = [], isLoading, error } = useProductCategories();

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-3">Categories by Locale</h3>
      
      <div className="flex gap-2 mb-4">
        {['es', 'en', 'pt'].map(lang => (
          <button
            key={lang}
            onClick={() => setLocale(lang)}
            className={`px-3 py-1 text-sm rounded ${
              locale === lang 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div>Loading categories...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error.message}</div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Categories in {locale}: {categories.length}
          </p>
          <div className="text-xs space-y-1">
            {categories.slice(0, 5).map(cat => (
              <div key={cat.id}>{cat.name}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Performance monitoring example
export function QueryPerformanceExample() {
  const { locale } = useI18n();
  const [requestCount, setRequestCount] = React.useState(0);
  
  // Monitor when queries are made
  const { isLoading, isFetching } = useProductsQuery({ limit: 3 });
  
  React.useEffect(() => {
    if (isFetching) {
      setRequestCount(prev => prev + 1);
    }
  }, [isFetching]);

  return (
    <div className="p-4 border rounded bg-yellow-50">
      <h4 className="font-bold mb-2">📊 Performance Monitor</h4>
      <div className="text-sm space-y-1">
        <p><strong>Current locale:</strong> {locale}</p>
        <p><strong>Total requests made:</strong> {requestCount}</p>
        <p><strong>Currently fetching:</strong> {isFetching ? 'Yes' : 'No'}</p>
        <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
      </div>
      <p className="text-xs text-gray-600 mt-2">
        Notice how changing locale triggers new requests, but returning to a previous locale uses cache.
      </p>
    </div>
  );
}