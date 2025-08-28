'use client';
import { useTranslation } from '@/contexts/I18nContext';
import { Gift, TrendingUp, TrendingDown, Clock, RefreshCw } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { usePoints, PointsLedgerEntry } from '@/hooks/usePoints';

export default function PointsPage() {
  const { t } = useTranslation();
  const { pointsData, loading, error, refetch } = usePoints();

  const getTransactionIcon = (type: string | null) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'used':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <Gift className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTransactionTypeLabel = (type: string | null) => {
    switch (type) {
      case 'EARN':
        return t('dashboard.earned');
      case 'USED':
        return t('dashboard.used');
      case 'EXPIRED':
        return t('dashboard.expired');
      default:
        return type || 'Unknown';
    }
  };

  const getTransactionTypeColor = (type: string | null) => {
    switch (type) {
      case 'EARN':
        return 'text-green-600 bg-green-50';
      case 'USED':
        return 'text-red-600 bg-red-50';
      case 'EXPIRED':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-16 py-12">
      <div className="flex gap-8">
        <Sidebar />
        <div className="flex-1">
          {/* Header with total points */}
          <div className="bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Gift className="w-8 h-8" />
                <h1 className="text-2xl font-bold">{t('dashboard.my_points')}</h1>
              </div>
              <button
                onClick={refetch}
                disabled={loading}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                title="Refresh points"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {loading ? (
              <div className="text-4xl font-bold mb-2">...</div>
            ) : error ? (
              <div className="text-2xl font-bold mb-2 text-red-200">Error loading points</div>
            ) : (
              <>
                <div className="text-4xl font-bold mb-2">
                  {pointsData?.balance?.total_points?.toLocaleString('de-DE') || '0'}
                </div>
                <p className="text-red-100">{t('dashboard.total_points')}</p>
              </>
            )}
          </div>

          {/* Points transactions table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('dashboard.points_transactions')}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dashboard.transaction_type')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dashboard.points')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dashboard.date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dashboard.description')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Loading transactions...
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-red-500">
                        Error loading transactions. Please try again.
                      </td>
                    </tr>
                  ) : pointsData?.transactions && pointsData.transactions.length > 0 ? (
                    pointsData.transactions.map((transaction: PointsLedgerEntry) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                              {getTransactionTypeLabel(transaction.type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString('de-DE')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.type === 'EARN' && transaction.order_number
                            ? `Bono por compra ${transaction.order_number}`
                            : transaction.type === 'USED' && transaction.order_number
                            ? `Puntos utilizados en compra ${transaction.order_number}`
                            : transaction.type === 'EXPIRED'
                            ? 'Puntos expirados'
                            : 'Transacción de puntos'
                          }
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No transactions found. Start shopping to earn points!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Points info section */}
          <div className="mt-6 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              ¿Cómo ganar puntos?
            </h3>
            <div className="space-y-2 text-blue-800">
              <p>• Gana 1 punto por cada euro gastado en tus compras</p>
              <p>• Los puntos expiran después de 12 meses de inactividad</p>
              <p>• Usa tus puntos por canjeables en la seccion de recompensas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}