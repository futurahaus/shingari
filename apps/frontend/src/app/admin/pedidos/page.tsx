"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Text } from "@/app/ui/components/Text";
import { ProductsListSkeleton } from "../productos/components/ProductsListSkeleton";
import { useAdminOrders } from "./hooks/useAdminOrders.hook";
import { FaSearch, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { Button } from "@/app/ui/components/Button";

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'created_at' | 'updated_at' | 'total_amount' | 'status' | 'user_name'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { orders, loading, error, lastPage } = useAdminOrders({ 
    page, 
    limit: 10,
    search: searchQuery, 
    sortField, 
    sortDirection 
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: typeof sortField) => {
    if (sortField !== field) return <FaSort className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <FaSortUp className="w-4 h-4 text-gray-600" /> 
      : <FaSortDown className="w-4 h-4 text-gray-600" />;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage !== page && newPage > 0 && newPage <= lastPage) {
      setPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Text size="3xl" weight="bold" color="gray-900" as="h1">
            Pedidos
          </Text>
        </div>
        <Text size="sm" weight="normal" color="gray-500" as="p" className="mb-4">
          Gestión de pedidos realizados en la plataforma
        </Text>
        {/* Search and Sort Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative max-w-md flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por ID, usuario o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onBlur={() => setSearchQuery(searchTerm)}
              onKeyPress={(e) => e.key === 'Enter' && setSearchQuery(searchTerm)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
        </div>
      </div>
      {loading ? (
        <ProductsListSkeleton rowsCount={10} />
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('created_at')} 
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    ID {getSortIcon('created_at')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('user_name')} 
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Usuario {getSortIcon('user_name')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('total_amount')} 
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Total {getSortIcon('total_amount')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('status')} 
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Estado {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('updated_at')} 
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Fecha {getSortIcon('updated_at')}
                  </button>
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.user_id ? (
                      <Link 
                        href={`/admin/usuarios/${order.user_id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {order.user_name || order.user_trade_name || order.user_email || order.user_id}
                      </Link>
                    ) : (
                      order.user_name || order.user_trade_name || order.user_email || order.user_id || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€{Number(order.total_amount).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === "Completada" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/admin/pedidos/${order.id}`} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer">
                      Ver Detalles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Paginador */}
          <div className="flex justify-center items-center gap-2 py-6">
            <Button
              onPress={() => handlePageChange(page - 1)}
              type="secondary"
              text="Anterior"
              testID="prev-page-button"
              inline
              textProps={{
                size: 'sm',
                weight: 'medium',
                color: page === 1 ? 'gray-400' : 'secondary-main'
              }}
            />
            {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                onPress={() => handlePageChange(p)}
                type={p === page ? 'primary' : 'secondary'}
                text={p.toString()}
                testID={`page-${p}-button`}
                inline
                textProps={{
                  size: 'sm',
                  weight: 'medium',
                  color: p === page ? 'primary-contrast' : 'secondary-main'
                }}
              />
            ))}
            <Button
              onPress={() => handlePageChange(page + 1)}
              type="secondary"
              text="Siguiente"
              testID="next-page-button"
              inline
              textProps={{
                size: 'sm',
                weight: 'medium',
                color: page === lastPage ? 'gray-400' : 'secondary-main'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}