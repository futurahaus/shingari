'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  label: string;
}

export function QuantitySelector({ label }: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="flex items-center justify-between w-full">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center">
        <button
          onClick={decrement}
          className="p-2 bg-gray-200 rounded-l-md hover:bg-gray-300"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={quantity}
          readOnly
          className="w-12 text-center border-t border-b border-gray-200"
        />
        <button
          onClick={increment}
          className="p-2 bg-gray-200 rounded-r-md hover:bg-gray-300"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 