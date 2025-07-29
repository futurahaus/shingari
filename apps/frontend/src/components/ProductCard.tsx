import Image from 'next/image';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { useRouter } from 'next/navigation';
import { QuantityControls } from './QuantityControls';

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
    units_per_box?: number;
    iva?: number;
}

export const ProductCard = ({ product }: { product: Product }) => {
    const router = useRouter();

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointe h-full flex flex-col">
            <div className="bg-white h-48 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                {product.images.length > 0 ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain object-center transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <Text as="div" size="sm" color="gray-400" className="text-center">
                        Sin imagen
                    </Text>
                )}
                {/* Quantity controls */}
                <QuantityControls
                    productId={product.id}
                    productName={product.name}
                    productPrice={product.price}
                    productImage={product.images[0]}
                    unitsPerBox={product.units_per_box}
                />
            </div>
            <div className="p-4 flex flex-col flex-1">
                <Text as="h3" size="lg" weight="bold" color="primary" testID={`product-name-${product.id}`} className="line-clamp-2 mb-2">
                    {product.name}
                </Text>
                <div className="flex items-center mt-2 mb-2">
                    <div className="flex flex-col">
                        <Text as="h4" size="md" weight="semibold" color="gray-900" testID={`product-price-${product.id}`}>
                            {`€${new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(product.price)}`}
                        </Text>
                        {product.iva && product.iva > 0 && (
                            <Text as="span" size="xs" color="gray-500" className="text-xs">
                                IVA incluido ({product.iva}%)
                            </Text>
                        )}
                    </div>
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
                    className="mb-4 line-clamp-2 flex-1"
                    testID={`product-description-${product.id}`}
                >
                    {product.description}
                </Text>
                <div className="mt-auto">
                    <Button
                        onPress={() => {
                            router.push(`/products/${product.id}`);
                        }}
                        type="primary"
                        text="Ver Producto"
                        testID={`add-to-cart-${product.id}`}
                        icon="FaShoppingCart"
                    />
                </div>
            </div>
        </div>
    );
};