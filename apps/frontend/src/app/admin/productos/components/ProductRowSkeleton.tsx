import React from 'react';

export const ProductRowSkeleton: React.FC = () => {
  return (
    <tr className="animate-pulse">
      {/* Producto (imagen, nombre y SKU) */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            <div className="h-12 w-12 rounded-lg bg-gray-300"></div>
          </div>
          <div className="ml-4">
            <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      </td>
      
      {/* Stock */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-12"></div>
      </td>
      
      {/* Unidades por Caja */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-16"></div>
      </td>
      
      {/* Precio Minorista */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-16"></div>
      </td>
      
      {/* Precio Mayorista */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-16"></div>
      </td>
      
      {/* Precio con Descuento */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-16"></div>
      </td>
      
      {/* Unidades Vendidas */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-12"></div>
      </td>
      
      {/* Acciones */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="h-8 bg-gray-300 rounded-lg w-8"></div>
          <div className="h-8 bg-gray-300 rounded-lg w-8"></div>
        </div>
      </td>
    </tr>
  );
}; 