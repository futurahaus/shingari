'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200'
      };
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

const formatCurrency = (amount: string) => {
  return `€${Number(amount).toFixed(2).replace('.', ',')}`;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        const orderData = await api.get<Order>(`/orders/${orderId}`);
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Error al cargar los detalles de la orden');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="flex gap-8">
          <Sidebar />
          <div className="flex-1">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA3D15]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="flex gap-8">
          <Sidebar />
          <div className="flex-1">
            <div className="text-center text-red-600">
              <p>{error || 'No se pudo cargar la orden'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const shippingAddress = order.order_addresses.find(addr => addr.type === 'shipping');
  const billingAddress = order.order_addresses.find(addr => addr.type === 'billing');
  const payment = order.order_payments[0];

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-16 py-12">
      <div className="flex gap-8">
        <Sidebar />
        <div className="flex-1 space-y-4">
          {/* Header Card - Order Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                    {statusConfig.label}
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    Orden {formatOrderId(order.id)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Fecha de compra: {formatDate(order.created_at)}
                </p>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => {
                    // Lógica para repetir compra
                    console.log('Repetir compra:', order.id);
                  }}
                  className="px-4 py-2 bg-[#EA3D15] text-white rounded text-sm font-medium hover:bg-[#d43e0e] transition-colors"
                >
                  Repetir compra
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Details Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-900">Detalle de entrega</h3>
            </div>
            <div className="space-y-3">
              <div className="flex gap-1">
                <span className="text-sm text-gray-600">Tipo de entrega:</span>
                <span className="text-sm font-medium text-gray-900">Envío a domicilio</span>
              </div>
              <div className="flex gap-1">
                <span className="text-sm text-gray-600">Entrega en:</span>
                <span className="text-sm font-medium text-gray-900">
                  {shippingAddress ? `${shippingAddress.address_line1}, ${shippingAddress.city}, ${shippingAddress.country}` : 'No especificada'}
                </span>
              </div>
              <div className="flex gap-1">
                <span className="text-sm text-gray-600">Fecha de entrega:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(order.created_at)} de 9:00a.m. a 3:00p.m.
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex gap-1">
                  <span className="text-sm text-gray-600">Código de seguimiento:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {order.id.slice(0, 8).toUpperCase()}-{order.id.slice(8, 12).toUpperCase()}
                  </span>
                </div>
                <button className="px-4 py-2 bg-[#EA3D15] text-white rounded text-sm font-medium hover:bg-[#d43e0e] transition-colors">
                  Seguir compra
                </button>
              </div>
            </div>
          </div>

          {/* Payment and Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Payment Details Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-900">Detalle de pago</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {payment?.payment_method === 'card' ? 'Tarjeta de crédito' : payment?.payment_method}
                </p>
                <p className="text-sm text-gray-900">
                  {formatCurrency(order.total_amount)} - 1 pago de {formatCurrency(order.total_amount)}
                </p>
              </div>
              <div className="mt-4">
                <button className="w-full px-4 py-2 border border-gray-700 text-gray-700 rounded text-sm font-bold hover:bg-gray-50 transition-colors">
                  Ver factura
                </button>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-900">Resumen</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">Subtotal</span>
                  <span className="text-sm text-gray-900">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">Descuentos</span>
                  <span className="text-sm text-gray-900">-€0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">Envío</span>
                  <span className="text-sm text-gray-900">€0,00</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">Productos</h3>
                <div className="flex gap-4">
                  <span className="text-sm font-medium text-gray-900 w-24 text-center">Precio</span>
                  <span className="text-sm font-medium text-gray-900 w-24 text-center">Subtotal</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {order.order_lines.map((line, index) => (
                <div key={line.id}>
                  {index > 0 && <hr className="border-gray-200 my-4" />}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-12 h-12 bg-gray-200 border border-gray-300 rounded flex items-center justify-center">
                        <div className="w-10 h-10 bg-gray-300 rounded"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">{line.product_name}</p>
                        <p className="text-sm text-gray-400">Cantidad: {line.quantity}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-sm text-gray-900 w-24 text-center">{formatCurrency(line.unit_price)}</span>
                      <span className="text-sm text-gray-900 w-24 text-center">{formatCurrency(line.total_price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 