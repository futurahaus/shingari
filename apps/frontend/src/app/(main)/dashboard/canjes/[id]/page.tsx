'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { useTranslation, useI18n } from '@/contexts/I18nContext';
import { useRedemptionDetail } from '@/hooks/useRedemptionsQuery';

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
    case 'processed':
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

const formatDate = (dateString: string | Date, locale: string = 'es-ES') => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  return date.toLocaleDateString(locale, options);
};

const formatRedemptionId = (id: number) => {
  return `#${id.toString().padStart(6, '0')}`;
};

const RedemptionDetailSkeleton = () => (
  <div className="flex-1 space-y-4 animate-pulse">
    {/* Header Card Skeleton */}
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
            <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
            <div className="w-32 h-5 bg-gray-200 rounded"></div>
          </div>
          <div className="w-48 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="sm:ml-4">
          <div className="w-full sm:w-28 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    {/* Summary Card Skeleton */}
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="mb-4">
        <div className="w-32 h-5 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="flex justify-between">
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between">
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Items Card Skeleton */}
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="mb-4">
        <div className="w-28 h-5 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="w-40 h-4 bg-gray-200 rounded mb-1"></div>
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="text-right">
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function RedemptionDetailPage() {
  const params = useParams();
  const redemptionId = params.id as string;
  const { t } = useTranslation();
  const { locale } = useI18n();

  const { data: redemption, isLoading, error } = useRedemptionDetail(redemptionId);

  if (isLoading) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-16 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar />
          <RedemptionDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !redemption) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-16 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar />
          <div className="flex-1">
            <div className="text-center text-red-600">
              <p>{error?.message || 'No se pudo cargar el canje'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(redemption.status, t);

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-16 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        <Sidebar />
        <div className="flex-1 space-y-4">
          {/* Header Card - Redemption Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border w-fit`}>
                    {statusConfig.label}
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {t('dashboard.redemption')} {formatRedemptionId(redemption.id)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t('dashboard.redemption_date')}: {formatDate(redemption.created_at, locale === 'zh' ? 'zh-CN' : 'es-ES')}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-900">{t('dashboard.redemption_summary')}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">{t('dashboard.total_rewards')}</span>
                <span className="text-sm text-gray-900">{redemption.lines.length} {redemption.lines.length === 1 ? 'item' : 'items'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">Estado</span>
                <span className="text-sm text-gray-900">{statusConfig.label}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-gray-900">{t('dashboard.points_used')}</span>
                  <span className="text-sm font-bold text-gray-900">{redemption.total_points.toLocaleString()} puntos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Redeemed Items Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">{t('dashboard.redeemed_rewards')}</h3>
              {/* Desktop Headers */}
              <div className="hidden sm:flex justify-between items-center text-xs font-medium text-gray-500 border-b border-gray-100 pb-2">
                <span className="flex-1">{t('dashboard.reward')}</span>
                <div className="flex gap-4">
                  <span className="w-20 text-center">Cantidad</span>
                  <span className="w-24 text-center">{t('dashboard.points_per_unit')}</span>
                  <span className="w-20 text-center">{t('dashboard.total_points')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {redemption.lines.map((line) => (
                <div key={line.id} className="border border-gray-100 rounded-lg p-3">
                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-900 mb-1">{line.reward_name}</p>
                      <p className="text-xs text-gray-500">Cantidad: {line.quantity}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500 text-xs mb-1">{t('dashboard.points_per_unit')}</p>
                        <p className="font-medium text-gray-900">{line.points_cost.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs mb-1">{t('dashboard.total_points')}</p>
                        <p className="font-medium text-gray-900">{line.total_points.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{line.reward_name}</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-sm text-gray-900 w-20 text-center">{line.quantity}</span>
                      <span className="text-sm text-gray-900 w-24 text-center">{line.points_cost.toLocaleString()}</span>
                      <span className="text-sm text-gray-900 w-20 text-center">{line.total_points.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">{t('dashboard.redemption_info')}</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    {redemption.status.toLowerCase() === 'pending' && 
                      t('dashboard.redemption_pending_info')
                    }
                    {redemption.status.toLowerCase() === 'completed' && 
                      t('dashboard.redemption_completed_info')
                    }
                    {redemption.status.toLowerCase() === 'processing' && 
                      t('dashboard.redemption_processing_info')
                    }
                    {redemption.status.toLowerCase() === 'cancelled' && 
                      t('dashboard.redemption_cancelled_info')
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
