'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/app/ui/components/Button';

export default function PagosPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    cardholderName: '',
    id: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Calcular totales
  const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const shipping = 0; // Gastos de envío
  const discount = 0; // Descuento por puntos
  const finalTotal = total + shipping - discount;

  const handleCardDataChange = (field: string, value: string) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePaymentConfirmation = async () => {
    if (!selectedPaymentMethod) {
      alert('Por favor selecciona un método de pago');
      return;
    }
    if (selectedPaymentMethod === 'card' && (!cardData.cardNumber || !cardData.expiry || !cardData.cvc || !cardData.cardholderName || !cardData.id)) {
      alert('Por favor completa todos los campos de la tarjeta');
      return;
    }

    setIsLoading(true);
    try {
      // Crear la orden en el backend
      const orderData = {
        total_amount: finalTotal,
        currency: 'EUR',
        status: 'pending',
        order_lines: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        order_addresses: [
          {
            type: 'billing',
            full_name: cardData.cardholderName || 'Cliente',
            address_line1: 'Dirección de facturación',
            city: 'Ciudad',
            postal_code: '00000',
            country: 'España',
            phone: '',
          },
          {
            type: 'shipping',
            full_name: cardData.cardholderName || 'Cliente',
            address_line1: 'Dirección de envío',
            city: 'Ciudad',
            postal_code: '00000',
            country: 'España',
            phone: '',
          },
        ],
        order_payments: [
          {
            payment_method: selectedPaymentMethod,
            amount: finalTotal,
            metadata: {
              card_last_four: cardData.cardNumber.slice(-4),
              card_type: 'credit',
            },
          },
        ],
      };

      console.log('Sending order data:', JSON.stringify(orderData, null, 2));

      const order = await api.post<{ id: string }, typeof orderData>('/orders', orderData);

      // Vaciar el carrito después de crear la orden exitosamente
      clearCart();

      router.push(`/congrats?orderId=${order.id}`);
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Overlay de carga */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA3D15] mb-4"></div>
            <span className="text-gray-700 font-medium">Procesando pedido...</span>
          </div>
        </div>
      )}
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-16 py-8">
        <div className="">
          <h1 className="text-xl font-bold text-black mb-8">Selecciona método de pago</h1>

          {/* Payment Methods */}
          <div className="space-y-4">
              {/* <div
                className={`border border-gray-300 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPaymentMethod === 'card' ? 'bg-[#EA3D15] text-white' : 'bg-gray-50'
                }`}
                onClick={() => setSelectedPaymentMethod('card')}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-5 h-5 ${
                      selectedPaymentMethod === 'card' ? 'text-white' : 'text-gray-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    <path d="M6 14h4v2H6z"/>
                  </svg>
                  <span className={selectedPaymentMethod === 'card' ? 'text-white' : 'text-gray-600'}>
                    Tarjeta de débito/crédito
                  </span>
                </div>
              </div> */}

              <div
                className={`border border-gray-300 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPaymentMethod === 'cash' ? 'bg-[#EA3D15] text-white' : 'bg-gray-50'
                }`}
                onClick={() => setSelectedPaymentMethod('cash')}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-5 h-5 ${
                      selectedPaymentMethod === 'cash' ? 'text-white' : 'text-gray-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                  </svg>
                  <span className={selectedPaymentMethod === 'cash' ? 'text-white' : 'text-gray-600'}>
                    Efectivo
                  </span>
                </div>
              </div>
            </div>

            {/* Card Form */}
            {selectedPaymentMethod === 'card' && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold text-black mb-4">Tarjetas de Crédito y Débito</h2>

                <div className="flex gap-6">
                  {/* Form Fields */}
                  <div className="flex-1 space-y-6">
                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Número de tarjeta *
                      </label>
                      <input
                        type="text"
                        placeholder="xxxx xxxx xxxx xxxx"
                        value={cardData.cardNumber}
                        onChange={(e) => handleCardDataChange('cardNumber', formatCardNumber(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EA3D15]"
                        maxLength={19}
                      />
                    </div>

                    {/* Expiry and CVC */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-black mb-2">
                          Vencimiento *
                        </label>
                        <input
                          type="text"
                          placeholder="mm/aa"
                          value={cardData.expiry}
                          onChange={(e) => handleCardDataChange('expiry', formatExpiry(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EA3D15]"
                          maxLength={5}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-black mb-2">
                          CVC *
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cardData.cvc}
                          onChange={(e) => handleCardDataChange('cvc', e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EA3D15]"
                          maxLength={3}
                        />
                      </div>
                    </div>

                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        Nombre en la tarjeta *
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={cardData.cardholderName}
                        onChange={(e) => handleCardDataChange('cardholderName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EA3D15]"
                      />
                    </div>

                    {/* ID */}
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        ID *
                      </label>
                      <input
                        type="text"
                        placeholder="987654321"
                        value={cardData.id}
                        onChange={(e) => handleCardDataChange('id', e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EA3D15]"
                      />
                    </div>
                  </div>

                  {/* Card Visual */}
                  <div className="w-80 h-48 bg-gradient-to-b from-[#EA3D15] to-[#FF7050] rounded-2xl p-6 text-white relative">
                    <div className="absolute top-6 left-6">
                      <div className="w-12 h-8 bg-white/20 rounded"></div>
                    </div>
                    <div className="absolute top-6 right-6">
                      <div className="w-12 h-8 bg-white/20 rounded"></div>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="text-2xl font-normal mb-2">
                        {cardData.cardNumber || '**** **** **** ****'}
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-xs font-semibold mb-1">NOMBRE COMPLETO</div>
                          <div className="text-sm">{cardData.cardholderName || 'NOMBRE COMPLETO'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold mb-1">MM / AA</div>
                          <div className="text-sm">{cardData.expiry || 'MM / AA'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Order Summary - moved here */}
          <div className="mt-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-black border-b border-gray-200 pb-2 mb-4">
                Resumen de la compra
              </h3>

              <div className="space-y-4">
                {/* Products */}
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-black">Precio de mis productos:</span>
                  <span className="text-sm font-bold text-black">
                    €{total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Product Items */}
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-black">{item.name}</span>
                      <span className="text-xs font-medium text-black">x{item.quantity}</span>
                    </div>
                    <span className="text-sm font-medium text-black">
                      €{(item.price * item.quantity).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}

                {/* Shipping */}
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-black">Gastos del envío</span>
                  <span className="text-sm font-bold text-black">
                    €{shipping.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Discount */}
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-black">Descuento por puntos:</span>
                  <span className="text-sm font-bold text-black">
                    €{discount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Total */}
                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <span className="text-lg font-bold text-black">Total de mis productos:</span>
                  <span className="text-lg font-bold text-black">
                    €{finalTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Continue Button */}
              <div className="mt-4">
                <Button
                  onPress={handlePaymentConfirmation}
                  type="primary"
                  text="Confirmar pedido"
                  testID="pay-button"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}