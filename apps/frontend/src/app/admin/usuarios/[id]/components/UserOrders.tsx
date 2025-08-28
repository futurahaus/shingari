import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from '@/lib/api';

interface OrderLine {
  id: string;
  order_id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  products: {
    name: string;
    image_url: string;
  };
}

interface OrderPayment {
  id: string;
  order_id: string;
  payment_method: string;
  status: string;
  paid_at?: string;
  amount: string;
  transaction_id?: string;
  metadata?: Record<string, unknown>;
}

interface OrderAddress {
  id: string;
  order_id: string;
  type: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: string;
  currency: string;
  created_at: string;
  updated_at: string;
  earned_points: number;
  delivery_date: string;
  status: string;
  order_lines: OrderLine[];
  order_payments: OrderPayment[];
  order_addresses: OrderAddress[];
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
              <div className="grid grid-cols-5 gap-4">
                <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Sin compras registradas</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {new Date(order.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    €{Number(order.total_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status === 'accepted' ? 'Aceptada' :
                       order.status === 'delivered' ? 'Entregada' :
                       order.status === 'cancelled' ? 'Cancelada' :
                       order.status === 'pending' ? 'Pendiente' : order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer text-sm inline-block"
                    >
                      Ver Detalles
                    </Link>
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