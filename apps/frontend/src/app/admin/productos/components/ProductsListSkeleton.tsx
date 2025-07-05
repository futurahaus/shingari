import React from 'react';
import { ProductRowSkeleton } from './ProductRowSkeleton';

interface ProductsListSkeletonProps {
  rowsCount?: number;
}

export const ProductsListSkeleton: React.FC<ProductsListSkeletonProps> = ({ 
  rowsCount = 10 
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {Array.from({ length: rowsCount }, (_, index) => (
          <ProductRowSkeleton key={index} />
        ))}
      </ul>
      
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