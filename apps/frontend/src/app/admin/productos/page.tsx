"use client";
import React, { useState, useRef, useCallback } from 'react';
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
  const [searchQuery, setSearchQuery] = useState(''); // Estado para la búsqueda real

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const lastProductRef = useRef<HTMLTableRowElement | null>(null);

  const [sortField, setSortField] = useState<'created_at' | 'updated_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Usar el hook para obtener productos con searchQuery (no searchTerm)
  const {
    products,
    loading,
    error,
    lastPage,
    refetch
  } = useAdminProducts({ page, limit: 10, search: searchQuery, sortField, sortDirection });

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

  // Función para manejar cambios en el input (solo actualiza el estado local)
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Función para ejecutar la búsqueda (cuando se quita el foco o se presiona Enter)
  const handleSearchSubmit = useCallback(() => {
    setSearchQuery(searchTerm);
    setPage(1); // Resetear a la primera página cuando se busca
  }, [searchTerm]);

  // Función para manejar el evento de presionar Enter
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  }, [handleSearchSubmit]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="">
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

          {/* Buscador y Ordenador */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative max-w-md flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por SKU, nombre o ID..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onBlur={handleSearchSubmit}
                onKeyPress={handleKeyPress}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
            <div className="flex gap-2 items-center">
              <label htmlFor="sortField" className="text-sm text-gray-600">Ordenar por:</label>
              <select
                id="sortField"
                value={sortField}
                onChange={e => setSortField(e.target.value as 'created_at' | 'updated_at')}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
              >
                <option value="created_at">Más recientes</option>
                <option value="updated_at">Última actualización</option>
              </select>
              <select
                id="sortDirection"
                value={sortDirection}
                onChange={e => setSortDirection(e.target.value as 'asc' | 'desc')}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <ProductsListSkeleton rowsCount={10} />
        ) : products && products.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unidades por Caja
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Minorista
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Mayorista
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio con IVA Minorista
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio con IVA Mayorista
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IVA (%)
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
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
                </tbody>
              </table>
            </div>
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
              {searchQuery ? 'No se encontraron productos' : 'No hay productos'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando tu primer producto.'}
            </p>
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