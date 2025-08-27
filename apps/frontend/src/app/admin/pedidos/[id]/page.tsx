"use client";
import React, { useEffect, useState } from 'react';
import {  useParams } from 'next/navigation';
import Link from 'next/link';
import { OrdersDetailSkeleton } from '../components/OrdersDetailSkeleton';
import { StatusChip } from '../components/StatusChip';
import { api } from '@/lib/api';
import { Button } from '@/app/ui/components/Button';

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
  metadata?: Record<string, unknown>;
}

interface DocumentUploadResponse {
  url: string;
  path: string;
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
  invoice_file_url?: string;
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
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; path: string; name: string }>>([]);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    api.get<Order>(`/orders/${orderId}`)
      .then((data) => {
        setOrder(data);
        // Si ya hay una factura subida, agregarla a la lista de archivos
        if (data.invoice_file_url) {
          setUploadedFiles([{
            url: data.invoice_file_url,
            path: data.invoice_file_url.split('/').pop() || 'invoice.pdf',
            name: 'Factura subida anteriormente'
          }]);
        }
      })
      .catch(() => setError('No se pudo cargar la orden.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  // Log para verificar variables de entorno
  useEffect(() => {
    console.log('🔧 Variables de entorno:');
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('orderId:', orderId);
  }, [orderId]);

  const handleFileUpload = async () => {
    console.log('🔄 handleFileUpload iniciado');
    console.log('selectedFile:', selectedFile);
    console.log('orderId:', orderId);
    
    if (!selectedFile || !orderId) {
      console.log('❌ No hay archivo seleccionado o orderId');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', 'invoice');

      const token = localStorage.getItem('accessToken');
      console.log('🔑 Token:', token ? 'Presente' : 'No encontrado');
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.');
      }
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/orders/${orderId}/upload-document`;
      console.log('🌐 URL del API:', apiUrl);

      // Intentar con fetch primero
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en la respuesta:', errorText);
        throw new Error(`Error al subir archivo: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result: DocumentUploadResponse = await response.json();
      console.log('✅ Resultado exitoso:', result);

      // Reemplazar la factura existente o agregar una nueva
      setUploadedFiles([{
        url: result.url,
        path: result.path,
        name: selectedFile.name
      }]);
      
      setSelectedFile(null);
      alert('Archivo subido exitosamente');
    } catch (error) {
      console.error('❌ Error al subir archivo:', error);
      alert(`Error al subir el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 handleFileChange iniciado');
    const file = e.target.files?.[0] || null;
    console.log('📄 Archivo seleccionado:', file);
    
    setSelectedFile(file);
    
    // Subir automáticamente cuando se selecciona un archivo
    if (file) {
      console.log('⏰ Programando subida automática...');
      // Pequeño delay para que el usuario vea que se seleccionó el archivo
      setTimeout(() => {
        console.log('🚀 Ejecutando subida automática...');
        handleFileUpload();
      }, 100);
    } else {
      console.log('❌ No se seleccionó ningún archivo');
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/orders/${orderId}/documents/${filePath}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar archivo');
      }

      // Limpiar la URL de la base de datos también
      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_file_url: null,
        }),
      });

      if (!updateResponse.ok) {
        console.warn('No se pudo limpiar la URL de la base de datos');
      }

      setUploadedFiles([]);
      alert('Archivo eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      alert('Error al eliminar el archivo. Por favor, inténtalo de nuevo.');
    }
  };

  if (loading) {
    return <OrdersDetailSkeleton />;
  }
  if (error || !order) {
    return <div className="text-red-600 text-center py-8">{error || 'No se pudo cargar la orden.'}</div>;
  }

  const shippingAddress = order.order_addresses.find(addr => addr.type === 'shipping');
  const payment = order.order_payments[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8 px-16">
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
              <div className="text-gray-900 font-medium text-right">
                {order.user_id ? (
                  <Link href={`/admin/usuarios/${order.user_id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                    #{order.user_id.slice(0, 6)}
                  </Link>
                ) : (
                  '-'
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="text-gray-500">Estado</div>
              <div className="text-gray-900 text-right flex justify-end">
                <StatusChip 
                  orderId={order.id} 
                  currentStatus={order.status}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="text-gray-500">Puntos</div>
              <div className="text-gray-900 text-right">-</div>
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
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {order.order_lines.map((line) => (
                  <tr key={line.id} className="border-t border-gray-100">
                    <td className="px-6 py-4 text-gray-900">{line.product_name}</td>
                    <td className="px-6 py-4 text-gray-900">{line.quantity}</td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(line.unit_price)}</td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency((Number(line.unit_price) * line.quantity).toString())}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td className="px-6 py-4 text-right font-bold" colSpan={3}>Total</td>
                  <td className="px-6 py-4 text-gray-900 font-bold">
                    {formatCurrency(order.order_lines.reduce((acc, line) => acc + Number(line.unit_price) * line.quantity, 0).toString())}
                  </td>
                </tr>
              </tfoot>
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
            <div className="flex justify-between items-center gap-2 p-3 border rounded-xl bg-gray-50">
              <label className={`px-4 py-2 rounded cursor-pointer transition-colors ${
                uploading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}>
                {uploading ? 'Subiendo...' : 'Seleccionar Archivo'}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
              <span className="text-gray-500 text-sm">
                {uploading ? 'Subiendo archivo...' : selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}
              </span>
              {selectedFile && !uploading && (
                <Button
                  onPress={handleFileUpload}
                  type="primary-admin"
                  text="Subir Archivo"
                  testID="upload-button"
                  inline
                  textProps={{
                    size: 'sm',
                  }}
                />
              )}
              {uploading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </div>
            
            {/* Lista de archivos subidos */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Archivos subidos:</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Ver archivo
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.path)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}