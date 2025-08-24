'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/app/ui/components/Button';
import { useTranslation } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';

export default function PagosPage() {
  const { cart, clearCart, usePoints, availablePoints } = useCart();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  
  // Helper function to check if user is business
  const isBusinessUser = user?.roles?.includes('business') || false;

  // Helper function to check if cart has redeemable products
  const hasRedeemableProducts = cart.some(item => item.redeemable_with_points === true);

  // Helper function to calculate points discount
  const calculatePointsDiscount = () => {
    if (!usePoints || !hasRedeemableProducts) return 0;
    
    // Calculate total of redeemable products only
    const redeemableTotal = cart
      .filter(item => item.redeemable_with_points === true)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Points discount: 1 point = 1 euro, but can't exceed the redeemable total
    const maxDiscount = Math.min(availablePoints, redeemableTotal);
    return maxDiscount;
  };
  
  // Helper function to format IVA display
  const formatIvaDisplay = (iva: number | undefined): string => {
    if (iva === undefined) return '0';
    // Ensure it's displayed as percentage
    if (iva < 1 && iva > 0) {
      return (iva * 100).toFixed(0);
    }
    return iva.toFixed(0);
  };

  // Helper function to group cart items by IVA value (same as carrito page)
  const groupCartItemsByIva = (cartItems: typeof cart) => {
    if (!isBusinessUser) {
      return [{ ivaKey: 'no-iva', ivaValue: undefined, items: cartItems }];
    }

    const grouped = cartItems.reduce((groups, item) => {
      const ivaKey = item.iva !== undefined ? formatIvaDisplay(item.iva) : 'sin-iva';
      
      if (!groups[ivaKey]) {
        groups[ivaKey] = {
          ivaValue: item.iva,
          items: []
        };
      }
      
      groups[ivaKey].items.push(item);
      return groups;
    }, {} as Record<string, { ivaValue: number | undefined; items: typeof cart }>);

    return Object.entries(grouped)
      .map(([key, value]) => ({
        ivaKey: key,
        ivaValue: value.ivaValue,
        items: value.items
      }))
      .sort((a, b) => {
        if (a.ivaValue === undefined && b.ivaValue === undefined) return 0;
        if (a.ivaValue === undefined) return 1;
        if (b.ivaValue === undefined) return -1;
        return a.ivaValue - b.ivaValue;
      });
  };

  // Helper function to calculate IVA amounts for a group
  const calculateGroupIvaBreakdown = (items: typeof cart, ivaValue?: number) => {
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    if (!ivaValue || !isBusinessUser) {
      return {
        subtotal,
        ivaAmount: 0,
        total: subtotal
      };
    }

    const ivaAmount = subtotal * (ivaValue / 100);
    const total = subtotal + ivaAmount;

    return {
      subtotal,
      ivaAmount,
      total
    };
  };

  // Calculate grand totals
  const calculateGrandTotals = () => {
    const groupedItems = groupCartItemsByIva(cart);
    let grandSubtotal = 0;
    let grandIvaAmount = 0;
    let grandTotal = 0;

    groupedItems.forEach(group => {
      const breakdown = calculateGroupIvaBreakdown(group.items, group.ivaValue);
      grandSubtotal += breakdown.subtotal;
      grandIvaAmount += breakdown.ivaAmount;
      grandTotal += breakdown.total;
    });

    return {
      grandSubtotal,
      grandIvaAmount,
      grandTotal
    };
  };

  const grandTotals = calculateGrandTotals();
  const groupedCartItems = groupCartItemsByIva(cart);

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
  const pointsDiscount = calculatePointsDiscount(); // Descuento por puntos
  const discount = pointsDiscount; // Descuento total
  
  // Use IVA calculations for business users, regular calculations for others
  const finalTotal = isBusinessUser 
    ? grandTotals.grandTotal + shipping - discount
    : total + shipping - discount;

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
      alert(t('payment.select_payment_method'));
      return;
    }
    if (selectedPaymentMethod === 'card' && (!cardData.cardNumber || !cardData.expiry || !cardData.cvc || !cardData.cardholderName || !cardData.id)) {
      alert(t('payment.complete_card_fields'));
      return;
    }

    setIsLoading(true);
    try {
      // Crear la orden en el backend
      const orderData = {
        total_amount: finalTotal,
        currency: 'EUR',
        status: 'pending',
        used_points: pointsDiscount,
        order_lines: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        order_addresses: [
          {
            type: 'billing',
            full_name: cardData.cardholderName || t('payment.client'),
            address_line1: t('payment.billing_address'),
            city: t('payment.city'),
            postal_code: '00000',
            country: t('payment.spain'),
            phone: '',
          },
          {
            type: 'shipping',
            full_name: cardData.cardholderName || t('payment.client'),
            address_line1: t('payment.shipping_address'),
            city: t('payment.city'),
            postal_code: '00000',
            country: t('payment.spain'),
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
      alert(t('payment.payment_error'));
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
            <span className="text-gray-700 font-medium">{t('payment.processing_order')}</span>
          </div>
        </div>
      )}
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-16 py-8">
        <div className="">
          <h1 className="text-xl font-bold text-black mb-8">{t('payment.title')}</h1>

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
                    {t('payment.cash')}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Form */}
            {selectedPaymentMethod === 'card' && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold text-black mb-4">{t('payment.credit_debit_cards')}</h2>

                <div className="flex gap-6">
                  {/* Form Fields */}
                  <div className="flex-1 space-y-6">
                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        {t('payment.card_number')} *
                      </label>
                      <input
                        type="text"
                        placeholder={t('payment.card_number_placeholder')}
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
                          {t('payment.expiry')} *
                        </label>
                        <input
                          type="text"
                          placeholder={t('payment.expiry_placeholder')}
                          value={cardData.expiry}
                          onChange={(e) => handleCardDataChange('expiry', formatExpiry(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EA3D15]"
                          maxLength={5}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-black mb-2">
                          {t('payment.cvc')} *
                        </label>
                        <input
                          type="text"
                          placeholder={t('payment.cvc_placeholder')}
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
                        {t('payment.cardholder_name')} *
                      </label>
                      <input
                        type="text"
                        placeholder={t('payment.name_placeholder')}
                        value={cardData.cardholderName}
                        onChange={(e) => handleCardDataChange('cardholderName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#EA3D15]"
                      />
                    </div>

                    {/* ID */}
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">
                        {t('payment.id')} *
                      </label>
                      <input
                        type="text"
                        placeholder={t('payment.id_placeholder')}
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
                          <div className="text-xs font-semibold mb-1">{t('payment.full_name').toUpperCase()}</div>
                          <div className="text-sm">{cardData.cardholderName || t('payment.full_name').toUpperCase()}</div>
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
                {t('payment.order_summary')}
              </h3>

              <div className="space-y-4">
                {isBusinessUser ? (
                  // Business user: show IVA breakdown by groups
                  <>
                    {/* IVA Groups Breakdown */}
                    {groupedCartItems.map((group) => {
                      const breakdown = calculateGroupIvaBreakdown(group.items, group.ivaValue);
                      return (
                        <div key={group.ivaKey} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-bold text-black">
                              {group.ivaValue !== undefined 
                                ? `${t('payment.products_iva')} ${formatIvaDisplay(group.ivaValue)}% (${t('payment.subtotal_no_iva')})`
                                : t('payment.products_no_iva')
                              }
                            </span>
                            <span className="text-sm font-bold text-black">
                              €{breakdown.subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          
                          {/* Individual products in group */}
                          {group.items.map((item) => (
                            <div key={item.id} className="flex justify-between ml-4">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium text-gray-600">{item.name}</span>
                                <span className="text-xs font-medium text-gray-600">x{item.quantity}</span>
                              </div>
                              <span className="text-xs font-medium text-gray-600">
                                €{(item.price * item.quantity).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                          
                          {/* IVA amount for this group */}
                          {group.ivaValue && breakdown.ivaAmount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-black">
                                {t('payment.iva_percentage')} {formatIvaDisplay(group.ivaValue)}%
                              </span>
                              <span className="text-sm font-medium text-black">
                                €{breakdown.ivaAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Total breakdown */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-bold text-black">{t('payment.subtotal_no_iva')}</span>
                        <span className="text-sm font-bold text-black">
                          €{grandTotals.grandSubtotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-bold text-black">{t('payment.total_iva')}</span>
                        <span className="text-sm font-bold text-black">
                          €{grandTotals.grandIvaAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-bold text-black">{t('payment.shipping_costs')}</span>
                        <span className="text-sm font-bold text-black">
                          €{shipping.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Points Information for Business Users */}
                      {hasRedeemableProducts && usePoints && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">{t('payment.redeemable_products')}</span>
                            <span className="text-sm font-medium text-gray-600">
                              {cart.filter(item => item.redeemable_with_points === true).length} {t('payment.products')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">{t('payment.available_points')}</span>
                            <span className="text-sm font-medium text-gray-600">
                              {availablePoints} {t('order_details.points')}
                            </span>
                          </div>
                          {pointsDiscount > 0 && (
                            <>
                              <div className="flex justify-between text-green-600">
                                <span className="text-sm font-bold">{t('payment.points_applied_discount')}</span>
                                <span className="text-sm font-bold">
                                  -€{pointsDiscount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{t('payment.points_used')}</span>
                                <span>{pointsDiscount} {t('order_details.points')}</span>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  // Regular user: show normal breakdown
                  <>
                    {/* Products */}
                    <div className="flex justify-between">
                      <span className="text-sm font-bold text-black">{t('payment.product_prices')}</span>
                      <span className="text-sm font-bold text-black">
                        €{total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                          €{(item.price * item.quantity).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}

                    {/* Shipping */}
                    <div className="flex justify-between">
                      <span className="text-sm font-bold text-black">{t('payment.shipping_costs')}</span>
                      <span className="text-sm font-bold text-black">
                        €{shipping.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Points Information */}
                    {hasRedeemableProducts && usePoints && (
                      <div className="border-t border-gray-200 pt-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">{t('payment.redeemable_products')}</span>
                          <span className="text-sm font-medium text-gray-600">
                            {cart.filter(item => item.redeemable_with_points === true).length} {t('payment.products')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">{t('payment.available_points')}</span>
                          <span className="text-sm font-medium text-gray-600">
                            {availablePoints} {t('order_details.points')}
                          </span>
                        </div>
                        {pointsDiscount > 0 && (
                          <>
                            <div className="flex justify-between text-green-600">
                              <span className="text-sm font-bold">{t('payment.points_applied_discount')}</span>
                              <span className="text-sm font-bold">
                                -€{pointsDiscount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{t('payment.points_used')}</span>
                              <span>{pointsDiscount} {t('order_details.points')}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Discount */}
                    {pointsDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm font-bold text-black">{t('payment.points_discount')}</span>
                      <span className="text-sm font-bold text-black">
                        €{discount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Final Total */}
                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <span className="text-lg font-bold text-black">{t('payment.total_products')}</span>
                  <span className="text-lg font-bold text-black">
                    €{finalTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Continue Button */}
              <div className="mt-4">
                <Button
                  onPress={handlePaymentConfirmation}
                  type="primary"
                  text={t('payment.confirm_order')}
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