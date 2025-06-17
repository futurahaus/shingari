'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  label: string;
}

export function QuantitySelector({ label }: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(0);

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 0 ? prev - 1 : 0));

  return (
    <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center" style={{ borderTop: '1px solid var(--primary)', borderBottom: '1px solid var(--primary)', borderRadius: '10px' }}>
        <button
          onClick={decrement}
          style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderTopRightRadius: '0px', borderBottomRightRadius: '0px' }}
          className="button p-2 bg-gray-200 hover:bg-gray-300"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={quantity}
          readOnly
          className="w-12 text-center border-t border-b border-gray-200 focus:outline-none focus:border-none"
        />
        <button
          onClick={increment}
          style={{ borderTopRightRadius: '10px', borderBottomRightRadius: '10px', borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px' }}
          className="button p-2 bg-gray-200 hover:bg-gray-300"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
} 