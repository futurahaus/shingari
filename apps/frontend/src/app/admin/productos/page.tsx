"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';
import Image from 'next/image';
import { EditionModal } from './components/EditionModal';
import { CreationModal } from './components/CreationModal';
import { DeleteModal } from './components/DeleteModal';
import { AdminProductRow } from './components/AdminProductRow';
import { Product, PaginatedProductsResponse } from './interfaces/product.interfaces';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Use the global notification context
  const { showSuccess, showError } = useNotificationContext();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Ref para el observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useRef<HTMLLIElement | null>(null);

  const fetchProducts = useCallback(async (pageNumber: number) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: pageNumber.toString(),
        limit: '20',
      });
      const response = await api.get<PaginatedProductsResponse>(`/products/admin/all?${params.toString()}`);
      setProducts(response.data);
      setPage(response.page);
      setLastPage(response.lastPage);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError('Error al cargar productos: ' + errorMsg);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleProductUpdated = () => {
    fetchProducts(1);
  };

  const handleProductCreated = () => {
    fetchProducts(1);
  };

  const handleProductDeleted = () => {
    fetchProducts(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage !== page && newPage > 0 && newPage <= lastPage) {
      setPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Administrar Productos</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Producto
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {products && products.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {products.map((product, index) => (
                <AdminProductRow
                  key={product.id}
                  product={product}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  isLast={index === products.length - 1}
                  lastProductRef={lastProductRef}
                />
              ))}
            </ul>
            {/* Paginador */}
            <div className="flex justify-center items-center gap-2 py-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Anterior
              </button>
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1 rounded border ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                  disabled={p === page}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === lastPage}
                className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer producto.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Producto
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      <CreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProductCreated={handleProductCreated}
      />

      {/* Edit Product Modal */}
      <EditionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />

      {/* Delete Product Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onProductDeleted={handleProductDeleted}
      />
    </div>
  );
}