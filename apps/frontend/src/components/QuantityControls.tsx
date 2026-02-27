import { useState, useCallback, useRef, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useTranslation } from '@/contexts/I18nContext';

const NUMERIC_KEYS = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter']);
const ALLOWED_KEYS = new Set([...NUMERIC_KEYS, 'Enter']);

interface QuantityControlsProps {
    productId: string;
    productName: string;
    productPrice: number;
    productImage: string;
    unitsPerBox?: number;
    variant?: 'overlay' | 'inline';
    iva?: number;
    stock?: number;
}

export const QuantityControls = ({
    productId,
    productName,
    productPrice,
    productImage,
    unitsPerBox,
    variant = 'overlay',
    iva,
    stock
}: QuantityControlsProps) => {
    const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
    const { showSuccess, showInfo, showWarning } = useNotificationContext();
    const { t } = useTranslation();
    const cartItem = cart.find((item) => item.id === productId);
    const [quantity, setQuantity] = useState(cartItem ? cartItem.quantity : 0);
    const [unitType, setUnitType] = useState<'units' | 'boxes'>('boxes');
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const displayValue = unitType === 'boxes' && unitsPerBox ? Math.trunc(quantity / unitsPerBox) : quantity;
    const maxDisplay = stock != null && stock > 0
        ? (unitType === 'boxes' && unitsPerBox ? Math.trunc(stock / unitsPerBox) : stock)
        : undefined;

    useEffect(() => {
        if (cartItem) setQuantity(cartItem.quantity);
        else setQuantity(0);
    }, [cartItem]);

    useEffect(() => {
        if (!isFocused) setInputValue(String(displayValue));
    }, [displayValue, isFocused]);

    const handleAdd = () => {
        const increment = unitType === 'boxes' && unitsPerBox ? unitsPerBox : 1;
        let newQty = quantity + increment;
        if (stock != null && stock > 0 && newQty > stock) newQty = stock;
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

    const inputWidth = variant === 'overlay' ? 'w-6' : 'w-8';
    const inputClasses = `${inputWidth} text-center text-sm bg-transparent border-none p-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;

    const handleInputCommit = useCallback(() => {
        const parsed = parseInt(inputValue, 10);
        if (Number.isNaN(parsed) || parsed < 0) {
            setInputValue(String(displayValue));
            return;
        }
        let newQty: number;
        if (unitType === 'boxes' && unitsPerBox) {
            newQty = parsed * unitsPerBox;
        } else {
            newQty = parsed;
        }
        if (stock != null && stock > 0 && newQty > stock) newQty = stock;
        setQuantity(newQty);
        setInputValue(String(unitType === 'boxes' && unitsPerBox ? Math.trunc(newQty / unitsPerBox) : newQty));
        if (newQty === 0) {
            removeFromCart(productId);
            showWarning(t('quantity_controls.product_removed'), t('quantity_controls.product_removed_from_cart', { productName }), 2000);
        } else if (cartItem) {
            updateQuantity(productId, newQty);
            showInfo(t('quantity_controls.quantity_updated'), t('quantity_controls.quantity_updated_to', { productName, quantity: newQty.toString() }), 2000);
        } else {
            addToCart({ id: productId, name: productName, price: productPrice, image: productImage, quantity: newQty, units_per_box: unitsPerBox, iva });
            showSuccess(t('quantity_controls.product_added'), t('quantity_controls.product_added_to_cart', { productName }), 2000);
        }
    }, [inputValue, displayValue, unitType, unitsPerBox, stock, cartItem, productId, productName, productPrice, productImage, removeFromCart, updateQuantity, addToCart, showWarning, showInfo, showSuccess, t, iva]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!ALLOWED_KEYS.has(e.key) && !(e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))) e.preventDefault();
        if (e.key === 'Enter') { e.preventDefault(); inputRef.current?.blur(); }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        if (v === '' || /^\d+$/.test(v)) setInputValue(v);
    };

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
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={isFocused ? inputValue : displayValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => { setIsFocused(true); setInputValue(String(displayValue)); }}
                onBlur={() => { setIsFocused(false); handleInputCommit(); }}
                className={inputClasses}
                min={0}
                max={maxDisplay}
                aria-label="Cantidad"
            />
            <button
                type="button"
                className={buttonClasses}
                disabled={stock != null && stock > 0 && quantity >= stock}
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