"use client";
import React, { useState, useRef } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { EditionModal } from './components/EditionModal';
import { CreationModal } from './components/CreationModal';
import { DeleteModal } from './components/DeleteModal';
import { AdminProductRow } from './components/AdminProductRow';
import { ProductsListSkeleton } from './components/ProductsListSkeleton';
import { Button } from '@/app/ui/components/Button';
import { Product } from './interfaces/product.interfaces';
import { useAdminProducts } from './hooks/useAdminProducts.hook';

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const { showSuccess, showError } = useNotificationContext();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Ref para el observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useRef<HTMLLIElement | null>(null);

  // Usar el hook para obtener productos
  const {
    products,
    loading,
    error,
    currentPage,
    lastPage,
    refetch
  } = useAdminProducts({ page });

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleProductUpdated = () => {
    refetch();
  };

  const handleProductCreated = () => {
    refetch();
  };

  const handleProductDeleted = () => {
    refetch();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage !== page && newPage > 0 && newPage <= lastPage) {
      setPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Administrar Productos</h1>
          <Button
            onPress={() => setShowCreateModal(true)}
            type="primary-admin"
            text="Nuevo Producto"
            testID="create-product-button"
            icon="FaPlus"
            inline
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <ProductsListSkeleton rowsCount={20} />
        ) : products && products.length > 0 ? (
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
              <Button
                onPress={() => handlePageChange(page - 1)}
                type="secondary"
                text="Anterior"
                testID="prev-page-button"
                inline
                textProps={{
                  size: 'sm',
                  weight: 'medium',
                  color: page === 1 ? 'gray-400' : 'secondary-main'
                }}
              />
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  onPress={() => handlePageChange(p)}
                  type={p === page ? 'primary' : 'secondary'}
                  text={p.toString()}
                  testID={`page-${p}-button`}
                  inline
                  textProps={{
                    size: 'sm',
                    weight: 'medium',
                    color: p === page ? 'primary-contrast' : 'secondary-main'
                  }}
                />
              ))}
              <Button
                onPress={() => handlePageChange(page + 1)}
                type="secondary"
                text="Siguiente"
                testID="next-page-button"
                inline
                textProps={{
                  size: 'sm',
                  weight: 'medium',
                  color: page === lastPage ? 'gray-400' : 'secondary-main'
                }}
              />
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
              <Button
                onPress={() => setShowCreateModal(true)}
                type="primary-admin"
                text="Nuevo Producto"
                testID="create-product-empty-button"
                icon="FaPlus"
                inline
              />
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