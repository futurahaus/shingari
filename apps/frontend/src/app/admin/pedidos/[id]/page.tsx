"use client";
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrdersDetailSkeleton } from '../components/OrdersDetailSkeleton';
import { StatusChip } from '../components/StatusChip';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { formatCurrency as formatCurrencyUtil } from '@/lib/currency';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { AddProductToOrderModal } from '@/components/orders/AddProductToOrderModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { QuantityInput } from '@/components/ui/QuantityInput';

interface OrderLine {
  id: string;
  product_id: number;
  product_name: string;
  product_sku?: string;
  product_iva?: number;
  product_stock?: number;
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
  user_internal_id?: string;
  user_is_business?: boolean;
  user_email?: string;
  user_name?: string;
  user_trade_name?: string;
  status: string;
  total_amount: string;
  currency: string;
  order_number?: string;
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

function computePriceBreakdown(
  orderLines: OrderLine[],
  totalAmount: number,
  userIsBusiness: boolean
): { subtotal: number; iva: number; total: number } {
  const DEFAULT_IVA = 21;
  let subtotal = 0;
  let ivaAmount = 0;

  if (userIsBusiness) {
    for (const line of orderLines) {
      const lineSubtotal = Number(line.unit_price) * line.quantity;
      const ivaPct = line.product_iva ?? DEFAULT_IVA;
      const lineIva = Math.round(lineSubtotal * (ivaPct / 100) * 100) / 100;
      subtotal += lineSubtotal;
      ivaAmount += lineIva;
    }
    subtotal = Math.round(subtotal * 100) / 100;
    ivaAmount = Math.round(ivaAmount * 100) / 100;
    return { subtotal, iva: ivaAmount, total: totalAmount };
  }

  for (const line of orderLines) {
    const lineTotal = Number(line.unit_price) * line.quantity;
    const ivaPct = line.product_iva ?? DEFAULT_IVA;
    const lineSubtotal = Math.round((lineTotal / (1 + ivaPct / 100)) * 100) / 100;
    const lineIva = Math.round((lineTotal - lineSubtotal) * 100) / 100;
    subtotal += lineSubtotal;
    ivaAmount += lineIva;
  }
  subtotal = Math.round(subtotal * 100) / 100;
  ivaAmount = Math.round(ivaAmount * 100) / 100;
  return { subtotal, iva: ivaAmount, total: totalAmount };
}

export default function AdminOrderDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { showSuccess, showError } = useNotificationContext();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; path: string; name: string }>>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [updatingLineId, setUpdatingLineId] = useState<string | null>(null);
  const [confirmRemoveLine, setConfirmRemoveLine] = useState<string | null>(null);
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<string | null>(null);
  const [confirmCancelOrder, setConfirmCancelOrder] = useState<string | null>(null);

  const isOrderEditable = order?.status === 'pending' || order?.status === 'accepted';

  const handleUpdateQuantity = async (lineId: string, newQuantity: number) => {
    if (!orderId || newQuantity < 1) return;
    setUpdatingLineId(lineId);
    setOrder((prev) =>
      prev
        ? {
            ...prev,
            order_lines: prev.order_lines.map((l) =>
              l.id === lineId ? { ...l, quantity: newQuantity } : l
            ),
          }
        : null
    );
    try {
      const updatedOrder = await api.patch<Order, { quantity: number }>(`/orders/${orderId}/lines/${lineId}`, { quantity: newQuantity });
      showSuccess(t('common.success'), t('order_edit.quantity_updated'));
      setOrder(updatedOrder);
    } catch {
      showError(t('common.error'), t('errors.unknown'));
      refreshOrderData();
    } finally {
      setUpdatingLineId(null);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;
    setUpdatingLineId(confirmCancelOrder);
    try {
      const now = new Date();
      await api.put(`/orders/${orderId}`, {
        status: 'cancelled',
        cancellation_reason: t('order_edit.cancel_order_reason'),
        cancellation_date: now.toISOString(),
      });
      showSuccess(t('common.success'), t('order_edit.order_cancelled'));
      router.push('/admin/pedidos');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      showError(t('common.error'), msg || t('errors.unknown'));
    } finally {
      setUpdatingLineId(null);
      setConfirmCancelOrder(null);
    }
  };

  const handleRemoveLine = async (lineId: string) => {
    if (!orderId) return;
    setUpdatingLineId(lineId);
    try {
      await api.delete(`/orders/${orderId}/lines/${lineId}`);
      showSuccess(t('common.success'), t('order_edit.product_removed'));
      refreshOrderData();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      showError(t('common.error'), msg || t('errors.unknown'));
    } finally {
      setUpdatingLineId(null);
      setConfirmRemoveLine(null);
    }
  };

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

  const handleFileUpload = async (file: File) => {
    if (!file || !orderId) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'invoice');

      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error(t('admin.orders.detail.auth_token_missing'));
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/orders/${orderId}/upload-document`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Intentar con fetch primero
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(t('admin.orders.detail.upload_error', { status: response.status, statusText: response.statusText, error: errorText }));
      }

      const result: DocumentUploadResponse = await response.json();

      // Reemplazar la factura existente o agregar una nueva
      setUploadedFiles([{
        url: result.url,
        path: result.path,
        name: file.name
      }]);

      setTimeout(() => {
        showSuccess(t('admin.upload.upload_complete'), t('admin.orders.detail.invoice_uploaded_success'));
      }, 500);

    } catch (error) {
      showError(t('admin.upload.upload_failed'), error instanceof Error ? error.message : t('admin.orders.detail.unknown_error'));
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };


  const handleDeleteFile = async (filePath: string) => {
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
        // Could not clear invoice URL from database
      }

      setUploadedFiles([]);
      showSuccess(t('admin.orders.detail.file_deleted'), t('admin.orders.detail.invoice_deleted_success'));
    } catch {
      showError(t('admin.orders.detail.delete_error_title'), t('admin.orders.detail.delete_error_message'));
    } finally {
      setDeleting(false);
      setConfirmDeleteFile(null);
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
            {order.order_number && (
              <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
                <div className="text-gray-500">{t('admin.orders.detail.order_number')}</div>
                <div className="text-gray-900 font-medium text-right">#{order.order_number}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="text-gray-500">{t('admin.orders.detail.date')}</div>
              <div className="text-gray-900 text-right">{formatDate(order.created_at)}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 py-6 border-b border-gray-200">
              <div className="text-gray-500">{t('admin.orders.detail.customer_id')}</div>
              <div className="text-gray-900 font-medium text-right">
                {order.user_internal_id?.trim() ? (
                  order.user_id ? (
                    <Link href={`/admin/usuarios/${order.user_id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                      #{order.user_internal_id}
                    </Link>
                  ) : (
                    <>#{order.user_internal_id}</>
                  )
                ) : (
                  <span className="text-gray-500">{t('admin.orders.detail.no_internal_id')}</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="font-bold text-lg">{t('admin.orders.detail.purchased_products')}</h3>
            {isOrderEditable && (
              <button
                type="button"
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2 bg-[#EA3D15] text-white rounded-lg text-sm font-medium hover:bg-[#d43e0e] transition-colors"
              >
                {t('order_edit.add_product')}
              </button>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">{t('admin.orders.detail.table.product_name')}</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">{t('admin.orders.detail.table.sku')}</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">{t('admin.orders.detail.table.quantity')}</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">{t('admin.orders.detail.table.price')}</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">{t('admin.orders.detail.table.subtotal')}</th>
                  {isOrderEditable && (
                    <th className="px-6 py-3 text-left font-medium text-gray-500">{t('common.edit')}</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white">
                {order.order_lines.map((line) => (
                  <tr key={line.id} className="border-t border-gray-100">
                    <td className="px-6 py-4 text-gray-900">{line.product_name}</td>
                    <td className="px-6 py-4 text-gray-900">{line.product_sku || '-'}</td>
                    <td className="px-6 py-4 text-gray-900">
                      {isOrderEditable ? (
                        <div className="flex items-center gap-2">
                          <QuantityInput
                            value={line.quantity}
                            onChange={(q) => handleUpdateQuantity(line.id, q)}
                            min={1}
                            max={line.product_stock != null && line.product_stock > 0 ? line.product_stock : undefined}
                            disabled={updatingLineId === line.id}
                            stockHint={line.product_stock != null ? t('order_edit.stock_available', { count: line.product_stock }) : undefined}
                          />
                        </div>
                      ) : (
                        line.quantity
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(line.unit_price)}</td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency((Number(line.unit_price) * line.quantity).toString())}</td>
                    {isOrderEditable && (
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          disabled={updatingLineId === line.id}
                          onClick={() =>
                            order.order_lines.length === 1
                              ? setConfirmCancelOrder(line.id)
                              : setConfirmRemoveLine(line.id)
                          }
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('order_edit.remove_product')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td className="px-6 py-4 text-right font-bold" colSpan={isOrderEditable ? 5 : 4}>{t('admin.orders.detail.table.total')}</td>
                  <td className="px-6 py-4 text-gray-900 font-bold">
                    {formatCurrency(order.order_lines.reduce((acc, line) => acc + Number(line.unit_price) * line.quantity, 0).toString())}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <AddProductToOrderModal
            orderId={orderId}
            isOpen={showAddProductModal}
            onClose={() => setShowAddProductModal(false)}
            onSuccess={refreshOrderData}
            isAdmin
          />
          {order.order_lines.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">{t('admin.orders.detail.price_breakdown')}</h4>
              {(() => {
                const breakdown = computePriceBreakdown(
                  order.order_lines,
                  Number(order.total_amount),
                  order.user_is_business ?? false
                );
                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('admin.orders.detail.subtotal_without_iva')}</span>
                      <span className="text-gray-900 font-medium">{formatCurrency(breakdown.subtotal.toString())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('admin.orders.detail.total_iva')}</span>
                      <span className="text-gray-900 font-medium">{formatCurrency(breakdown.iva.toString())}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-900 font-bold">{t('admin.orders.detail.table.total')}</span>
                      <span className="text-gray-900 font-bold">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
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

          {/* Mostrar FileDropzone solo si no hay factura cargada */}
          {uploadedFiles.length === 0 && (
            <div className="space-y-2">
              <label className="block font-medium text-sm text-gray-700">{t('admin.orders.detail.upload_invoice')}</label>
              <FileDropzone
                onFileSelect={handleFileUpload}
                acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx']}
                maxSize={10}
                disabled={uploading}
                isUploading={uploading}
                uploadProgress={uploadProgress}
                className="w-full"
              />
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
                       className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                       title={t('admin.orders.detail.view_file')}
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                       </svg>
                     </a>
                     <button
                       onClick={() => setConfirmDeleteFile(file.path.split('/').pop() || '')}
                       disabled={deleting}
                       className={`p-2 rounded-lg transition-colors cursor-pointer ${
                         deleting
                           ? 'text-gray-400 cursor-not-allowed'
                           : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                       }`}
                       title={deleting ? t('admin.orders.detail.deleting') : t('admin.orders.detail.delete')}
                     >
                       {deleting ? (
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                       ) : (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                       )}
                     </button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmRemoveLine}
        onClose={() => setConfirmRemoveLine(null)}
        onConfirm={async () => { if (confirmRemoveLine) await handleRemoveLine(confirmRemoveLine); }}
        title={t('order_edit.remove_product')}
        message={t('order_edit.confirm_remove')}
        confirmLabel={t('common.delete')}
        variant="danger"
        confirmLoading={updatingLineId === confirmRemoveLine}
      />
      <ConfirmModal
        isOpen={!!confirmDeleteFile}
        onClose={() => setConfirmDeleteFile(null)}
        onConfirm={async () => { if (confirmDeleteFile) await handleDeleteFile(confirmDeleteFile); }}
        title={t('admin.orders.detail.delete')}
        message={t('admin.orders.detail.confirm_delete_file')}
        confirmLabel={t('common.delete')}
        variant="danger"
        confirmLoading={deleting}
      />
      <ConfirmModal
        isOpen={!!confirmCancelOrder}
        onClose={() => setConfirmCancelOrder(null)}
        onConfirm={handleCancelOrder}
        title={t('order_edit.last_product_warning')}
        message={t('order_edit.cancel_order_confirm')}
        confirmLabel={t('common.confirm')}
        variant="danger"
        confirmLoading={updatingLineId === confirmCancelOrder}
      />
    </div>
  );
}