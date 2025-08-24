import React, { useEffect, useState } from "react";
import { api } from '@/lib/api';

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: string;
  currency: string;
  created_at: string;
  updated_at: string;
  used_points: number;
  order_lines: Array<{
    id: string;
    order_id: string;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: string;
    total_price: string;
    products: {
      id: number;
      name: string;
      description: string;
      image_url: string;
      list_price: string;
      created_at: string;
      status: string;
      wholesale_price: string;
      sku: string;
      iva: string;
      grammage: string;
      updated_at: string | null;
      units_per_box: number;
      redeemable_with_points: boolean;
    } | null;
  }>;
  order_payments: Array<{
    id: string;
    order_id: string;
    payment_method: string;
    status: string;
    paid_at: string | null;
    amount: string;
    transaction_id: string | null;
    metadata: Record<string, unknown>;
  }>;
  order_addresses: Array<{
    id: string;
    order_id: string;
    type: string;
    full_name: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string | null;
    postal_code: string;
    country: string;
    phone: string;
  }>;
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Sin compras registradas</td></tr>
            ) : (
              orders.map((order, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-mono text-sm">#{order.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' ? 'Pendiente' :
                       order.status === 'completed' ? 'Completada' :
                       order.status === 'cancelled' ? 'Cancelada' :
                       order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {new Date(order.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                    {order.total_amount} {order.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a 
                      href={`/admin/pedidos/${order.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer text-sm transition-colors"
                    >
                      Ver Detalle
                    </a>
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