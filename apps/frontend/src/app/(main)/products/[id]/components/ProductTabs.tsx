'use client';

import { useState } from 'react';
import { Product } from '@/components/ProductCard';

interface ProductTabsProps {
  product: Product;
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('description')}
            className={`${
              activeTab === 'description'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
          >
            Descripción
          </button>
          {/* A modo de ejemplo, podríamos tener otra pestaña si tuviéramos más datos */}
          {/* <button
            onClick={() => setActiveTab('characteristics')}
            className={`${
              activeTab === 'characteristics'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
          >
            Características
          </button> */}
        </nav>
      </div>
      <div className="py-6">
        {activeTab === 'description' && (
          <p>
            {product.description}
          </p>
        )}
        {/* {activeTab === 'characteristics' && (
          <div>
            <p>Aquí podrían ir otras características del producto.</p>
          </div>
        )} */}
      </div>
    </div>
  );
} 