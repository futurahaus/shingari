import React from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { ProductRowSkeleton } from './ProductRowSkeleton';

interface ProductsListSkeletonProps {
  rowsCount?: number;
}

export const ProductsListSkeleton: React.FC<ProductsListSkeletonProps> = ({ 
  rowsCount = 10 
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.table.product')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.table.stock')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.table.units_per_box')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.table.retail_price')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.table.wholesale_price')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.table.retail_price_with_iva')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.table.iva')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.products.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rowsCount }, (_, index) => (
              <ProductRowSkeleton key={index} />
            ))}
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