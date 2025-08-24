"use client";
import React from "react";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import { QuantityControls } from '@/components/QuantityControls';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { UserProfile } from "../complete-profile/page";
import { api } from "@/lib/api";
import { Button } from "@/app/ui/components/Button";

const CarritoPage = () => {
  const { cart, removeFromCart, removeAllFromCart, usePoints, setUsePoints, availablePoints, setAvailablePoints } = useCart();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await api.get<UserProfile>('/auth/me');
        setAvailablePoints(data.points || 0);
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (err instanceof Error && err.message === 'Authentication required') {
          window.location.hash = '#login?from=/complete-profile';
        }
      } 
    };

    fetchUserData();
  }, [setAvailablePoints]);

  const { t } = useTranslation();
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  // Helper function to group cart items by IVA value
  const groupCartItemsByIva = (cartItems: typeof cart) => {
    if (!isBusinessUser) {
      // For non-business users, don't group by IVA
      return [{ ivaKey: 'no-iva', ivaValue: undefined, items: cartItems }];
    }

    const grouped = cartItems.reduce((groups, item) => {
      // Use a normalized IVA key for grouping
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

    // Convert to array and sort by IVA value
    return Object.entries(grouped)
      .map(([key, value]) => ({
        ivaKey: key,
        ivaValue: value.ivaValue,
        items: value.items
      }))
      .sort((a, b) => {
        // Sort groups: items with IVA first (by IVA value), then items without IVA
        if (a.ivaValue === undefined && b.ivaValue === undefined) return 0;
        if (a.ivaValue === undefined) return 1;
        if (b.ivaValue === undefined) return -1;
        return a.ivaValue - b.ivaValue;
      });
  };

  const groupedCartItems = groupCartItemsByIva(cart);

  // Helper function to calculate group totals
  const calculateGroupTotal = (items: typeof cart) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Helper function to calculate IVA amounts for a group
  const calculateGroupIvaBreakdown = (items: typeof cart, ivaValue?: number) => {
    const subtotal = calculateGroupTotal(items);

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
    let grandSubtotal = 0;
    let grandIvaAmount = 0;
    let grandTotal = 0;

    groupedCartItems.forEach(group => {
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

  useEffect(() => {
    if (!isLoading && !user) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [user, isLoading]);

  // Calculate totals
  const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const pointsDiscount = calculatePointsDiscount();
  const discount = pointsDiscount; // Points discount
  const discountedTotal = total - discount;
  const shipping = 0; // Placeholder shipping `cost`

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-7xl px-6 py-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t('cart.my_cart')}</h1>
        <button className="text-red-500 text-sm underline self-end" onClick={removeAllFromCart} disabled={!user}>
          {t('cart.empty_cart')}
        </button>
      </header>
      <main className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 px-6">
        {/* Product List */}
        <section className="flex-1 bg-white rounded-lg shadow p-4">
          {/* Desktop Header */}
          <div className="hidden md:flex font-bold text-lg mb-4">
            <span className="flex-1">{t('cart.product')}</span>
            <span className="w-32 text-center">{t('cart.quantity')}</span>
            <span className="w-32 text-center">{t('cart.price')}</span>
            <span className="w-32 text-right">{t('cart.total')}</span>
            <span className="w-20"></span>
          </div>

          {cart.length === 0 ? (
            <div className="py-8 text-center text-gray-500">{t('cart.empty')}</div>
          ) : (
            <div className="space-y-6">
                            {groupedCartItems.map((group) => (
                <div key={group.ivaKey} className="space-y-4">
                  {/* IVA Group Header (only for business users) */}
                  {/* Products in this IVA group */}
                  {group.items.map((item) => (
                <div key={item.id} className={`border rounded-lg p-4 ${isBusinessUser ? 'border-gray-100 bg-white shadow-sm' : 'border-gray-200'}`}>
                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center">
                    <div className="flex-1 flex items-center">
                      <div className="bg-gray-200 flex items-center justify-center rounded mr-4">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} width={64} height={64} className="object-cover rounded" />
                        ) : (
                          <div className="w-14 h-14 bg-gray-300 rounded" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-base">{item.name}</div>
                        <div className="text-xs text-gray-500">{t('cart.units')}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <QuantityControls
                        product={item}
                        productId={item.id}
                        productName={item.name}
                        productPrice={item.price}
                        productImage={item.image || ''}
                        unitsPerBox={item.units_per_box}
                        variant="inline"
                        iva={item.iva}
                      />
                    </div>
                    <div className="w-32 text-center font-semibold">
                      € {item.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="w-32 text-right font-semibold">
                      € {(item.price * item.quantity).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="w-20 flex justify-end">
                      <button
                        className="text-xs text-red-500 hover:underline"
                        onClick={() => removeFromCart(item.id)}
                        disabled={!user}
                      >{t('cart.remove')}</button>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center flex-1">
                        <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded mr-3 overflow-hidden">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} width={48} height={48} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-300 rounded" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500">{t('cart.units')}</div>
                        </div>
                      </div>
                      <button
                        className="text-xs text-red-500 hover:underline"
                        onClick={() => removeFromCart(item.id)}
                        disabled={!user}
                      >{t('cart.remove')}</button>
                    </div>

                    <div className="flex flex-col items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QuantityControls
                          product={item}
                          productId={item.id}
                          productName={item.name}
                          productPrice={item.price}
                          productImage={item.image || ''}
                          unitsPerBox={item.units_per_box}
                          variant="inline"
                          iva={item.iva}
                        />
                      </div>
                      <div className="flex flex-col items-center justify-between">
                        <div className="text-sm text-gray-500">{t('cart.unit_price')}</div>
                        <div className="font-semibold text-sm">
                          € {item.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{t('cart.total')}</div>
                        <div className="font-bold text-base">
                          € {(item.price * item.quantity).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                  ))}

                  {/* IVA Group Totals (only for business users) */}
                  {isBusinessUser && (() => {
                    const breakdown = calculateGroupIvaBreakdown(group.items, group.ivaValue);
                    return (
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-green-800">
                              {t('cart.group_totals')} {group.ivaValue !== undefined
                                ? `${t('cart.iva_percentage')} ${formatIvaDisplay(group.ivaValue)}%`
                                : t('cart.no_iva')
                              }
                            </h4>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="flex justify-between items-center gap-4">
                              <span className="text-xs text-green-600">{t('cart.subtotal')}:</span>
                              <span className="font-semibold text-sm text-green-800">
                                €{breakdown.subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            {group.ivaValue && breakdown.ivaAmount > 0 && (
                              <div className="flex justify-between items-center gap-4">
                                <span className="text-xs text-green-600">{t('cart.iva_percentage')} ({formatIvaDisplay(group.ivaValue)}%):</span>
                                <span className="font-semibold text-sm text-green-800">
                                  €{breakdown.ivaAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center gap-4 pt-1 border-t border-green-200">
                              <span className="text-sm font-semibold text-green-700">{t('cart.total')}:</span>
                              <span className="font-bold text-lg text-green-800">
                                €{breakdown.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Summary */}
        <aside className="w-full lg:w-96 bg-white rounded-lg shadow p-6 flex flex-col gap-4">
          <h2 className="font-bold text-lg mb-2">{t('cart.purchase_summary')}</h2>

          {/* Points Checkbox - Only show if user has redeemable products */}
          {hasRedeemableProducts && availablePoints > 0 && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    disabled={!user}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {t('cart.use_accumulated_points')}
                  </span>
                </label>
                <span className="text-sm text-gray-600">
                  {availablePoints} {t('cart.points_available')}
                </span>
              </div>
              {usePoints && (
                <div className="text-xs text-gray-500">
                  {t('cart.points_info')}
                </div>
              )}
            </div>
          )}

          {isBusinessUser ? (
            // Business user: show IVA breakdown
            <>
              <div className="flex justify-between text-sm">
                <span>{t('cart.subtotal_no_iva')}</span>
                <span>€{grandTotals.grandSubtotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('cart.total_iva')}</span>
                <span>€{grandTotals.grandIvaAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('cart.shipping_costs')}</span>
                <span>€{shipping.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-4 mt-4">
                <span>{t('cart.total_products')}</span>
                <span>€{(grandTotals.grandTotal + shipping).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </>
          ) : (
            // Regular user: show normal breakdown
            <>
              <div className="flex justify-between text-sm">
                <span>{t('cart.product_prices')}</span>
                <span>€{total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('cart.points_discount')}</span>
                  <span>- €{pointsDiscount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>{t('cart.discounts')}</span>
                <span>- €{discount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('cart.shipping_costs')}</span>
                <span>€{shipping.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-4 mt-4">
                <span>{t('cart.total_products')}</span>
                <span>€{(discountedTotal + shipping).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </>
          )}
          <div className="flex flex-col gap-2 mt-6">
            <Button
              testID="continue-purchase-button"
              type="primary"  
              size="lg"
              text={t('cart.continue_purchase')}
              onPress={() => {
                if (!user) {
                  setShowLoginModal(true);
                  return;
                }
                router.push('/pagos');
              }}
              disabled={!user || cart.length === 0}
            />
            <Button
              testID="view-more-products-button"
              type="secondary"
              size="lg"
              text={t('cart.view_more_products')}
              onPress={() => {
                router.push('/products');
              }}
            />
          </div>
        </aside>
      </main>
      {showLoginModal && (
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} redirectPath={"/carrito"} />
      )}
    </div>
  );
};

export default CarritoPage;