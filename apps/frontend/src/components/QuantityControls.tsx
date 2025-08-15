import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useTranslation } from '@/contexts/I18nContext';

interface QuantityControlsProps {
    productId: string;
    productName: string;
    productPrice: number;
    productImage: string;
    unitsPerBox?: number;
    variant?: 'overlay' | 'inline';
    iva?: number;
}

export const QuantityControls = ({
    productId,
    productName,
    productPrice,
    productImage,
    unitsPerBox,
    variant = 'overlay',
    iva
}: QuantityControlsProps) => {
    const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
    const { showSuccess, showInfo, showWarning } = useNotificationContext();
    const { t } = useTranslation();
    const cartItem = cart.find((item) => item.id === productId);
    const [quantity, setQuantity] = useState(cartItem ? cartItem.quantity : 0);
    const [unitType, setUnitType] = useState<'units' | 'boxes'>('boxes');

    const handleAdd = () => {
        const increment = unitType === 'boxes' && unitsPerBox ? unitsPerBox : 1;
        const newQty = quantity + increment;
        setQuantity(newQty);
        if (cartItem) {
            updateQuantity(productId, newQty);
            showInfo(
                t('quantity_controls.quantity_updated'),
                t('quantity_controls.quantity_updated_to', { productName, quantity: newQty.toString() }),
                2000
            );
        } else {
            addToCart({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: increment,
                units_per_box: unitsPerBox,
                iva: iva,
            });
            showSuccess(
                t('quantity_controls.product_added'),
                t('quantity_controls.product_added_to_cart', { productName }),
                2000
            );
        }
    };

    const handleRemove = () => {
        if (quantity > 0) {
            const decrement = unitType === 'boxes' && unitsPerBox ? unitsPerBox : 1;
            const newQty = Math.max(0, quantity - decrement);
            setQuantity(newQty);
            if (newQty === 0) {
                removeFromCart(productId);
                showWarning(
                    t('quantity_controls.product_removed'),
                    t('quantity_controls.product_removed_from_cart', { productName }),
                    2000
                );
            } else {
                updateQuantity(productId, newQty);
                showInfo(
                    t('quantity_controls.quantity_updated'),
                    t('quantity_controls.quantity_updated_to', { productName, quantity: newQty.toString() }),
                    2000
                );
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
                showInfo(
                    t('quantity_controls.quantity_updated'),
                    t('quantity_controls.quantity_updated_to', { productName, quantity: newQuantity.toString() }),
                    2000
                );
            } else if (newQuantity > 0) {
                addToCart({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: newQuantity,
                    units_per_box: unitsPerBox,
                    iva: iva,
                });
                showSuccess(
                    t('quantity_controls.product_added'),
                    t('quantity_controls.product_added_to_cart', { productName }),
                    2000
                );
            }
            setQuantity(newQuantity);
        }
    };

    const containerClasses = variant === 'overlay'
        ? "absolute bottom-2 right-2 flex items-center bg-white/90 rounded-full shadow px-2 py-1 gap-2 z-10"
        : "flex items-center bg-white border border-gray-300 rounded-lg px-2 py-1 gap-2";

    const buttonClasses = variant === 'overlay'
        ? "w-6 h-6 flex items-center justify-center rounded-full bg-[#EA3D15] hover:bg-[#c53211] text-lg text-white font-bold cursor-pointer"
        : "w-6 h-6 flex items-center justify-center rounded-md bg-[#EA3D15] hover:bg-[#c53211] text-sm text-white font-bold cursor-pointer";

    const quantityClasses = variant === 'overlay'
        ? "w-4 text-center text-sm select-none"
        : "w-6 text-center text-sm font-medium select-none";

    const selectClasses = variant === 'overlay'
        ? "text-xs bg-white border border-gray-300 rounded px-1 py-0.5 cursor-pointer"
        : "text-xs bg-white border border-gray-300 rounded px-1 py-0.5 cursor-pointer";

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
                <option value="units">{t('quantity_controls.units')}</option>
                <option value="boxes">{t('quantity_controls.boxes')}</option>
            </select>
        </div>
    );
};