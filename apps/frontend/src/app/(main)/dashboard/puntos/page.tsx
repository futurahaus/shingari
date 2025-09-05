'use client';
import { useTranslation } from '@/contexts/I18nContext';
import { Gift, TrendingUp, TrendingDown, Clock, RefreshCw } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { usePointsQuery, PointsLedgerEntry } from '@/hooks/usePointsQuery';
import { colors } from '@/app/ui/colors';

export default function PointsPage() {
  const { t, locale } = useTranslation();
  const { balance, transactions, isLoading, error, refetch, isFetching } = usePointsQuery();

  const getTransactionIcon = (type: string | null) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="w-4 h-4" style={{ color: colors.status.success.main }} />;
      case 'used':
        return <TrendingDown className="w-4 h-4" style={{ color: colors.status.error.main }} />;
      case 'spend':
        return <TrendingDown className="w-4 h-4" style={{ color: colors.status.error.main }} />;
      case 'expired':
        return <Clock className="w-4 h-4" style={{ color: colors.neutral.gray[500] }} />;
      default:
        return <Gift className="w-4 h-4" style={{ color: colors.status.info.main }} />;
    }
  };

  const getTransactionTypeLabel = (type: string | null) => {
    switch (type) {
      case 'EARN':
        return t('dashboard.earned');
      case 'SPEND':
          return t('dashboard.spend');
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
        return `text-[${colors.status.success.main}] bg-[${colors.status.success.main}]/10`;
      case 'USED':
        return `text-[${colors.status.error.main}] bg-[${colors.status.error.main}]/10`;
      case 'SPEND':
        return `text-[${colors.status.error.main}] bg-[${colors.status.error.main}]/10`;
      case 'EXPIRED':
        return `text-[${colors.neutral.gray[600]}] bg-[${colors.neutral.gray[100]}]`;
      default:
        return `text-[${colors.status.info.main}] bg-[${colors.status.info.main}]/10`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeMap = {
      'es': 'es-ES',
      'zh': 'zh-CN'
    };
    const dateLocale = localeMap[locale as keyof typeof localeMap] || 'es-ES';
    return date.toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-16 py-12">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <Sidebar />
        <div className="flex-1 w-full">
          {/* Header with total points - responsive */}
          <div 
            className="rounded-lg p-3 sm:p-4 mb-4 text-white"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
                <h1 className="text-lg sm:text-xl font-bold">{t('dashboard.my_points')}</h1>
              </div>
              <div className="flex items-center gap-2">
                {isFetching && !isLoading && (
                  <div className="text-xs text-white/80 opacity-75 hidden sm:block">
                    {t('dashboard.updating')}
                  </div>
                )}
                <button
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  title={t('dashboard.refresh_points')}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            {isLoading ? (
              <div className="text-2xl sm:text-3xl font-bold mb-1">...</div>
            ) : error ? (
              <div className="text-lg sm:text-xl font-bold mb-1 text-white/80">{t('dashboard.error_loading_points')}</div>
            ) : (
              <>
                <div className="text-2xl sm:text-3xl font-bold mb-1">
                  {balance?.total_points?.toLocaleString(locale === 'zh' ? 'zh-CN' : 'es-ES') || '0'}
                </div>
                <p className="text-white/90 text-xs sm:text-sm">{t('dashboard.total_points')}</p>
              </>
            )}
          </div>

          {/* Points transactions table - responsive */}
          <div 
            className="rounded-lg shadow-sm border"
            style={{ 
              backgroundColor: colors.background.primary,
              borderColor: colors.border.light
            }}
          >
            <div 
              className="p-3 sm:p-4 border-b"
              style={{ borderColor: colors.border.light }}
            >
              <h2 
                className="text-base sm:text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                {t('dashboard.points_transactions')}
              </h2>
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: colors.background.secondary }}>
                  <tr>
                    <th 
                      className="px-3 sm:px-4 py-2 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.text.tertiary }}
                    >
                      {t('dashboard.transaction_type')}
                    </th>
                    <th 
                      className="px-3 sm:px-4 py-2 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.text.tertiary }}
                    >
                      {t('dashboard.points')}
                    </th>
                    <th 
                      className="px-3 sm:px-4 py-2 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.text.tertiary }}
                    >
                      {t('dashboard.date')}
                    </th>
                    <th 
                      className="px-3 sm:px-4 py-2 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.text.tertiary }}
                    >
                      {t('dashboard.description')}
                    </th>
                  </tr>
                </thead>
                <tbody 
                  className="divide-y"
                  style={{ 
                    backgroundColor: colors.background.primary,
                    borderColor: colors.border.light
                  }}
                >
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-3 sm:px-4 py-6 text-center" style={{ color: colors.text.tertiary }}>
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          {t('dashboard.loading_transactions')}
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={4} className="px-3 sm:px-4 py-6 text-center" style={{ color: colors.status.error.main }}>
                        {t('dashboard.error_loading_transactions')}
                      </td>
                    </tr>
                  ) : transactions && transactions.length > 0 ? (
                    transactions.map((transaction: PointsLedgerEntry) => (
                      <tr 
                        key={transaction.id} 
                        className="hover:opacity-80 transition-opacity"
                        style={{ 
                          backgroundColor: colors.background.primary,
                          borderBottom: `1px solid ${colors.border.light}`
                        }}
                      >
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                              {getTransactionTypeLabel(transaction.type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                          <span 
                            className="text-sm font-medium"
                            style={{ 
                              color: transaction.points > 0 ? colors.status.success.main : colors.status.error.main 
                            }}
                          >
                            {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString(locale === 'zh' ? 'zh-CN' : 'es-ES')}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm" style={{ color: colors.text.primary }}>
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm" style={{ color: colors.text.primary }}>
                          {transaction.type === 'EARN' && transaction.order_number
                            ? t('dashboard.bonus_for_purchase', { orderNumber: transaction.order_number })
                            : transaction.type === 'USED' && transaction.order_number
                            ? t('dashboard.points_spent_on_purchase', { orderNumber: transaction.order_number })
                            : transaction.type === 'EXPIRED'
                            ? t('dashboard.points_expired')
                            : t('dashboard.points_transaction')
                          }
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 sm:px-4 py-6 text-center" style={{ color: colors.text.tertiary }}>
                        {t('dashboard.no_transactions')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="sm:hidden">
              {isLoading ? (
                <div className="p-4 text-center" style={{ color: colors.text.tertiary }}>
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t('dashboard.loading_transactions')}
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 text-center" style={{ color: colors.status.error.main }}>
                  {t('dashboard.error_loading_transactions')}
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="divide-y" style={{ borderColor: colors.border.light }}>
                  {transactions.map((transaction: PointsLedgerEntry) => (
                    <div 
                      key={transaction.id}
                      className="p-3"
                      style={{ 
                        backgroundColor: colors.background.primary,
                        borderBottom: `1px solid ${colors.border.light}`
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                            {getTransactionTypeLabel(transaction.type)}
                          </span>
                        </div>
                        <span 
                          className="text-sm font-medium"
                          style={{ 
                            color: transaction.points > 0 ? colors.status.success.main : colors.status.error.main 
                          }}
                        >
                          {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString(locale === 'zh' ? 'zh-CN' : 'es-ES')}
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: colors.text.secondary }}>
                        {formatDate(transaction.created_at)}
                      </div>
                      <div className="text-sm mt-1" style={{ color: colors.text.primary }}>
                        {transaction.type === 'EARN' && transaction.order_number
                          ? t('dashboard.bonus_for_purchase', { orderNumber: transaction.order_number })
                          : transaction.type === 'USED' && transaction.order_number
                          ? t('dashboard.points_spent_on_purchase', { orderNumber: transaction.order_number })
                          : transaction.type === 'EXPIRED'
                          ? t('dashboard.points_expired')
                          : t('dashboard.points_transaction')
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center" style={{ color: colors.text.tertiary }}>
                  {t('dashboard.no_transactions')}
                </div>
              )}
            </div>
          </div>

          {/* Points info section - responsive */}
          <div 
            className="mt-4 rounded-lg p-3 sm:p-4"
            style={{ 
              backgroundColor: `${colors.status.info.main}10`,
              border: `1px solid ${colors.status.info.main}20`
            }}
          >
            <h3 
              className="text-sm sm:text-base font-semibold mb-2"
              style={{ color: colors.status.info.dark }}
            >
              {t('dashboard.how_to_earn_points')}
            </h3>
            <div className="space-y-1 text-xs sm:text-sm" style={{ color: colors.status.info.main }}>
              <p>{t('dashboard.earn_points_rule_1')}</p>
              <p>{t('dashboard.earn_points_rule_2')}</p>
              <p>{t('dashboard.earn_points_rule_3')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}