"use client";
import React, { useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export const CartModal = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    removeAllFromCart,
    isCartOpen,
    closeCart,
  } = useCart();

  const router = useRouter();

  const modalRef = useRef<HTMLDivElement>(null);

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
  const total = cart.reduce(
    (sum, p) =>
      sum +
      (Array.isArray(p.units)
        ? p.units.reduce((uSum, u) => uSum + p.price * u.quantity, 0)
        : 0),
    0
  );
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
              cart.flatMap((item) =>
                item.units.map((unit) => (
                  <div key={item.id + unit.unitId} className="py-4 flex gap-4">
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
                        <button
                          className="px-2 py-1 bg-gray-100 rounded cursor-pointer"
                          onClick={() => updateQuantity(item.id, unit.unitId, Math.max(1, unit.quantity - 1))}
                          disabled={unit.quantity <= 1}
                        >-</button>
                        <span className="mx-1">{unit.quantity}</span>
                        <button
                          className="px-2 py-1 bg-gray-100 rounded cursor-pointer"
                          onClick={() => updateQuantity(item.id, unit.unitId, unit.quantity + 1)}
                        >+</button>
                        <span className="ml-2 text-xs text-gray-500">{unit.unitId || 'Unidades'}</span>
                      </div>
                      <button
                        className="text-xs text-red-500 hover:underline cursor-pointer"
                        onClick={() => removeFromCart(item.id, unit.unitId)}
                      >Eliminar</button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
          {/* removeAllFromCart */}
          <button
            className="text-xs text-red-500 hover:underline cursor-pointer"
            onClick={() => removeAllFromCart()}
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