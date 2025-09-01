"use client";

import React from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRewardsCart } from '@/contexts/RewardsCartContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePoints } from '@/hooks/usePoints';
import { Text } from '@/app/ui/components/Text';
import { useTranslation } from '@/contexts/I18nContext';
import Image from 'next/image';

const RewardsCart = () => {
  const router = useRouter();
  const {
    rewardsCart,
    isRewardsCartOpen,
    closeRewardsCart,
    removeFromRewardsCart,
    updateRewardQuantity,
    clearRewardsCart,
    getTotalPointsCost,
    getTotalItems,
  } = useRewardsCart();

  const { user } = useAuth();
  const { pointsData } = usePoints();
  const { t } = useTranslation();

  if (!isRewardsCartOpen) return null;

  const totalPointsCost = getTotalPointsCost();
  const userPoints = pointsData?.balance?.total_points || 0;
  const canAfford = userPoints >= totalPointsCost;
  const remainingPoints = userPoints - totalPointsCost;

  const handleExchangeAll = () => {
    // Navigate to rewards cart checkout page
    closeRewardsCart();
    router.push('/rewards-cart');
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-lg overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeRewardsCart}
      />

      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-red-600" />
            <Text as="h2" size="lg" weight="semibold" color="primary">
              🎁 {t('products.rewards_cart')}
            </Text>
          </div>
          <button
            onClick={closeRewardsCart}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User Points Info */}
        {user && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <Text as="p" size="sm" color="secondary">
                  {t('products.your_available_points')}
                </Text>
                <div className="flex items-center space-x-1">
                  <span className="text-lg">🏆</span>
                  <Text as="span" size="lg" weight="bold" color="primary" className="text-red-600">
                    {userPoints.toLocaleString()}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {rewardsCart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🛒</div>
              <Text as="h3" size="lg" weight="semibold" color="primary" className="mb-2">
                {t('products.cart_empty')}
              </Text>
              <Text as="p" size="sm" color="secondary">
                {t('products.cart_empty_description')}
              </Text>
            </div>
          ) : (
            <div className="space-y-4">
              {rewardsCart.map((reward) => (
                <div key={reward.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    {/* Image */}
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {reward.image_url ? (
                        (() => {
                          try {
                            const url = new URL(reward.image_url);
                            if (url.hostname === 'spozhuqlvmaieeqtaxvq.supabase.co') {
                              return (
                                <Image
                                  src={reward.image_url}
                                  alt={reward.name}
                                  width={64}
                                  height={64}
                                  className="object-contain"
                                />
                              );
                            } else {
                              return (
                                <img
                                  src={reward.image_url}
                                  alt={reward.name}
                                  className="w-full h-full object-contain"
                                />
                              );
                            }
                          } catch {
                            return (
                              <img
                                src={reward.image_url}
                                alt={reward.name}
                                className="w-full h-full object-contain"
                              />
                            );
                          }
                        })()
                      ) : (
                        <div className="text-gray-300">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Text as="h4" size="sm" weight="medium" color="primary" className="mb-1 line-clamp-2">
                        {reward.name}
                      </Text>

                      <div className="flex items-center space-x-1 mb-2">
                        <span className="text-sm">🏆</span>
                        <Text as="span" size="sm" weight="medium" className="text-red-600">
                          {reward.points_cost.toLocaleString()} pts
                        </Text>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateRewardQuantity(reward.id, reward.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <Text as="span" size="sm" weight="medium" color="primary">
                            {reward.quantity}
                          </Text>
                          <button
                            onClick={() => updateRewardQuantity(reward.id, reward.quantity + 1)}
                            disabled={reward.stock !== null && reward.quantity >= reward.stock}
                            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromRewardsCart(reward.id)}
                          className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <Text as="span" size="xs" color="secondary">
                            Subtotal:
                          </Text>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs">🏆</span>
                            <Text as="span" size="xs" weight="medium" className="text-red-600">
                              {(reward.points_cost * reward.quantity).toLocaleString()} pts
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with totals and actions */}
        {rewardsCart.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Total */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <Text as="span" size="sm" color="secondary">
                  {t('products.total_items')}:
                </Text>
                <Text as="span" size="sm" weight="medium" color="primary">
                  {getTotalItems()}
                </Text>
              </div>
              <div className="flex items-center justify-between">
                <Text as="span" size="md" weight="medium" color="primary">
                  {t('products.total_points')}:
                </Text>
                <div className="flex items-center space-x-1">
                  <span className="text-lg">🏆</span>
                  <Text as="span" size="lg" weight="bold" className="text-red-600">
                    {totalPointsCost.toLocaleString()}
                  </Text>
                </div>
              </div>
            </div>

            {/* Points Balance Check */}
            {user && (
              <div className={`p-3 rounded-lg border ${canAfford ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center justify-between">
                  <Text as="span" size="sm" color="secondary">
                    {t('products.remaining_points')}:
                  </Text>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">{canAfford ? '✅' : '⚠️'}</span>
                    <Text as="span" size="sm" weight="medium" className={canAfford ? 'text-green-600' : 'text-amber-600'}>
                      {remainingPoints.toLocaleString()}
                    </Text>
                  </div>
                </div>
                {!canAfford && (
                  <Text as="p" size="xs" className="text-amber-700 mt-1">
                    {t('products.insufficient_points_message')}
                  </Text>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {user ? (
                <button
                  onClick={handleExchangeAll}
                  disabled={!canAfford}
                  className={`w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    canAfford
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🎁 {t('products.exchange_all')} ({totalPointsCost.toLocaleString()} pts)
                </button>
              ) : (
                <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-center">
                  <Text as="span" size="sm" color="secondary" className="text-gray-600">
                    {t('products.login_to_exchange')}
                  </Text>
                </div>
              )}

              <button
                onClick={clearRewardsCart}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {t('products.clear_cart')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsCart;
