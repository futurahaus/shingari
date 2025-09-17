'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/layout/Sidebar';
import { useTranslation, useI18n } from '@/contexts/I18nContext';
import { useOrderDetail } from '@/hooks/useOrdersQuery';
import { formatCurrency as formatCurrencyUtil } from '@/lib/currency';

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
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200'
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

const formatCurrency = (amount: string) => {
  return formatCurrencyUtil(Number(amount));
};

const OrderDetailSkeleton = () => (
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

    {/* Delivery Details Card Skeleton */}
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="mb-4">
        <div className="w-32 h-5 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-3">
        <div className="flex gap-1">
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="flex gap-1">
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
          <div className="w-48 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="flex gap-1">
          <div className="w-28 h-4 bg-gray-200 rounded"></div>
          <div className="w-56 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="flex gap-1">
            <div className="w-36 h-4 bg-gray-200 rounded"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="w-24 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    {/* Payment and Summary Cards Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Payment Details Card Skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="mb-4">
          <div className="w-28 h-5 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
          <div className="w-40 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-4">
          <div className="w-full h-8 bg-gray-200 rounded border"></div>
        </div>
      </div>

      {/* Summary Card Skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="mb-4">
          <div className="w-20 h-5 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="flex justify-between">
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="flex justify-between">
            <div className="w-12 h-4 bg-gray-200 rounded"></div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Products Card Skeleton */}
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="w-20 h-5 bg-gray-200 rounded"></div>
          <div className="flex gap-4">
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i}>
            {i > 0 && <hr className="border-gray-200 my-4" />}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 border border-gray-300 rounded overflow-hidden">
                  <div className="w-full h-full bg-gray-300"></div>
                </div>
                <div className="flex-1">
                  <div className="w-48 h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-4">
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Invoice Section Skeleton */}
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="mb-4">
        <div className="w-16 h-5 bg-gray-200 rounded"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
        <div className="w-48 h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { t } = useTranslation();
  const { locale } = useI18n();

  const { data: order, isLoading, error, refetch } = useOrderDetail(orderId);

  if (isLoading) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-16 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar />
          <OrderDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-16 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar />
          <div className="flex-1">
            <div className="text-center text-red-600">
              <p>{error?.message || t('dashboard.order_not_found')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status, t);
  const shippingAddress = order.order_addresses.find(addr => addr.type === 'shipping');
  const payment = order.order_payments[0];

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-16 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        <Sidebar />
        <div className="flex-1 space-y-4">
          {/* Header Card - Order Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border w-fit`}>
                    {statusConfig.label}
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {t('dashboard.order')} {formatOrderId(order.id)}
                  </span>
                  {order.order_number && (
                    <span className="text-sm font-bold text-gray-700">
                      #{order.order_number}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t('dashboard.purchase_date')}: {formatDate(order.created_at, locale === 'zh' ? 'zh-CN' : 'es-ES')}
                </p>
              </div>
              <div className="sm:ml-4 flex gap-2">
                <button
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  onClick={() => {
                    // Lógica para repetir compra
                    console.log('Repetir compra:', order.id);
                  }}
                  className="px-4 py-2 bg-[#EA3D15] text-white rounded text-sm font-medium hover:bg-[#d43e0e] transition-colors cursor-pointer"
                >
                  {t('dashboard.repeat_order')}
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Details Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-900">{t('order_details.delivery_details')}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:gap-1">
                <span className="text-xs sm:text-sm text-gray-600">{t('order_details.delivery_type')}</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">{t('order_details.home_delivery')}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-1">
                <span className="text-xs sm:text-sm text-gray-600">{t('order_details.delivery_to')}</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  {shippingAddress ? `${shippingAddress.address_line1}, ${shippingAddress.city}, ${shippingAddress.country}` : t('order_details.not_specified')}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-1">
                <span className="text-xs sm:text-sm text-gray-600">{t('order_details.delivery_date')}</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  {formatDate(order.created_at, locale === 'zh' ? 'zh-CN' : 'es-ES')} {t('order_details.time_range')}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:gap-1">
                  <span className="text-xs sm:text-sm text-gray-600">{t('order_details.tracking_code')}</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {order.id.slice(0, 8).toUpperCase()}-{order.id.slice(8, 12).toUpperCase()}
                  </span>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 bg-[#EA3D15] text-white rounded text-sm font-medium hover:bg-[#d43e0e] transition-colors cursor-pointer">
                  {t('dashboard.track_order')}
                </button>
              </div>
            </div>
          </div>

          {/* Payment and Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Details Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-900">{t('order_details.payment_details')}</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {payment?.payment_method === 'card' ? t('order_details.credit_card') : payment?.payment_method}
                </p>
                <p className="text-sm text-gray-900">
                  {formatCurrency(order.total_amount)} - {t('order_details.payment_single')} {formatCurrency(order.total_amount)}
                </p>
              </div>
              <div className="mt-4">
                <button className="w-full px-4 py-2 border border-gray-700 text-gray-700 rounded text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer">
                  {t('dashboard.view_invoice')}
                </button>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-900">{t('order_details.summary')}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">{t('order_details.subtotal')}</span>
                  <span className="text-sm text-gray-900">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">{t('order_details.discounts')}</span>
                  <span className="text-sm text-gray-900">-€0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">{t('order_details.shipping')}</span>
                  <span className="text-sm text-gray-900">€0,00</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-gray-900">{t('dashboard.total')}</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">{t('order_details.products')}</h3>
              {/* Desktop Headers */}
              <div className="hidden sm:flex justify-between items-center text-xs font-medium text-gray-500 border-b border-gray-100 pb-2">
                <span className="flex-1">{t('order_details.product')}</span>
                <div className="flex gap-4">
                  <span className="w-20 text-center">{t('order_details.price')}</span>
                  <span className="w-20 text-center">{t('order_details.subtotal')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {order.order_lines.map((line, index) => (
                <div key={line.id} className="border border-gray-100 rounded-lg p-3">
                  {index > 0 && <hr className="border-gray-200 my-4" />}

                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 border border-gray-300 rounded flex items-center justify-center overflow-hidden">
                        {line.product_image ? (
                          <Image
                            src={line.product_image}
                            alt={line.product_name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">{line.product_name}</p>
                        <p className="text-xs text-gray-500">{t('order_details.quantity')}: {line.quantity}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500 text-xs mb-1">{t('order_details.unit_price')}</p>
                        <p className="font-medium text-gray-900">{formatCurrency(line.unit_price)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs mb-1">{t('order_details.subtotal')}</p>
                        <p className="font-medium text-gray-900">{formatCurrency(line.total_price)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gray-200 border border-gray-300 rounded flex items-center justify-center overflow-hidden">
                        {line.product_image ? (
                          <Image
                            src={line.product_image}
                            alt={line.product_name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{line.product_name}</p>
                        <p className="text-xs text-gray-500">{t('order_details.quantity')}: {line.quantity}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-sm text-gray-900 w-20 text-center">{formatCurrency(line.unit_price)}</span>
                      <span className="text-sm text-gray-900 w-20 text-center">{formatCurrency(line.total_price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-900">{t('order_details.invoice')}</h3>
            </div>
            {order.invoice_file_url ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">{t('order_details.invoice_available')}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {t('order_details.invoice')} {formatOrderId(order.id)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(order.invoice_file_url, '_blank')}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title={t('order_details.view_invoice')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = order.invoice_file_url!;
                      link.download = `invoice-${formatOrderId(order.id)}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="p-2 bg-[#EA3D15] text-white hover:bg-[#d43e0e] rounded-lg transition-colors cursor-pointer"
                    title={t('order_details.download_invoice')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{t('order_details.no_invoice_available')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}