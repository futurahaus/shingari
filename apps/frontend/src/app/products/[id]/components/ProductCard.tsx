import Image from 'next/image';

interface ProductCardProps {
  product: {
    name: string;
    price: string;
    originalPrice: string;
    description: string;
    discount: string;
    image: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="flex flex-col w-64 p-2 bg-white border border-gray-200 rounded-lg">
      <div className="relative w-full h-48 bg-gray-100 rounded-lg">
        <Image
          src={product.image}
          alt={product.name}
          layout="fill"
          objectFit="contain"
          className="rounded-lg"
        />
        <span className="absolute top-2 right-2 px-2 py-1 text-sm font-bold text-white bg-orange-500 rounded-md">
          {product.discount}
        </span>
      </div>
      <div className="flex flex-col flex-grow p-2">
        <h3 className="text-lg font-bold">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="font-bold text-orange-600">{product.price}</p>
          <p className="text-sm text-gray-400 line-through">{product.originalPrice}</p>
        </div>
        <p className="mt-1 text-sm text-gray-500">{product.description}</p>
        <button className="w-full px-4 py-2 mt-4 font-bold text-white bg-orange-600 rounded-md hover:bg-orange-700">
          Agregar al carrito
        </button>
      </div>
    </div>
  );
} 