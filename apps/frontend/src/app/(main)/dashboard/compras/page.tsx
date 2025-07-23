'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';

interface OrderLine {
  id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

interface OrderAddress {
  id: string;
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

interface OrderPayment {
  id: string;
  payment_method: string;
  status: string;
  paid_at?: string;
  amount: string;
  transaction_id?: string;
  metadata?: any;
}

interface Order {
  id: string;
  user_id?: string;
  status: string;
  total_amount: string;
  currency: string;
  created_at: string;
  updated_at: string;
  order_lines: OrderLine[];
  order_addresses: OrderAddress[];
  order_payments: OrderPayment[];
}

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return {
        label: 'Pendiente',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200'
      };
    case 'completed':
    case 'paid':
      return {
        label: 'Compra facturada',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200'
      };
    case 'cancelled':
    case 'cancelled':
      return {
        label: 'Compra cancelada',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200'
      };
    case 'processing':
      return {
        label: 'En proceso',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200'
      };
    default:
      return {
        label: status,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-200'
      };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  return date.toLocaleDateString('es-ES', options);
};

const formatOrderId = (id: string) => {
  return `#${id.slice(0, 8).toUpperCase()}`;
};

export default function ComprasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await api.get<Order[]>('/orders/user/me');
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Error al cargar las órdenes');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="flex gap-8">
          <Sidebar />
          <div className="flex-1 bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA3D15]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="flex gap-8">
          <Sidebar />
          <div className="flex-1 bg-white shadow-sm rounded-lg p-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-16 py-12">
      <div className="flex gap-8">
        <Sidebar />
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6">Mis Compras</h2>
          
          {orders.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-6 text-center">
              <p className="text-gray-600">No tienes compras registradas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                
                return (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          {/* Status Tag */}
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                            {statusConfig.label}
                          </div>
                          
                          {/* Order ID */}
                          <span className="text-sm font-medium text-gray-900">
                            Orden {formatOrderId(order.id)}
                          </span>
                        </div>
                        
                        {/* Order Details */}
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Fecha de compra: {formatDate(order.created_at)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total: €{Number(order.total_amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="ml-4">
                        <button
                          onClick={() => {
                            // Navegar al detalle de la orden
                            console.log('Ver detalle de orden:', order.id);
                          }}
                          className="px-4 py-2 border border-gray-900 text-gray-900 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Ver detalle
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 