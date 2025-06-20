import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/app/ui/components/Button';

export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    description: string;
    images: string[];
    categories: string[];
    sku?: string;
}

export const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/products/${product.id}`} className="block">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="bg-gray-200 h-48 flex items-center justify-center relative overflow-hidden">
                {product.images.length > 0 ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
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
                <Button
                    onPress={() => {
                        // Aquí puedes agregar la lógica para agregar al carrito
                        console.log('Agregar al carrito:', product.id);
                    }}
                    type="primary"
                    text="Agregar al carrito"
                    testID={`add-to-cart-${product.id}`}
                    icon="FaShoppingCart"
                />
            </div>
        </div>
    </Link>
); 