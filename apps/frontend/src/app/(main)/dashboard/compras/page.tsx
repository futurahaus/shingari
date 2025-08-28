'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { useTranslation, useI18n } from '@/contexts/I18nContext';
import { useOrdersQuery } from '@/hooks/useOrdersQuery';

const getStatusConfig = (status: string, t: (key: string) => string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return {
        label: t('order_status.pending'),
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200'
      };
    case 'completed':
    case 'paid':
      return {
        label: t('order_status.completed'),
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200'
      };
    case 'cancelled':
      return {
        label: t('order_status.cancelled'),
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200'
      };
    case 'processing':
      return {
        label: t('order_status.processing'),
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200'
      };
    default:
      return {
        label: status,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-200'
      };
  }
};

const formatDate = (dateString: string, locale: string = 'es-ES') => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  return date.toLocaleDateString(locale, options);
};

const formatOrderId = (id: string) => {
  return `#${id.slice(0, 8).toUpperCase()}`;
};

const OrderCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Order Info */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
          {/* Status Tag Skeleton */}
          <div className="w-24 h-6 bg-gray-200 rounded-full"></div>

          {/* Order ID Skeleton */}
          <div className="w-32 h-5 bg-gray-200 rounded"></div>
        </div>

        {/* Order Details Skeleton */}
        <div className="space-y-1">
          <div className="w-48 h-4 bg-gray-200 rounded"></div>
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Action Button Skeleton */}
      <div className="sm:ml-4">
        <div className="w-full sm:w-24 h-8 bg-gray-200 rounded border"></div>
      </div>
    </div>
  </div>
);

export default function ComprasPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useI18n();
  const { orders, isLoading, error, refetch } = useOrdersQuery();

  if (isLoading) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-16 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">{t('dashboard.my_orders')}</h2>
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <OrderCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-16 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar />
          <div className="flex-1 bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <div className="text-center text-red-600">
              <p>{error?.message || t('dashboard.loading_orders')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-16 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        <Sidebar />
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">{t('dashboard.my_orders')}</h2>

          {orders.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 text-center">
              <p className="text-gray-600">{t('dashboard.no_orders')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status, t);

                return (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                          {/* Status Tag */}
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border w-fit`}>
                            {statusConfig.label}
                          </div>

                          {/* Order ID */}
                          <span className="text-sm font-medium text-gray-900">
                            {t('dashboard.order')} {formatOrderId(order.id)}
                          </span>
                        </div>

                        {/* Order Details */}
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm text-gray-600">
                            {t('dashboard.purchase_date')}: {formatDate(order.created_at, locale === 'zh' ? 'zh-CN' : 'es-ES')}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {t('dashboard.total')}: €{Number(order.total_amount).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="sm:ml-4">
                        <button
                          onClick={() => {
                            router.push(`/dashboard/compras/${order.id}`);
                          }}
                          className="w-full sm:w-auto px-4 py-2 border border-gray-900 text-gray-900 rounded text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          {t('dashboard.view_detail')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}