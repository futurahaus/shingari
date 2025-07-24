"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Text } from '@/app/ui/components/Text';
import { ProductsListSkeleton } from '../../productos/components/ProductsListSkeleton';
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
  user_email?: string;
  user_name?: string;
  user_trade_name?: string;
  status: string;
  total_amount: string;
  currency: string;
  created_at: string;
  updated_at: string;
  order_lines: OrderLine[];
  order_addresses: OrderAddress[];
  order_payments: OrderPayment[];
}

const formatCurrency = (amount: string) => {
  return `$${Number(amount).toFixed(2)}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '0000-00-00';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    api.get<Order>(`/orders/${orderId}`)
      .then((data) => setOrder(data))
      .catch(() => setError('No se pudo cargar la orden.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <ProductsListSkeleton />;
  }
  if (error || !order) {
    return <div className="text-red-600 text-center py-8">{error || 'No se pudo cargar la orden.'}</div>;
  }

  const shippingAddress = order.order_addresses.find(addr => addr.type === 'shipping');
  const payment = order.order_payments[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8">
      <div className="bg-white rounded-xl shadow-lg w-full p-0">
        <div className="text-center pt-8 pb-4">
          <h2 className="font-bold text-lg">Detalles de la orden</h2>
        </div>
        <div className="px-8">
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="text-gray-500">ID de compra</div>
              <div className="text-gray-900 font-medium text-right">#{order.id.slice(0, 8).toUpperCase()}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="text-gray-500">Fecha</div>
              <div className="text-gray-900 text-right">{formatDate(order.created_at)}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="text-gray-500">ID de Cliente</div>
              <div className="text-gray-900 font-medium text-right">{order.user_id ? `#${order.user_id.slice(0, 6)}` : '-'}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="text-gray-500">Puntos</div>
              <div className="text-gray-900 text-right">300</div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="text-gray-500">Total</div>
              <div className="text-gray-900 font-medium text-right">{formatCurrency(order.total_amount)}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 py-6">
              <div className="text-gray-500">Método de pago</div>
              <div className="text-gray-900 text-right">{payment?.payment_method || '-'}</div>
            </div>
          </div>
        </div>
        <div className="mb-8 px-8">
          <h3 className="font-bold text-lg mb-4">Productos Comprados</h3>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Nombre de Producto</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Cantidad</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Precio</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {order.order_lines.map((line) => (
                  <tr key={line.id} className="border-t border-gray-100">
                    <td className="px-6 py-4 text-gray-900">{line.product_name}</td>
                    <td className="px-6 py-4 text-gray-900">{line.quantity}</td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(line.unit_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mb-8 px-8">
          <h3 className="font-bold text-lg mb-2">Dirección de Envío</h3>
          <div className="text-gray-700">
            {shippingAddress
              ? `${shippingAddress.city}, ${shippingAddress.country} (${shippingAddress.address_line1}${shippingAddress.address_line2 ? ', ' + shippingAddress.address_line2 : ''})`
              : 'No especificada'}
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4 px-8">
          <div className="flex-1">
            <label className="block font-medium mb-2">Subir factura</label>
            <div className="flex items-center gap-2 p-3 border rounded-xl bg-gray-50">
              <label className="bg-black text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-800 transition-colors">
                Seleccionar Archivo
                <input
                  type="file"
                  className="hidden"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                />
              </label>
              <span className="text-gray-500 text-sm">
                {selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}
              </span>
            </div>
          </div>
          <button
            className="mt-2 md:mt-0 px-6 py-2 border border-gray-400 rounded-xl text-gray-900 font-medium hover:bg-gray-100 transition-colors"
            onClick={() => router.back()}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}