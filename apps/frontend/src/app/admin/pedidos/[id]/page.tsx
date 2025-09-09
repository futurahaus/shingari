"use client";
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import {  useParams } from 'next/navigation';
import Link from 'next/link';
import { OrdersDetailSkeleton } from '../components/OrdersDetailSkeleton';
import { StatusChip } from '../components/StatusChip';
import { api } from '@/lib/api';
import { Button } from '@/app/ui/components/Button';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { formatCurrency as formatCurrencyUtil } from '@/lib/currency';

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
  delivery_date?: string;
  cancellation_reason?: string;
  cancellation_date?: string;
  invoice_file_url?: string;
  order_lines: OrderLine[];
  order_addresses: OrderAddress[];
  order_payments: OrderPayment[];
}

const formatCurrency = (amount: string) => {
  return formatCurrencyUtil(Number(amount));
};

const formatDate = (dateString: string) => {
  if (!dateString) return '0000-00-00';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function AdminOrderDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const orderId = params.id as string;
  const { showSuccess, showError } = useNotificationContext();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; path: string; name: string }>>([]);

  // Function to refresh order data
  const refreshOrderData = () => {
    setRefreshKey(prev => prev + 1);
  };

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
      .catch(() => setError(t('admin.orders.detail.error_loading_order')))
      .finally(() => setLoading(false));
  }, [orderId, t, refreshKey]); // Added refreshKey as dependency

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
        throw new Error(t('admin.orders.detail.auth_token_missing'));
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
        throw new Error(t('admin.orders.detail.upload_error', { status: response.status, statusText: response.statusText, error: errorText }));
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
      showSuccess(t('admin.orders.detail.file_uploaded'), t('admin.orders.detail.invoice_uploaded_success'));
    } catch (error) {
      console.error('❌ Error al subir archivo:', error);
      showError(t('admin.orders.detail.upload_error_title'), error instanceof Error ? error.message : t('admin.orders.detail.unknown_error'));
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleDeleteFile = async (filePath: string) => {
    if (!confirm(t('admin.orders.detail.confirm_delete_file'))) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/orders/${orderId}/documents/${filePath}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(t('admin.orders.detail.delete_file_error'));
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
        console.warn(t('admin.orders.detail.could_not_clear_db_url'));
      }

      setUploadedFiles([]);
      showSuccess(t('admin.orders.detail.file_deleted'), t('admin.orders.detail.invoice_deleted_success'));
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      showError(t('admin.orders.detail.delete_error_title'), t('admin.orders.detail.delete_error_message'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <OrdersDetailSkeleton />;
  }
  if (error || !order) {
    return <div className="text-red-600 text-center py-8">{error || t('admin.orders.detail.could_not_load_order')}</div>;
  }

  const shippingAddress = order.order_addresses.find(addr => addr.type === 'shipping');
  const payment = order.order_payments[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8 px-16">
      <div className="bg-white rounded-xl shadow-lg w-full p-0">
        <div className="text-center pt-8 pb-4">
          <h2 className="font-bold text-lg">{t('admin.orders.detail.title')}</h2>
        </div>
        <div className="px-8">
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="text-gray-500">{t('admin.orders.detail.purchase_id')}</div>
              <div className="text-gray-900 font-medium text-right">#{order.id.slice(0, 8).toUpperCase()}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="text-gray-500">{t('admin.orders.detail.date')}</div>
              <div className="text-gray-900 text-right">{formatDate(order.created_at)}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="text-gray-500">{t('admin.orders.detail.customer_id')}</div>
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
              <div className="text-gray-500">{t('admin.orders.detail.status')}</div>
              <div className="text-gray-900 text-right flex justify-end">
                <StatusChip
                  orderId={order.id}
                  currentStatus={order.status}
                  onStatusChange={refreshOrderData}
                />
              </div>
            </div>
            {/* Conditional display: Show delivery date for delivered orders, cancellation reason for cancelled orders */}
            {order.status === 'delivered' && (
              <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
                <div className="text-gray-500">{t('admin.orders.detail.delivery_date')}</div>
                <div className="text-gray-900 text-right">
                  {order.delivery_date ? (
                    <span className="text-green-700 font-medium">
                      {formatDateTime(order.delivery_date)}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>
            )}
            {order.status === 'cancelled' && (
              <>
                <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
                  <div className="text-gray-500">{t('admin.orders.detail.cancellation_date')}</div>
                  <div className="text-gray-900 text-right">
                    {order.cancellation_date ? (
                      <span className="text-red-700 font-medium">
                        {formatDateTime(order.cancellation_date)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
                  <div className="text-gray-500">{t('admin.orders.detail.cancellation_reason')}</div>
                  <div className="text-gray-900 text-right">
                    {order.cancellation_reason ? (
                      <span className="text-red-700 font-medium">
                        {order.cancellation_reason}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="text-gray-500">{t('admin.orders.detail.points')}</div>
              <div className="text-gray-900 text-right">-</div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="text-gray-500">{t('admin.orders.detail.total')}</div>
              <div className="text-gray-900 font-medium text-right">{formatCurrency(order.total_amount)}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 py-6">
              <div className="text-gray-500">{t('admin.orders.detail.payment_method')}</div>
              <div className="text-gray-900 text-right">{payment?.payment_method || '-'}</div>
            </div>
          </div>
        </div>
        <div className="mb-8 px-8">
          <h3 className="font-bold text-lg mb-4">{t('admin.orders.detail.purchased_products')}</h3>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">{t('admin.orders.detail.table.product_name')}</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">{t('admin.orders.detail.table.quantity')}</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">{t('admin.orders.detail.table.price')}</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">{t('admin.orders.detail.table.subtotal')}</th>
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
                  <td className="px-6 py-4 text-right font-bold" colSpan={3}>{t('admin.orders.detail.table.total')}</td>
                  <td className="px-6 py-4 text-gray-900 font-bold">
                    {formatCurrency(order.order_lines.reduce((acc, line) => acc + Number(line.unit_price) * line.quantity, 0).toString())}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div className="mb-8 px-8">
          <h3 className="font-bold text-lg mb-2">{t('admin.orders.detail.shipping_address')}</h3>
          <div className="text-gray-700">
            {shippingAddress
              ? `${shippingAddress.city}, ${shippingAddress.country} (${shippingAddress.address_line1}${shippingAddress.address_line2 ? ', ' + shippingAddress.address_line2 : ''})`
              : t('admin.orders.detail.not_specified')}
          </div>
        </div>
        <div className="mb-4 px-8">
          <h3 className="font-bold text-lg mb-4">{t('admin.orders.detail.invoice')}</h3>

          {/* Mostrar input solo si no hay factura cargada */}
          {uploadedFiles.length === 0 && (
            <div className="flex-1">
              <label className="block font-medium mb-2">{t('admin.orders.detail.upload_invoice')}</label>
              <div className="flex justify-between items-center gap-2 p-3 border rounded-xl bg-gray-50">
                <label className={`px-4 py-2 rounded cursor-pointer transition-colors ${
                  uploading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}>
                  {uploading ? t('admin.orders.detail.uploading') : t('admin.orders.detail.select_file')}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </label>
                <span className="text-gray-500 text-sm">
                  {uploading ? t('admin.orders.detail.uploading_file') : selectedFile ? selectedFile.name : t('admin.orders.detail.no_file_selected')}
                </span>
                {selectedFile && !uploading && (
                  <Button
                    onPress={handleFileUpload}
                    type="primary-admin"
                    text={t('admin.orders.detail.upload_file')}
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
            </div>
          )}

          {/* Mostrar factura cargada */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{file.name}</span>
                      <p className="text-xs text-gray-500">{t('admin.orders.detail.invoice_uploaded')}</p>
                    </div>
                  </div>
                                     <div className="flex items-center gap-2">
                     <a
                       href={file.url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                     >
                       {t('admin.orders.detail.view_file')}
                     </a>
                     <button
                       onClick={() => handleDeleteFile(file.path.split('/').pop() || '')}
                       disabled={deleting}
                       className={`text-sm font-medium transition-colors ${
                         deleting
                           ? 'text-gray-400 cursor-not-allowed'
                           : 'text-red-600 hover:text-red-800'
                       }`}
                     >
                       {deleting ? t('admin.orders.detail.deleting') : t('admin.orders.detail.delete')}
                     </button>
                     {deleting && (
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                     )}
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}