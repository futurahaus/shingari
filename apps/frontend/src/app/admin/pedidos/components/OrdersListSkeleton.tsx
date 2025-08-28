import React from "react";
import { useTranslation } from "@/contexts/I18nContext";

interface OrdersListSkeletonProps {
  rowsCount?: number;
}

const OrderRowSkeleton: React.FC = () => (
  <tr className="animate-pulse">
    {/* ID */}
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 rounded w-16"></div>
    </td>
    {/* Usuario */}
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 rounded w-32"></div>
    </td>
    {/* Total */}
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 rounded w-20"></div>
    </td>
    {/* Estado */}
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 rounded w-20"></div>
    </td>
    {/* Fecha */}
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-300 rounded w-24"></div>
    </td>
    {/* Acciones */}
    <td className="px-6 py-4 whitespace-nowrap text-right">
      <div className="h-8 bg-gray-300 rounded w-20 ml-auto"></div>
    </td>
  </tr>
);

export const OrdersListSkeleton: React.FC<OrdersListSkeletonProps> = ({ rowsCount = 10 }) => {
  const { t } = useTranslation();
  return (
  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.orders.table.id')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.orders.table.user')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.orders.table.total')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.orders.table.status')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.orders.table.date')}</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rowsCount }, (_, i) => <OrderRowSkeleton key={i} />)}
        </tbody>
      </table>
    </div>
    {/* Skeleton para el paginador */}
    <div className="flex justify-center items-center gap-2 py-6">
      <div className="h-8 bg-gray-300 rounded w-16"></div>
      <div className="h-8 bg-gray-300 rounded w-8"></div>
      <div className="h-8 bg-gray-300 rounded w-8"></div>
      <div className="h-8 bg-gray-300 rounded w-8"></div>
      <div className="h-8 bg-gray-300 rounded w-16"></div>
    </div>
  </div>
  );
}; 