import React from 'react';

interface UsersTableSkeletonProps {
  rowsCount?: number;
}

export const UsersTableSkeleton: React.FC<UsersTableSkeletonProps> = ({ 
  rowsCount = 10 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compras</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scoring</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Últ. Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
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
      {/* Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </td>
      
      {/* Business Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </td>
      
      {/* Email */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-32"></div>
      </td>
      
      {/* City */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-16"></div>
      </td>
      
      {/* Phone */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </td>
      
      {/* Compras */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="h-4 bg-gray-300 rounded w-8 mx-auto"></div>
      </td>
      
      {/* ID */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-12"></div>
      </td>
      
      {/* Scoring */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-gray-300 rounded-full w-12"></div>
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