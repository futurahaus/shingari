'use client';

import { useState } from 'react';
import { Product } from '@/components/ProductCard';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ProductTabsProps {
  product: Product;
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [open, setOpen] = useState<'description' | 'characteristics' | null>('description');

  const toggle = (section: 'description' | 'characteristics') => {
    setOpen(prev => (prev === section ? null : section));
  };

  return (
    <div className="divide-y divide-gray-200">
      {/* Descripción */}
      <div>
        <button
          className="w-full flex justify-between items-center py-4 focus:outline-none"
          onClick={() => toggle('description')}
        >
          <span className="text-xl font-bold text-black">Descripción</span>
          <span className="text-2xl text-gray-700 transition-transform duration-300">
            {open === 'description' ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </span>
        </button>
        <div className={`grid transition-all duration-300 ease-in-out ${open === 'description' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="pb-6">
              <p style={{ color: '#838383' }} className="text-gray-400 text-lg leading-snug">{product.description}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Características */}
      <div>
        <button
          className="w-full flex justify-between items-center py-4 focus:outline-none"
          onClick={() => toggle('characteristics')}
        >
          <span className="text-xl font-bold text-black">Características</span>
          <span className="text-2xl text-gray-700 transition-transform duration-300">
            {open === 'characteristics' ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </span>
        </button>
        <div className={`grid transition-all duration-300 ease-in-out ${open === 'characteristics' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="pb-6">
              <p className="text-gray-400 text-lg leading-snug" style={{ color: '#838383' }}>Aquí podrían ir otras características del producto.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 