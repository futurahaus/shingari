"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';
import Image from 'next/image';
import { EditionModal } from './components/EditionModal';
import { CreationModal } from './components/CreationModal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  categories: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
  wholesale_price?: number;
  status?: string;
  unit_id?: number;
  unit_name?: string;
}

interface PaginatedProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

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

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await api.delete(`/products/${selectedProduct.id}`);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      await fetchProducts(1);
      showSuccess('Producto Eliminado', 'El producto se ha eliminado exitosamente');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError('Error al Eliminar', 'Error al eliminar producto: ' + (err.message || 'Error desconocido'));
      } else {
        showError('Error al Eliminar', 'Error al eliminar producto: Error desconocido');
      }
    }
  };

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
                <li
                  key={product.id}
                  className="px-6 py-4"
                  ref={index === products.length - 1 ? lastProductRef : null}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.images[0]}
                            alt={product.name}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-medium text-green-600">${product.price}</span>
                          {product.wholesale_price !== undefined && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Mayorista: ${product.wholesale_price}
                            </span>
                          )}
                          {product.status && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Estado: {product.status}
                            </span>
                          )}
                          {product.unit_name && (
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              Unidad: {product.unit_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-3 rounded-lg text-sm transition duration-200 cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-3 rounded-lg text-sm transition duration-200 cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
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
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">Eliminar Producto</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    ¿Estás seguro de que quieres eliminar el producto &quot;{selectedProduct.name}&quot;? Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-6">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}