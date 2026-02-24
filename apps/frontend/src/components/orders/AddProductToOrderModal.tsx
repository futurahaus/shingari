'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/contexts/I18nContext';
import { api } from '@/lib/api';
import { useLocalizedAPI } from '@/hooks/useLocalizedAPI';

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
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
          : '/products?limit=200';
        const response = await (isAdmin ? api : localizedAPI).get<PaginatedResponse>(url);
        const data = response?.data ?? [];
        setProducts(Array.isArray(data) ? data : []);
        setFilteredProducts(Array.isArray(data) ? data : []);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = async () => {
    if (!selectedProduct || quantity < 1) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/orders/${orderId}/lines`, {
        product_id: Number(selectedProduct.id),
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('order_edit.add_product')}
          </h3>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div ref={searchRef} className="relative mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={t('order_edit.search_products')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA3D15] focus:border-transparent"
            />
            {filteredProducts.length > 0 && showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredProducts.slice(0, 10).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedProduct(p);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                      {p.images?.[0] ? (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      {p.sku && (
                        <p className="text-xs text-gray-500">SKU: {p.sku}</p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {typeof p.price === 'number' ? `€${p.price.toFixed(2)}` : p.price}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedProduct && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                  {selectedProduct.sku && (
                    <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  {t('common.cancel')}
                </button>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  {t('order_details.quantity')}:
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          {loading && (
            <p className="text-sm text-gray-500">{t('common.loading')}</p>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedProduct || quantity < 1 || submitting}
            className="px-4 py-2 bg-[#EA3D15] text-white rounded-lg hover:bg-[#d43e0e] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('common.loading') : t('order_edit.add_product')}
          </button>
        </div>
      </div>
    </div>
  );
}
