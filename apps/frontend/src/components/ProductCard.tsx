import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';

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

export const ProductCard = ({ product }: { product: Product }) => {
    console.log('ProductCard product:', product);
    return (
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
                        <Text as="div" size="sm" color="gray-400" className="text-center">
                            Sin imagen
                        </Text>
                    )}
                </div>
                <div className="p-4">
                    <Text as="h3" size="lg" weight="bold" color="primary" testID={`product-name-${product.id}`}>
                        {product.name}
                    </Text>
                    <div className="flex items-center mt-2">
                        <Text as="h4" size="md" weight="semibold" color="gray-900" testID={`product-price-${product.id}`}>
                            {`€${new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(product.price)}`}
                        </Text>
                        {(typeof product.discount === 'number' && product.discount > 0) && (
                            <Text
                                as="span"
                                size="xs"
                                weight="bold"
                                color="primary-contrast"
                                className="ml-auto bg-primary text-white leading-none tracking-normal align-middle px-2.5 py-0.5 rounded-full"
                                testID={`product-discount-${product.id}`}
                            >
                                -{product.discount.toFixed(2)}%
                            </Text>
                        )}
                    </div>
                    {(typeof product.discount === 'number' && product.discount > 0 && product.originalPrice) && (
                        <Text
                            as="h5"
                            size="sm"
                            color="tertiary"
                            className="line-through mb-2"
                            testID={`product-original-price-${product.id}`}
                        >
                            €{new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(product.originalPrice)}
                        </Text>
                    )}
                    <Text
                        as="p"
                        size="sm"
                        color="secondary"
                        className="mb-4 line-clamp-2"
                        testID={`product-description-${product.id}`}
                    >
                        {product.description}
                    </Text>
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
};