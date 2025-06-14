import Image from 'next/image';
import Link from 'next/link';

export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    description: string;
    images: string[];
    categories: string[];
}

export const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden group">
        <div className="bg-gray-200 h-48 flex items-center justify-center relative">
            {product.images.length > 0 ? (
                <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                />
            ) : (
                <div className="text-gray-400">Sin imagen</div>
            )}
        </div>
        <div className="p-4">
            <h3 className="text-lg font-bold">{product.name}</h3>
            <div className="flex items-center mt-2">
                <h4>
                    {`€${new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(product.price)}`}
                </h4>
                {product.discount && (
                    <span className="ml-auto bg-primary text-white text-xs font-bold leading-none tracking-normal align-middle px-2.5 py-0.5 rounded-full">
                        -{product.discount.toFixed(2)}%
                    </span>
                )}
            </div>
            {product.discount && product.originalPrice && (
                <h5 className="text-sm text-gray-500 line-through mb-2">
                    €{new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(product.originalPrice)}
                </h5>
            )}
            <p className="mb-4 line-clamp-2">{product.description}</p>
            <Link href={`/products/${product.id}`} className="block w-full">
                <button className="button w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                    <b>Agregar al carrito</b>
                </button>
            </Link>
        </div>
    </div>
); 