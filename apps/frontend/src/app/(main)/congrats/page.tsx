'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useTranslation } from '@/contexts/I18nContext';
import { formatCurrency } from '@/lib/currency';

interface UserProfile {
  nombre: string;
  apellidos: string;
  [key: string]: unknown;
}

interface OrderLine {
  id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string; // Decimal se serializa como string
  total_price: string; // Decimal se serializa como string
}

interface OrderAddress {
  id: string;
  type: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
}

interface OrderPayment {
  id: string;
  payment_method: string;
  status: string;
  paid_at?: string;
  amount: string; // Decimal se serializa como string
  transaction_id?: string;
  metadata?: Record<string, unknown>;
}

interface Order {
  id: string;
  user_id?: string;
  status: string;
  total_amount: string; // Decimal se serializa como string
  currency: string;
  created_at: string;
  updated_at: string;
  order_lines: OrderLine[];
  order_addresses: OrderAddress[];
  order_payments: OrderPayment[];
}

const CongratsSkeleton = () => (
  <div className="min-h-screen bg-white">
    {/* Main Content */}
    <main className="max-w-7xl mx-auto px-4 md:px-16 py-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="w-48 h-6 bg-gray-200 rounded"></div>
      </div>

      {/* Congratulations Card Skeleton */}
      <div className="flex justify-center">
        <div className="bg-[#FBFBFB] border-2 border-[#E3E3E3] rounded-[32px] p-16 max-w-2xl w-full">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Check Icon Skeleton */}
            <div className="w-15 h-15 bg-white rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>

            {/* Main Message Skeleton */}
            <div className="w-80 h-8 bg-gray-200 rounded"></div>

            {/* Order Details Skeleton */}
            <div className="space-y-2">
              <div className="w-32 h-4 bg-gray-200 rounded"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-28 h-4 bg-gray-200 rounded"></div>
            </div>

            {/* Subtitle Skeleton */}
            <div className="w-96 h-4 bg-gray-200 rounded"></div>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md">
              <div className="flex-1 h-12 bg-gray-200 rounded-[10px]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Home Button Skeleton */}
      <div className="flex justify-center mt-8">
        <div className="w-32 h-12 bg-gray-200 rounded-[10px]"></div>
      </div>
    </main>
  </div>
);

const CongratsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { t } = useTranslation();

  const [order, setOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) {
        setError(t('congrats.no_order_id'));
        setLoading(false);
        return;
      }

      try {
        // Obtener la orden y el usuario en paralelo
        const [orderData, userData] = await Promise.all([
          api.get<Order>(`/orders/${orderId}`),
          api.get<UserProfile>('/auth/me')
        ]);
        
        setOrder(orderData);
        setUser(userData);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
        setError(t('congrats.order_fetch_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, t]);

  if (loading) {
    return <CongratsSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('congrats.error')}</h2>
          <p className="text-gray-600 mb-4">{error || t('congrats.order_not_found')}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#EA3D15] text-white py-2 px-4 rounded-[10px] font-medium text-sm hover:bg-[#d43e0e] transition-colors"
          >
            {t('congrats.back_to_home')}
          </button>
        </div>
      </div>
    );
  }

  // Obtener el nombre del usuario logueado
  const customerName = user?.nombre ? 
    `${user.nombre}${user.apellidos ? ` ${user.apellidos}` : ''}` : 
    t('congrats.client');

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-16 py-8">
        {/* Breadcrumb */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-base font-bold text-[#121417]">
            {t('congrats.title')}
          </h1>
        </div>

        {/* Congratulations Card */}
        <div className="flex justify-center">
          <div className="bg-[#FBFBFB] border-2 border-[#E3E3E3] rounded-[32px] p-8 max-w-2xl w-full">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Check Icon */}
              <div className="w-15 h-15 bg-white rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-[#009951]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>

              {/* Main Message */}
              <h2 className="text-2xl font-semibold text-black leading-tight">
                {t('congrats.thank_you', { name: customerName })}
              </h2>

              {/* Order Details */}
              <div className="text-sm text-gray-600 space-y-2">
                <p>{t('congrats.order')} #{order.id.slice(0, 8).toUpperCase()}</p>
                <p>{t('congrats.total')}: {formatCurrency(Number(order.total_amount))}</p>
                <p>{t('congrats.status')}: {order.status}</p>
              </div>

              {/* Subtitle */}
              <p className="text-sm font-medium text-black leading-relaxed max-w-md">
                {t('congrats.confirmation_email')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md">
                <button
                  onClick={() => {
                    router.push('/dashboard/compras');
                  }}
                  className="flex-1 bg-[#EA3D15] text-white py-3 px-4 rounded-[10px] font-medium text-sm hover:bg-[#d43e0e] transition-colors cursor-pointer"
                >
                  {t('congrats.go_to_orders')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="bg-[#EA3D15] text-white py-3 px-4 rounded-[10px] font-medium text-sm hover:bg-[#d43e0e] transition-colors cursor-pointer"
          >
            {t('congrats.back_to_home')}
          </button>
        </div>
      </main>
    </div>
  );
};

export default function CongratsPage() {
  return (
    <Suspense fallback={<CongratsSkeleton />}>
      <CongratsContent />
    </Suspense>
  );
}