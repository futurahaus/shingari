'use client';

import { useState } from 'react';

export function ProductTabs() {
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
          <button
            onClick={() => setActiveTab('characteristics')}
            className={`${
              activeTab === 'characteristics'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
          >
            Características
          </button>
        </nav>
      </div>
      <div className="py-6">
        {activeTab === 'description' && (
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        )}
        {activeTab === 'characteristics' && (
          <p>
            Características del producto.
          </p>
        )}
      </div>
    </div>
  );
} 