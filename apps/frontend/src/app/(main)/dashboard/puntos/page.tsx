'use client';
import { useTranslation } from '@/contexts/I18nContext';
import { Gift, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

// Mockup data for points transactions
const mockPointsTransactions = [
  {
    id: 1,
    type: 'earned',
    points: 150,
    date: '2025-01-17',
    description: 'Bono por compra #12345',
    orderId: '12345'
  },
  {
    id: 2,
    type: 'used',
    points: -50,
    date: '2025-01-15',
    description: 'Puntos utilizados en compra #12340',
    orderId: '12340'
  },
  {
    id: 3,
    type: 'earned',
    points: 200,
    date: '2025-01-12',
    description: 'Bono por referido - Usuario nuevo',
    orderId: null
  },
  {
    id: 4,
    type: 'earned',
    points: 75,
    date: '2025-01-10',
    description: 'Bono por compra #12335',
    orderId: '12335'
  },
  {
    id: 5,
    type: 'expired',
    points: -25,
    date: '2025-01-08',
    description: 'Puntos expirados',
    orderId: null
  },
  {
    id: 6,
    type: 'used',
    points: -100,
    date: '2025-01-05',
    description: 'Puntos utilizados en compra #12330',
    orderId: '12330'
  },
  {
    id: 7,
    type: 'earned',
    points: 300,
    date: '2025-01-03',
    description: 'Bono por compra #12325',
    orderId: '12325'
  }
];

// Calculate total points
const totalPoints = mockPointsTransactions.reduce((total, transaction) => {
  return total + transaction.points;
}, 0);

export default function PointsPage() {
  const { t } = useTranslation();

  const getTransactionIcon = (type: string) => {
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

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'earned':
        return t('dashboard.earned');
      case 'used':
        return t('dashboard.used');
      case 'expired':
        return t('dashboard.expired');
      default:
        return type;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'earned':
        return 'text-green-600 bg-green-50';
      case 'used':
        return 'text-red-600 bg-red-50';
      case 'expired':
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
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-8 h-8" />
              <h1 className="text-2xl font-bold">{t('dashboard.my_points')}</h1>
            </div>
            <div className="text-4xl font-bold mb-2">{totalPoints.toLocaleString()}</div>
            <p className="text-red-100">{t('dashboard.total_points')}</p>
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
                  {mockPointsTransactions.map((transaction) => (
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
                          {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                    </tr>
                  ))}
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
              <p>• Recibe 50 puntos extra por cada referido que se registre</p>
              <p>• Los puntos expiran después de 12 meses de inactividad</p>
              <p>• Usa tus puntos para obtener descuentos en futuras compras</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}