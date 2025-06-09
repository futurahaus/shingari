import { RefreshCw } from 'lucide-react';
import Image from 'next/image';

const bundledProducts = [
  {
    name: 'Arroz',
    brand: 'Marca del Arroz',
    price: '€0.000,00',
    originalPrice: '€0.000',
    discount: '-25%',
    image: '/placeholder.svg',
    main: true,
  },
  {
    name: 'Salsa de Soja',
    brand: 'Marca de producto',
    price: '€0.000,00',
    image: '/placeholder.svg',
  },
  {
    name: 'Salsa de Soja',
    brand: 'Marca de producto',
    price: '€0.000,00',
    image: '/placeholder.svg',
  },
];

export function BundledProducts() {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-bold mb-4">¡Llévalos juntos!</h2>
      <div className="flex flex-col gap-4">
        {bundledProducts.map((product, idx) => (
          <div key={idx} className={`flex items-center gap-4 p-2 rounded-lg ${product.main ? 'border border-orange-500' : ''}`}>
            <Image src={product.image} alt={product.name} width={48} height={48} className="rounded-md" />
            <div className="flex-1">
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-gray-500">{product.brand}</p>
              <div className="flex items-center gap-2">
                {product.discount && (
                  <span className="px-1 py-0.5 text-xs font-bold text-white bg-orange-500 rounded-md">
                    {product.discount}
                  </span>
                )}
                <p className="font-semibold">{product.price}</p>
                {product.originalPrice && (
                  <p className="text-sm text-gray-400 line-through">{product.originalPrice}</p>
                )}
              </div>
            </div>
            {!product.main && (
              <button className="p-2 text-gray-500 hover:text-gray-800">
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <div>
          <p className="text-lg font-bold">Total</p>
          <div className="flex items-center gap-2">
             <span className="px-2 py-1 text-sm font-bold text-white bg-orange-500 rounded-md">-25%</span>
             <p className="text-gray-400 line-through">€100.000</p>
          </div>
        </div>
        <p className="text-2xl font-bold">€000.000,00</p>
      </div>
      <button className="w-full px-4 py-3 mt-4 font-bold text-orange-600 bg-white border border-orange-600 rounded-md hover:bg-orange-50">
        Agregar al carrito
      </button>
    </div>
  );
} 