"use client";
import React, { useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/components/ProductCard';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { QuantityControls } from '../QuantityControls';
import { useNotificationContext } from '@/contexts/NotificationContext';

export const CartModal = () => {
  const {
    cart,
    removeFromCart,
    removeAllFromCart,
    isCartOpen,
    closeCart,
  } = useCart();

  const router = useRouter();

  const modalRef = useRef<HTMLDivElement>(null);

  const { showWarning } = useNotificationContext();

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
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">
            Mi Carrito <span className="font-normal text-base">({cart.length} producto{cart.length !== 1 ? 's' : ''})</span>
          </h2>
          <div className="divide-y divide-gray-200">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-gray-500">Tu carrito está vacío.</div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={96} height={96} className="object-cover" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Producto</div>
                    <div className="font-bold text-sm mb-1">{item.name}</div>
                    <div className="text-lg font-semibold mb-2">€ {item.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <QuantityControls
                        productId={item.id}
                        productName={item.name}
                        productPrice={item.price}
                        productImage={item.image || ''}
                        unitsPerBox={item.units_per_box}
                        variant="inline"
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
                            return <span className="ml-2 text-xs text-blue-500">({boxes} cajas)</span>;
                          }
                        }
                        return null;
                      })()}
                    </div>
                    <button
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                      onClick={() => {
                        removeFromCart(item.id);
                        showWarning('Producto eliminado', `"${item.name}" eliminado del carrito.`, 2000);
                      }}
                    >Eliminar</button>
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
              showWarning('Carrito vacío', 'Todos los productos eliminados del carrito.', 2000);
            }}
          >Eliminar todos</button>
          <div className="text-sm space-y-1 mb-6">
            <div className="flex justify-between">
              <span>Precio de mis productos:</span>
              <span>€{total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Precio con descuento:</span>
              <span>€{discountedTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span>Total de mis productos:</span>
              <span>€{total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <button className="w-full bg-[#F24E1E] text-white py-3 rounded-md font-semibold text-lg hover:bg-[#d43e0e] transition cursor-pointer"
            onClick={() => {
              router.push('/carrito');
              closeCart();
            }}
          >
            Ir al carrito
          </button>
        </div>
      </div>
    </>
  );
};