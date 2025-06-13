import { RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/components/ProductCard';

interface BundledProductsProps {
  bundledProducts: Product[];
}

export function BundledProducts({ bundledProducts }: BundledProductsProps) {
  const totalOriginalPrice = bundledProducts.reduce((sum, product) => sum + (product.originalPrice || product.price), 0);
  const totalCurrentPrice = bundledProducts.reduce((sum, product) => sum + product.price, 0);
  const totalDiscountPercentage = totalOriginalPrice > totalCurrentPrice 
    ? Math.round(((totalOriginalPrice - totalCurrentPrice) / totalOriginalPrice) * 100)
    : 0;

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-bold mb-4">¡Llévalos juntos!</h2>
      <div className="flex flex-col gap-4">
        {bundledProducts.map((product, idx) => {
          const hasDiscount = product.discount && product.originalPrice;
          return (
            <div key={product.id} className={`flex items-center gap-4 p-2 rounded-lg`}>
              <Image src={product.image || '/placeholder.svg'} alt={product.name} width={48} height={48} className="rounded-md" />
              <div className="flex-1">
                <p className="font-semibold">{product.name}</p>
                {/* <p className="text-sm text-gray-500">{product.brand.name}</p> */}
                <div className="flex items-center gap-2">
                  {hasDiscount && (
                    <span className="px-1 py-0.5 text-xs font-bold text-white bg-orange-500 rounded-md">
                      -{product.discount}%
                    </span>
                  )}
                  <p className="font-semibold">${new Intl.NumberFormat('es-CO').format(product.price)}</p>
                  {hasDiscount && product.originalPrice && (
                    <p className="text-sm text-gray-400 line-through">${new Intl.NumberFormat('es-CO').format(product.originalPrice)}</p>
                  )}
                </div>
              </div>
              {idx > 0 && ( // Assuming first product is main and not replaceable
                <button className="button p-2 text-gray-500 hover:text-gray-800">
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <div>
          <p className="text-lg font-bold">Total</p>
          {totalDiscountPercentage > 0 && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-sm font-bold text-white bg-orange-500 rounded-md">-{totalDiscountPercentage}%</span>
              <p className="text-gray-400 line-through">${totalOriginalPrice.toFixed(2)}</p>
            </div>
          )}
        </div>
        <p className="text-2xl font-bold">${totalCurrentPrice.toFixed(2)}</p>
      </div>
      <button className="button w-full px-4 py-3 mt-4 font-bold text-orange-600 bg-white border border-orange-600 rounded-md hover:bg-orange-50">
        Agregar al carrito
      </button>
    </div>
  );
} 