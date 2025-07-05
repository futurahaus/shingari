"use client";
import React, { useState, useRef, useCallback } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { EditionModal } from './components/EditionModal';
import { CreationModal } from './components/CreationModal';
import { DeleteModal } from './components/DeleteModal';
import { AdminProductRow } from './components/AdminProductRow';
import { ProductsListSkeleton } from './components/ProductsListSkeleton';
import { Button } from '@/app/ui/components/Button';
import { Product } from './interfaces/product.interfaces';
import { useAdminProducts } from './hooks/useAdminProducts.hook';
import { Text } from '@/app/ui/components/Text';
import { FaSearch } from 'react-icons/fa';

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
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
  } = useAdminProducts({ page, search: searchTerm });

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

  // Función para manejar la búsqueda con debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1); // Resetear a la primera página cuando se busca
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <Text
              size="3xl"
              weight="bold"
              color="gray-900"
              as="h1"
            >
              Control de Stock
            </Text>
            <Button
              onPress={() => setShowCreateModal(true)}
              type="primary-admin"
              text="Nuevo Producto"
              testID="create-product-button"
              icon="FaPlus"
              inline
            />
          </div>
          <Text
            size="sm"
            weight="normal"
            color="gray-500"
            as="p"
            className="mb-4"
          >
            Gestiona control de mercadería
          </Text>
          
          {/* Buscador */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por SKU, nombre o ID..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando tu primer producto.'}
            </p>
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