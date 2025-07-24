import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

interface QuantityControlsProps {
    productId: string;
    productName: string;
    productPrice: number;
    productImage: string;
    unitsPerBox?: number;
    variant?: 'overlay' | 'inline';
}

export const QuantityControls = ({
    productId,
    productName,
    productPrice,
    productImage,
    unitsPerBox,
    variant = 'overlay'
}: QuantityControlsProps) => {
    const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
    const cartItem = cart.find((item) => item.id === productId);
    const [quantity, setQuantity] = useState(cartItem ? cartItem.quantity : 0);
    const [unitType, setUnitType] = useState<'units' | 'boxes'>('units');

    const handleAdd = () => {
        const increment = unitType === 'boxes' && unitsPerBox ? unitsPerBox : 1;
        const newQty = quantity + increment;
        setQuantity(newQty);
        if (cartItem) {
            updateQuantity(productId, newQty);
        } else {
            addToCart({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: increment,
            });
        }
    };

    const handleRemove = () => {
        if (quantity > 0) {
            const decrement = unitType === 'boxes' && unitsPerBox ? unitsPerBox : 1;
            const newQty = Math.max(0, quantity - decrement);
            setQuantity(newQty);
            if (newQty === 0) {
                removeFromCart(productId);
            } else {
                updateQuantity(productId, newQty);
            }
        }
    };

    const handleUnitTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newUnitType = e.target.value as 'units' | 'boxes';
        setUnitType(newUnitType);

        if (newUnitType === 'boxes' && unitsPerBox && quantity > 0) {
            // Convertir unidades actuales a cajas y luego a unidades completas
            const currentBoxes = Math.trunc(quantity / unitsPerBox);
            const newQuantity = currentBoxes * unitsPerBox;

            if (cartItem) {
                updateQuantity(productId, newQuantity);
            } else if (newQuantity > 0) {
                addToCart({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: newQuantity,
                });
            }
            setQuantity(newQuantity);
        }
    };

    const containerClasses = variant === 'overlay'
        ? "absolute bottom-2 right-2 flex items-center bg-white/90 rounded-full shadow px-2 py-1 gap-2 z-10"
        : "flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 gap-3";

    const buttonClasses = variant === 'overlay'
        ? "w-6 h-6 flex items-center justify-center rounded-full bg-[#EA3D15] hover:bg-[#c53211] text-lg text-white font-bold cursor-pointer"
        : "w-8 h-8 flex items-center justify-center rounded-md bg-[#EA3D15] hover:bg-[#c53211] text-lg text-white font-bold cursor-pointer";

    const quantityClasses = variant === 'overlay'
        ? "w-4 text-center text-sm select-none"
        : "w-8 text-center text-base font-medium select-none";

    const selectClasses = variant === 'overlay'
        ? "text-xs bg-white border border-gray-300 rounded px-1 py-0.5 cursor-pointer"
        : "text-sm bg-white border border-gray-300 rounded px-2 py-1 cursor-pointer";

    return (
        <div className={containerClasses}>
            <button
                type="button"
                className={buttonClasses}
                onClick={e => { e.preventDefault(); e.stopPropagation(); handleRemove(); }}
            >
                -
            </button>
            <span className={quantityClasses}>
                {unitType === 'boxes' && unitsPerBox
                    ? Math.trunc(quantity / unitsPerBox)
                    : quantity}
            </span>
            <button
                type="button"
                className={buttonClasses}
                onClick={e => { e.preventDefault(); e.stopPropagation(); handleAdd(); }}
            >
                +
            </button>
            <select
                value={unitType}
                className={selectClasses}
                onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                onChange={handleUnitTypeChange}
            >
                <option value="units">Unidades</option>
                <option value="boxes">Cajas</option>
            </select>
        </div>
    );
}; 