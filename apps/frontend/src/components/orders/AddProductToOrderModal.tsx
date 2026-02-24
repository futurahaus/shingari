'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/contexts/I18nContext';
import { api } from '@/lib/api';
import { useLocalizedAPI } from '@/hooks/useLocalizedAPI';
import { formatCurrency } from '@/lib/currency';

interface Product {
  id: number | string;
  name: string;
  price: number;
  sku?: string;
  images?: string[];
}

interface PaginatedResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

interface AddProductToOrderModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isAdmin?: boolean;
}

export function AddProductToOrderModal({
  orderId,
  isOpen,
  onClose,
  onSuccess,
  isAdmin = false,
}: AddProductToOrderModalProps) {
  const { t } = useTranslation();
  const localizedAPI = useLocalizedAPI();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSearchTerm('');
    setSelectedProduct(null);
    setQuantity(1);
    setError(null);
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = isAdmin
          ? '/products/admin/all?limit=500&status=active'
          : '/products?limit=500';
        const response = await (isAdmin ? api : localizedAPI).get<PaginatedResponse>(url);
        const data = response?.data ?? [];
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
        setFilteredProducts(list);
      } catch {
        setError(t('errors.unknown'));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [isOpen, isAdmin, t, localizedAPI]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          (p.sku && String(p.sku).toLowerCase().includes(term))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleAdd = async (product?: Product) => {
    const target = product ?? selectedProduct;
    if (!target || quantity < 1) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/orders/${orderId}/lines`, {
        product_id: Number(target.id),
        quantity,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || t('errors.unknown'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectProduct = (p: Product) => {
    if (selectedProduct?.id === p.id) {
      setSelectedProduct(null);
      setQuantity(1);
    } else {
      setSelectedProduct(p);
      setQuantity(1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('order_edit.add_product')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t('common.close')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('order_edit.search_products')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA3D15] focus:border-transparent"
            />
          </div>
          {!loading && (
            <p className="mt-2 text-xs text-gray-500">
              {t('order_edit.showing_products', { count: filteredProducts.length })}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t('order_edit.no_products_found')}</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                const priceStr = typeof p.price === 'number' ? formatCurrency(p.price) : String(p.price);
                return (
                  <div
                    key={p.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-[#EA3D15]/5 border-l-4 border-l-[#EA3D15]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {p.images?.[0] ? (
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{p.name}</p>
                        {p.sku && (
                          <p className="text-sm text-gray-500">SKU: {p.sku}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-900">
                        {priceStr}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                      {isSelected ? (
                        <>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              type="button"
                              disabled={quantity <= 1 || submitting}
                              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                              className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                            >
                              -
                            </button>
                            <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() => setQuantity((q) => q + 1)}
                              className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-r-lg"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAdd(p)}
                            disabled={submitting}
                            className="px-4 py-2 bg-[#EA3D15] text-white rounded-lg text-sm font-medium hover:bg-[#d43e0e] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? t('common.loading') : t('order_edit.add_product')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectProduct(p)}
                            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                          >
                            {t('common.cancel')}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectProduct(p)}
                          disabled={submitting}
                          className="px-4 py-2 border border-[#EA3D15] text-[#EA3D15] rounded-lg text-sm font-medium hover:bg-[#EA3D15]/5 disabled:opacity-50"
                        >
                          {t('order_edit.select_product')}
                        </button>
                      )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {t('common.cancel')}
          </button>
          {selectedProduct && (
            <button
              type="button"
              onClick={() => handleAdd()}
              disabled={quantity < 1 || submitting}
              className="px-4 py-2 bg-[#EA3D15] text-white rounded-lg hover:bg-[#d43e0e] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t('common.loading') : t('order_edit.add_product')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
