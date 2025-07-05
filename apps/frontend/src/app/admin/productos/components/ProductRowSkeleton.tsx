import React from 'react';

export const ProductRowSkeleton: React.FC = () => {
  return (
    <li className="px-6 py-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Skeleton para la imagen */}
          <div className="flex-shrink-0 h-12 w-12">
            <div className="h-12 w-12 rounded-full bg-gray-300"></div>
          </div>
          
          {/* Skeleton para la información del producto */}
          <div className="ml-4">
            {/* Nombre del producto */}
            <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
            {/* Descripción */}
            <div className="h-3 bg-gray-300 rounded w-48 mb-2"></div>
            {/* Tags/badges */}
            <div className="flex items-center gap-2">
              <div className="h-5 bg-gray-300 rounded w-16"></div>
              <div className="h-5 bg-gray-300 rounded w-20"></div>
              <div className="h-5 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </div>
        
        {/* Skeleton para los botones */}
        <div className="flex items-center gap-2">
          <div className="h-8 bg-gray-300 rounded-lg w-16"></div>
          <div className="h-8 bg-gray-300 rounded-lg w-20"></div>
        </div>
      </div>
    </li>
  );
}; 