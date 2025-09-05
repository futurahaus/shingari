"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/contexts/I18nContext';
import { ArrowLeft, User, Calendar, CreditCard, Package } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { RedemptionStatusChip } from '../components/RedemptionStatusChip';

interface RedemptionLine {
  id: number;
  reward_id: number;
  reward_name: string;
  quantity: number;
  points_cost: number;
  total_points: number;
}

interface Redemption {
  id: number;
  user_id: string;
  status: string;
  total_points: number;
  created_at: string;
  lines: RedemptionLine[];
}

export default function RedemptionDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const [redemption, setRedemption] = useState<Redemption | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = (newStatus: string) => {
    if (redemption) {
      setRedemption({
        ...redemption,
        status: newStatus
      });
    }
  };

  const redemptionId = params.id as string;

  const fetchRedemptionDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get all redemptions to find the specific one
      const data = await api.get('/rewards/redemptions') as { data: Redemption[] };
      const foundRedemption = data.data.find((r: Redemption) => r.id === parseInt(redemptionId));

      if (!foundRedemption) {
        throw new Error('Canje no encontrado');
      }

      setRedemption(foundRedemption);
    } catch (err) {
      console.error('Error fetching redemption detail:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [redemptionId]);

  useEffect(() => {
    if (redemptionId) {
      fetchRedemptionDetail();
    }
  }, [redemptionId, fetchRedemptionDetail]);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString('es-ES');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('redemption_detail.error_loading_detail')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Link
              href="/admin/canjes"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('redemption_detail.back_to_redemptions')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!redemption) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Canje no encontrado
          </h3>
          <Link
            href="/admin/canjes"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('redemption_detail.back_to_redemptions')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/canjes"
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('redemption_detail.back_to_redemptions')}
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('redemption_detail.title')} #{redemption.id}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('redemption_detail.redemption_info')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <RedemptionStatusChip
              redemptionId={redemption.id}
              currentStatus={redemption.status}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Redemption Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
              {t('redemption_detail.redemption_info')}
            </h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID del Canje</dt>
                <dd className="mt-1 text-sm text-gray-900">#{redemption.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('redemption_detail.total_points')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatPoints(redemption.total_points)} pts</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('redemption_detail.status')}</dt>
                <dd className="mt-1">
                  <RedemptionStatusChip
                    redemptionId={redemption.id}
                    currentStatus={redemption.status}
                    onStatusChange={handleStatusChange}
                    className="text-xs"
                  />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('redemption_detail.created_at')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(redemption.created_at)}</dd>
              </div>
            </dl>
          </div>

          {/* Items */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gray-400" />
              {t('redemption_detail.items')}
            </h2>
            {redemption.lines.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('redemption_detail.no_items')}</p>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recompensa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('dashboard.quantity')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Puntos por Unidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {redemption.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {line.reward_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {line.reward_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {line.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPoints(line.points_cost)} pts
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPoints(line.total_points)} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-400" />
              {t('redemption_detail.user_info')}
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID de Usuario</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{redemption.user_id}</dd>
              </div>
            </dl>
          </div>

          {/* Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-400" />
              Resumen
            </h2>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Total de Artículos</dt>
                <dd className="text-sm text-gray-900">
                  {redemption.lines.reduce((sum, line) => sum + line.quantity, 0)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Total de Puntos</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatPoints(redemption.total_points)} pts
                </dd>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <dt className="text-base font-medium text-gray-900">Total Final</dt>
                  <dd className="text-base font-bold text-gray-900">
                    {formatPoints(redemption.total_points)} pts
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
