"use client";
import React from "react";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import { useRouter } from 'next/navigation';

const CarritoPage = () => {
  const { cart, updateQuantity, removeFromCart, removeAllFromCart } = useCart();
  const router = useRouter();
  // Calculate totals
  const total = cart.reduce(
    (sum, p) =>
      sum +
      (Array.isArray(p.units)
        ? p.units.reduce((uSum, u) => uSum + p.price * u.quantity, 0)
        : 0),
    0
  );
  const discount = 0; // Placeholder for discounts
  const discountedTotal = total - discount;
  const shipping = 0; // Placeholder shipping `cost`

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-6xl px-6 py-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Mi Carrito</h1>
        <button className="text-red-500 text-sm underline self-end" onClick={removeAllFromCart}>
          Vaciar carrito
        </button>
      </header>
      <main className="w-full max-w-6xl flex flex-col md:flex-row gap-8 px-6">
        {/* Product List */}
        <section className="flex-1 bg-white rounded-lg shadow p-4 divide-y divide-gray-200">
          <div className="flex font-bold text-lg mb-4">
            <span className="flex-1">Producto</span>
            <span className="w-32 text-center">Cantidad</span>
            <span className="w-32 text-right">Total</span>
          </div>
          {cart.length === 0 ? (
            <div className="py-8 text-center text-gray-500">Tu carrito está vacío.</div>
          ) : (
            cart.flatMap((item) =>
              item.units.map((unit) => (
                  <div key={item.id + unit.unitId}
                  className="flex items-center gap-4 py-4">
                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={64} height={64} className="object-cover rounded" />
                    ) : (
                      <div className="w-14 h-14 bg-gray-300 rounded" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base">{item.name}</div>
                    <div className="text-xs text-gray-500">{unit.unitId || "Unidades"}</div>
                  </div>
                  <div className="w-32 flex items-center justify-center gap-2">
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
                  </div>
                  <div className="w-32 text-right font-semibold">
                    € {(item.price * unit.quantity).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </div>
                  <button
                    className="ml-4 text-xs text-red-500 hover:underline"
                    onClick={() => removeFromCart(item.id, unit.unitId)}
                  >Eliminar</button>
                </div>
              ))
            )
          )}
        </section>
        {/* Summary */}
        <aside className="w-full md:w-96 bg-white rounded-lg shadow p-6 flex flex-col gap-4">
          <h2 className="font-bold text-lg mb-2">Resumen de la compra</h2>
          <div className="flex justify-between text-sm">
            <span>Precio de mis productos:</span>
            <span>€{total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Descuentos:</span>
            <span>- €{discount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Gastos del envío:</span>
            <span>€{shipping.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-4 mt-4">
            <span>Total de mis productos:</span>
            <span>€{(discountedTotal + shipping).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col gap-2 mt-6">
            <button className="w-full bg-[#EA3D15] text-white py-3 rounded-md font-semibold text-lg hover:bg-[#d43e0e] transition cursor-pointer">
              Continuar compra
            </button>
            <button className="w-full bg-white border border-gray-300 text-gray-800 py-3 rounded-md font-semibold text-lg hover:bg-gray-100 transition cursor-pointer"
              onClick={() => {
                router.push('/products');
              }}>
              Ver más productos
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default CarritoPage;