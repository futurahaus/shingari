'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

interface OrderLine {
  id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string; // Decimal se serializa como string
  total_price: string; // Decimal se serializa como string
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
  amount: string; // Decimal se serializa como string
  transaction_id?: string;
  metadata?: any;
}

interface Order {
  id: string;
  user_id?: string;
  status: string;
  total_amount: string; // Decimal se serializa como string
  currency: string;
  created_at: string;
  updated_at: string;
  order_lines: OrderLine[];
  order_addresses: OrderAddress[];
  order_payments: OrderPayment[];
}

export default function CongratsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No se proporcionó ID de orden');
        setLoading(false);
        return;
      }

      try {
        const orderData = await api.get<Order>(`/orders/${orderId}`);
        setOrder(orderData);
      } catch (error) {
        console.error('Error al obtener la orden:', error);
        setError('Error al obtener los detalles de la orden');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA3D15] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles de la orden...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'No se pudo cargar la orden'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#EA3D15] text-white py-2 px-4 rounded-[10px] font-medium text-sm hover:bg-[#d43e0e] transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Obtener la dirección de facturación para mostrar el nombre
  const billingAddress = order.order_addresses.find(addr => addr.type === 'billing');
  const customerName = billingAddress?.full_name || 'Cliente';

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-12 py-8">
        {/* Breadcrumb */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-base font-bold text-[#121417]">
            Confirmación de compra
          </h1>
        </div>

        {/* Congratulations Card */}
        <div className="flex justify-center">
          <div className="bg-[#FBFBFB] border-2 border-[#E3E3E3] rounded-[32px] p-16 max-w-2xl w-full">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Check Icon */}
              <div className="w-15 h-15 bg-white rounded-full flex items-center justify-center mb-4">
                <svg 
                  className="w-8 h-8 text-[#009951]" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>

              {/* Main Message */}
              <h2 className="text-2xl font-semibold text-black leading-tight">
                ¡Muchas gracias por tu compra, {customerName}!
              </h2>

              {/* Order Details */}
              <div className="text-sm text-gray-600 space-y-2">
                <p>Orden #{order.id.slice(0, 8).toUpperCase()}</p>
                <p>Total: €{Number(order.total_amount).toFixed(2)}</p>
                <p>Estado: {order.status}</p>
              </div>

              {/* Subtitle */}
              <p className="text-sm font-medium text-black leading-relaxed max-w-md">
                Enviaremos un mail de confirmación con los detalles de tu orden!
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md">
                <button
                  onClick={() => {
                    // Lógica para ir a mis compras
                    console.log('Ir a mis compras');
                  }}
                  className="flex-1 bg-[#EA3D15] text-white py-3 px-4 rounded-[10px] font-medium text-sm hover:bg-[#d43e0e] transition-colors"
                >
                  Ir a mis compras
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="bg-[#EA3D15] text-white py-3 px-4 rounded-[10px] font-medium text-sm hover:bg-[#d43e0e] transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    </div>
  );
} 