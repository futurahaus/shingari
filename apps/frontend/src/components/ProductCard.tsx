import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/app/ui/components/Button';
import { Text } from '@/app/ui/components/Text';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

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
}

export const ProductCard = ({ product }: { product: Product }) => {
    const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
    // Find current quantity in cart
    const cartItem = cart.find((item) => item.id === product.id);
    const [quantity, setQuantity] = useState(cartItem ? cartItem.quantity : 0);

    const handleAdd = () => {
        const newQty = quantity + 1;
        setQuantity(newQty);
        if (cartItem) {
            updateQuantity(product.id, newQty);
        } else {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0],
                quantity: 1,
            });
        }
    };

    const handleRemove = () => {
        if (quantity > 0) {
            const newQty = quantity - 1;
            setQuantity(newQty);
            if (newQty === 0) {
                removeFromCart(product.id);
            } else {
                updateQuantity(product.id, newQty);
            }
        }
    };

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
                <div className="absolute bottom-2 right-2 flex items-center bg-white/90 rounded-full shadow px-2 py-1 gap-2 z-10">
                    <button
                        type="button"
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-lg font-bold cursor-pointer"
                        onClick={e => { e.preventDefault(); e.stopPropagation(); handleRemove(); }}
                    >
                        -
                    </button>
                    <span className="w-4 text-center text-sm select-none">{quantity}</span>
                    <button
                        type="button"
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-lg font-bold cursor-pointer"
                        onClick={e => { e.preventDefault(); e.stopPropagation(); handleAdd(); }}
                    >
                        +
                    </button>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <Text as="h3" size="lg" weight="bold" color="primary" testID={`product-name-${product.id}`} className="line-clamp-2 mb-2">
                    {product.name}
                </Text>
                <div className="flex items-center mt-2 mb-2">
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
                    className="mb-4 line-clamp-2 flex-1"
                    testID={`product-description-${product.id}`}
                >
                    {product.description}
                </Text>
                <div className="mt-auto">
                    <Button
                        onPress={() => {
                            // Aquí puedes agregar la lógica para agregar al carrito
                            console.log('Agregar al carrito:', product.id);
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