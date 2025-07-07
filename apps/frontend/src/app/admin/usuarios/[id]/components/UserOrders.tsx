import React, { useEffect, useState } from "react";
import { api } from '@/lib/api';

interface Order {
  id: string;
  date: string;
  total: string;
}

interface UserOrdersProps {
  userId: string;
  onOrdersLoaded?: (orders: Order[]) => void;
}

export const UserOrders: React.FC<UserOrdersProps> = ({ userId, onOrdersLoaded }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    api.get(`/user/admin/${userId}/orders`)
      .then((ordersRes) => {
        const ordersData = Array.isArray(ordersRes) ? ordersRes : [];
        setOrders(ordersData);
        onOrdersLoaded?.(ordersData);
      })
      .catch((err) => {
        const error = err instanceof Error ? err.message : 'Unknown error';
        setError('Error al cargar el historial de compras: ' + error);
      })
      .finally(() => setLoading(false));
  }, [userId, onOrdersLoaded]);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="h-6 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
        <div className="overflow-x-auto">
          <div className="min-w-full border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-4 gap-4">
                <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-4 bg-gray-300 rounded w-full mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Historial de compras</h2>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Historial de compras</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID de orden</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Sin compras registradas</td></tr>
            ) : (
              orders.map((order, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer text-sm">Ver Detalles</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 