import React from 'react';
import { useTranslation } from '@/contexts/I18nContext';

interface UsersTableSkeletonProps {
  rowsCount?: number;
}

export const UsersTableSkeleton: React.FC<UsersTableSkeletonProps> = ({ 
  rowsCount = 10 
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.id')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.tax_name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.email')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.phone')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.purchases')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.points')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.roles')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.last_login')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rowsCount }, (_, index) => (
              <UserRowSkeleton key={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UserRowSkeleton: React.FC = () => {
  return (
    <tr className="animate-pulse">
      {/* ID */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-12"></div>
      </td>
      
      {/* Nombre Fiscal */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </td>
      
      {/* Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </td>
      
      {/* Email */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-32"></div>
      </td>
      
      {/* Phone */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </td>
      
      {/* Compras */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="h-4 bg-gray-300 rounded w-8 mx-auto"></div>
      </td>
      
      {/* Points */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-gray-300 rounded-full w-12"></div>
      </td>
      
      {/* Roles */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex gap-1">
          <div className="h-5 bg-gray-300 rounded-full w-16"></div>
          <div className="h-5 bg-gray-300 rounded-full w-12"></div>
        </div>
      </td>
      
      {/* Últ. Login */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </td>
      
      {/* Acciones */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-8 bg-gray-300 rounded w-24"></div>
      </td>
    </tr>
  );
}; 