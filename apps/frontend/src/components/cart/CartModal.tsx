"use client";
import React, { useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/components/ProductCard';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { QuantityControls } from '../QuantityControls';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useTranslation } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';

export const CartModal = () => {
  const {
    cart,
    removeFromCart,
    removeAllFromCart,
    isCartOpen,
    closeCart,
    refreshCartData,
  } = useCart();

  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();

  const modalRef = useRef<HTMLDivElement>(null);

  const { showWarning } = useNotificationContext();

  // Helper function to check if user is business
  const isBusinessUser = user?.roles?.includes('business') || false;

  // Helper function to format IVA display
  const formatIvaDisplay = (iva: number): string => {
    // Ensure it's displayed as percentage
    if (iva < 1 && iva > 0) {
      return (iva * 100).toFixed(0);
    }
    return iva.toFixed(0);
  };

  // Close on Escape key
  useEffect(() => {
    if (!isCartOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Calculate totals
  const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);
  // For now, no discounts
  const discount = 0;
  const discountedTotal = total - discount;

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay for click outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={closeCart}
        style={{ background: 'transparent' }}
      />
      {/* Modal */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-lg overflow-y-auto"
        ref={modalRef}
      >
        <button
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black cursor-pointer"
          onClick={closeCart}
          aria-label={t('cart.close')}
        >
          ×
        </button>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">
            {t('cart.my_cart')} <span className="font-normal text-base">({cart.length} {cart.length === 1 ? t('cart.product_singular') : t('cart.product_plural')})</span>
          </h2>
          <div className="divide-y divide-gray-200">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-gray-500">{t('cart.empty')}</div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={96} height={96} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">{t('cart.product')}</div>
                    <div className="font-bold text-sm mb-1">{item.name}</div>
                    <div className="text-lg font-semibold mb-2">€ {item.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                    {isBusinessUser && item.iva && (
                      <div className="text-xs text-gray-600 mb-2">
                        IVA: {formatIvaDisplay(item.iva)}%
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <QuantityControls
                        productId={item.id}
                        productName={item.name}
                        productPrice={item.price}
                        productImage={item.image || ''}
                        unitsPerBox={item.units_per_box}
                        variant="inline"
                        iva={item.iva}
                      />
                      {/* Box indicator */}
                      {item.units_per_box && item.quantity && item.quantity > 0 && typeof window !== 'undefined' && (() => {
                        // Try to get units_per_box from the product list in localStorage (if available)
                        const products = JSON.parse(localStorage.getItem('products') || '[]');
                        const prod = products.find((p: Product) => p.id === item.id);
                        const unitsPerBox = prod?.units_per_box || 0;
                        if (unitsPerBox > 1) {
                          const boxes = Math.floor(item.quantity / unitsPerBox);
                          if (boxes > 0) {
                            return <span className="ml-2 text-xs text-blue-500">({boxes} {t('cart.boxes')})</span>;
                          }
                        }
                        return null;
                      })()}
                    </div>
                    <button
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                      onClick={() => {
                        removeFromCart(item.id);
                        showWarning(t('cart.product_removed'), `"${item.name}" ${t('quantity_controls.product_removed_from_cart').replace('{{productName}}', '').trim()}`, 2000);
                      }}
                    >{t('cart.remove')}</button>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* removeAllFromCart */}
          <button
            className="text-xs text-red-500 hover:underline cursor-pointer"
            onClick={() => {
              removeAllFromCart();
              showWarning(t('cart.cart_emptied'), t('cart.all_products_removed'), 2000);
            }}
          >{t('cart.remove_all')}</button>

          <div className="text-sm space-y-1 mb-6">
            <div className="flex justify-between">
              <span>{t('cart.product_prices')}</span>
              <span>€{total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>{t('cart.discount_price')}</span>
              <span>€{discountedTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('cart.total_products')}</span>
              <span>€{total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <button className="w-full bg-[#F24E1E] text-white py-3 rounded-md font-semibold text-lg hover:bg-[#d43e0e] transition cursor-pointer"
            onClick={() => {
              router.push('/carrito');
              closeCart();
            }}
          >
            {t('cart.go_to_cart')}
          </button>
        </div>
      </div>
    </>
  );
};