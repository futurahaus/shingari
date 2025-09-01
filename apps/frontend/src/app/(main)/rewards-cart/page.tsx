'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { useRewardsCart } from '@/contexts/RewardsCartContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePoints } from '@/hooks/usePoints';
import { Text } from '@/app/ui/components/Text';
import { useTranslation } from '@/contexts/I18nContext';
import { api } from '@/lib/api';
import Image from 'next/image';

const RewardsCartPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pointsData, refetch: refetchPoints } = usePoints();
  const {
    rewardsCart,
    getTotalPointsCost,
    getTotalItems,
    clearRewardsCart,
    updateRewardQuantity,
    removeFromRewardsCart,
    isCartLoaded,
  } = useRewardsCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPointsCost = getTotalPointsCost();
  const userPoints = pointsData?.balance?.total_points || 0;
  const canAfford = userPoints >= totalPointsCost;
  const remainingPoints = userPoints - totalPointsCost;

  // Debug the calculation issue
  console.log('🔍 Rewards Cart Debug:', {
    totalPointsCost,
    userPoints,
    canAfford,
    remainingPoints,
    pointsData: pointsData?.balance,
    cartItems: rewardsCart.map(r => ({
      id: r.id,
      name: r.name,
      points_cost: r.points_cost,
      quantity: r.quantity,
      total: r.points_cost * r.quantity
    }))
  });

      // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/products?rewards=true');
    }
  }, [user, router]);

  // Redirect if cart is empty (but only after cart data has loaded)
  useEffect(() => {
    if (isCartLoaded && rewardsCart.length === 0 && !redemptionSuccess) {
      router.push('/products?rewards=true');
    }
  }, [isCartLoaded, rewardsCart.length, redemptionSuccess, router]);

  const handleRedemption = async () => {
    if (!user || !canAfford || rewardsCart.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const redemptionData = {
        rewards: rewardsCart.map(reward => ({
          reward_id: reward.id,
          quantity: reward.quantity,
          points_cost: reward.points_cost
        })),
        total_points: totalPointsCost
      };

      console.log('🔍 Frontend Debug - Redemption Data:', {
        userCurrentPoints: userPoints,
        totalPointsCost,
        canAfford,
        redemptionData,
        cartDetails: rewardsCart.map(r => ({
          id: r.id,
          name: r.name,
          quantity: r.quantity,
          points_cost: r.points_cost,
          total: r.quantity * r.points_cost
        }))
      });

      // Debug authentication
      const accessToken = localStorage.getItem('accessToken');
      console.log('🔍 Auth Debug:', {
        hasToken: !!accessToken,
        tokenLength: accessToken?.length,
        tokenPrefix: accessToken?.substring(0, 20) + '...',
        userFromContext: !!user,
        userId: user?.id
      });

      await api.post('/rewards/redeem', redemptionData);

      // Success! Clear cart and show success state
      clearRewardsCart();
      setRedemptionSuccess(true);
      await refetchPoints(); // Refresh user points

    } catch (err: any) {
      console.error('Redemption error:', err);
      const errorMessage = err.response?.data?.message || 'Error al procesar el canje. Inténtalo de nuevo.';
      setError(errorMessage);

      // If it's a points error, refresh points data
      if (errorMessage.includes('Puntos insuficientes') || errorMessage.includes('insufficient')) {
        await refetchPoints();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || !isCartLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <Text as="p" size="md" color="secondary">
            Cargando...
          </Text>
        </div>
      </div>
    );
  }

  if (redemptionSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <Text as="h1" size="2xl" weight="bold" color="primary" className="mb-4">
            {t('products.redemption_successful')}
          </Text>
          <Text as="p" size="md" color="secondary" className="mb-8">
            {t('products.redemption_success_message')}
          </Text>
          <button
            onClick={() => router.push('/products?rewards=true')}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
          >
            {t('products.explore_more_rewards')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            {t('products.go_back')}
          </button>
          <Text as="h1" size="3xl" weight="bold" color="primary">
            {t('products.finalize_redemption')}
          </Text>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Text as="h2" size="xl" weight="semibold" color="primary" className="mb-6">
                {t('products.selected_rewards')} ({getTotalItems()} {getTotalItems() === 1 ? 'artículo' : 'artículos'})
              </Text>

              <div className="space-y-4">
                {rewardsCart.map((reward) => (
                  <div key={reward.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {reward.image_url ? (
                        (() => {
                          try {
                            const url = new URL(reward.image_url);
                            if (url.hostname === 'spozhuqlvmaieeqtaxvq.supabase.co') {
                              return (
                                <Image
                                  src={reward.image_url}
                                  alt={reward.name}
                                  width={80}
                                  height={80}
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
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <Text as="h3" size="lg" weight="medium" color="primary" className="mb-1">
                        {reward.name}
                      </Text>
                      {reward.description && (
                        <Text as="p" size="sm" color="secondary" className="mb-2 line-clamp-2">
                          {reward.description}
                        </Text>
                      )}
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">🏆</span>
                        <Text as="span" size="sm" weight="medium" className="text-red-600">
                          {reward.points_cost.toLocaleString()} pts c/u
                        </Text>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateRewardQuantity(reward.id, reward.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Text as="span" size="sm" weight="bold" color="primary">-</Text>
                        </button>
                        <Text as="span" size="md" weight="medium" color="primary" className="min-w-[2rem] text-center">
                          {reward.quantity}
                        </Text>
                        <button
                          onClick={() => updateRewardQuantity(reward.id, reward.quantity + 1)}
                          disabled={reward.stock !== null && reward.quantity >= reward.stock}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Text as="span" size="sm" weight="bold" color="primary">+</Text>
                        </button>
                      </div>

                      <div className="text-right">
                        <Text as="div" size="sm" color="secondary">
                          Subtotal:
                        </Text>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">🏆</span>
                          <Text as="span" size="md" weight="bold" className="text-red-600">
                            {(reward.points_cost * reward.quantity).toLocaleString()}
                          </Text>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromRewardsCart(reward.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <Text as="h3" size="xl" weight="semibold" color="primary" className="mb-6">
                {t('products.redemption_summary')}
              </Text>

              {/* User Points */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-6">
                <Text as="p" size="sm" color="secondary" className="mb-1">
                  {t('products.your_available_points')}:
                </Text>
                <div className="flex items-center space-x-1">
                  <span className="text-xl">🏆</span>
                  <Text as="span" size="xl" weight="bold" className="text-blue-600">
                    {userPoints.toLocaleString()}
                  </Text>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <Text as="span" size="md" color="secondary">
                    {t('products.total_items')}:
                  </Text>
                  <Text as="span" size="md" weight="medium" color="primary">
                    {getTotalItems()}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text as="span" size="md" color="secondary">
                    {t('products.total_points')}:
                  </Text>
                  <div className="flex items-center space-x-1">
                    <span>🏆</span>
                    <Text as="span" size="md" weight="bold" className="text-red-600">
                      {totalPointsCost.toLocaleString()}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Points Balance */}
              <div className={`p-4 rounded-lg border mb-6 ${canAfford ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex justify-between items-center">
                  <Text as="span" size="sm" color="secondary">
                    Puntos restantes:
                  </Text>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">{canAfford ? '✅' : '⚠️'}</span>
                    <Text as="span" size="sm" weight="medium" className={canAfford ? 'text-green-600' : 'text-amber-600'}>
                      {remainingPoints.toLocaleString()}
                    </Text>
                  </div>
                </div>
                {!canAfford && (
                  <Text as="p" size="xs" className="text-amber-700 mt-2">
                    No tienes suficientes puntos para completar este canje
                  </Text>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <Text as="p" size="sm" className="text-red-700">
                      {error}
                    </Text>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleRedemption}
                disabled={!canAfford || isProcessing || rewardsCart.length === 0}
                className={`w-full px-6 py-4 rounded-lg text-white font-semibold transition-all duration-200 cursor-pointer ${
                  canAfford && !isProcessing
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </div>
                ) : !canAfford ? (
                  '💸 Puntos Insuficientes'
                ) : (
                  `🎁 Canjear ${totalPointsCost.toLocaleString()} puntos`
                )}
              </button>

              <Text as="p" size="xs" color="secondary" className="text-center mt-4">
                Al completar el canje, los puntos serán deducidos de tu cuenta inmediatamente.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsCartPage;




