import React from 'react';
import { ProductRowSkeleton } from './ProductRowSkeleton';

interface ProductsListSkeletonProps {
  rowsCount?: number;
}

export const ProductsListSkeleton: React.FC<ProductsListSkeletonProps> = ({ 
  rowsCount = 10 
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unidades por Caja
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Minorista
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Mayorista
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio con Descuento
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unidades Vendidas
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
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