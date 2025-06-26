"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';
import Image from 'next/image';

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

interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock?: number;
  categoryIds: string[];
  wholesale_price?: number;
  status?: string;
  images?: string[];
  unit_id?: number;
}

interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryIds?: string[];
  wholesale_price?: number;
  status?: string;
  images?: string[];
  unit_id?: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the global notification context
  const { showSuccess, showError } = useNotificationContext();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateProductData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryIds: [],
  });
  const [editForm, setEditForm] = useState<UpdateProductData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryIds: [],
  });

  // Available categories (you might want to fetch this from the API)
  const availableCategories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Food'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products/admin/all');
      const productsData = Array.isArray(response) ? response : [];
      setProducts(productsData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError('Error al cargar productos: ' + errorMsg);
      setProducts([]);
      // Optionally log error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      // Only include unit_id if valid
      const payload = { ...createForm };
      if (!payload.unit_id || isNaN(Number(payload.unit_id))) {
        delete payload.unit_id;
      }

      await api.post('/products', payload as unknown as Record<string, unknown>);
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        categoryIds: [],
      });
      await fetchProducts();
      showSuccess('Producto Creado', 'El producto se ha creado exitosamente');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError('Error al Crear', 'Error al crear producto: ' + (err.message || 'Error desconocido'));
      } else {
        showError('Error al Crear', 'Error al crear producto: Error desconocido');
      }
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;

    try {
      // Only include unit_id if valid
      const payload = { ...editForm };
      if (!payload.unit_id || isNaN(Number(payload.unit_id))) {
        delete payload.unit_id;
      }
      console.log('Payload for update:', payload);
      await api.put(`/products/${selectedProduct.id}`, payload as unknown as Record<string, unknown>);
      setShowEditModal(false);
      setSelectedProduct(null);
      setEditForm({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        categoryIds: [],
      });
      await fetchProducts();
      showSuccess('Producto Actualizado', 'El producto se ha actualizado exitosamente');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError('Error al Actualizar', 'Error al actualizar producto: ' + (err.message || 'Error desconocido'));
      } else {
        showError('Error al Actualizar', 'Error al actualizar producto: Error desconocido');
      }
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await api.delete(`/products/${selectedProduct.id}`);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      await fetchProducts();
      showSuccess('Producto Eliminado', 'El producto se ha eliminado exitosamente');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError('Error al Eliminar', 'Error al eliminar producto: ' + (err.message || 'Error desconocido'));
      } else {
        showError('Error al Eliminar', 'Error al eliminar producto: Error desconocido');
      }
    }
  };

  // 2. Fetch discounts when opening the edit modal
  const openEditModal = async (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? 0,
      stock: 0, // TODO: fetch actual stock if available
      categoryIds: product.categories || [],
      wholesale_price: product.wholesale_price ?? undefined,
      status: product.status ?? 'active',
      images: product.images || [],
      unit_id: product.unit_id ?? undefined,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
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
              {products.map((product) => (
                <li key={product.id} className="px-6 py-4">
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
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-center text-gray-900 mb-4">Agregar nuevo producto</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de Producto</label>
                    <input
                      type="text"
                      placeholder="Nombre de Producto"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                    <input
                      type="text"
                      placeholder="Descripción de Producto"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
                {/* Right Column */}
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={createForm.stock}
                        onChange={(e) => setCreateForm({...createForm, stock: parseInt(e.target.value) || 0})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Precio de Lista</label>
                      <input
                        type="number"
                        placeholder="$1234"
                        value={createForm.price}
                        onChange={(e) => setCreateForm({...createForm, price: parseFloat(e.target.value) || 0})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Precio Mayorista</label>
                      <input
                        type="number"
                        placeholder="$123"
                        value={createForm.wholesale_price || ''}
                        onChange={e => setCreateForm({ ...createForm, wholesale_price: parseFloat(e.target.value) || 0 })}
                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                    <select
                      value={createForm.categoryIds[0] || ''}
                      onChange={e => setCreateForm({ ...createForm, categoryIds: [e.target.value] })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Seleccionar categoría</option>
                      {availableCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Buttons */}
                <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 border border-black rounded-full text-black bg-white hover:bg-gray-100 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateProduct}
                    className="px-6 py-2 rounded-full text-white bg-black hover:bg-gray-900 font-semibold cursor-pointer"
                  >
                    Subir Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-center text-gray-900 mb-4">Editar producto</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de Producto</label>
                    <input
                      type="text"
                      placeholder="Nombre de Producto"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                    <input
                      type="text"
                      placeholder="Descripción de Producto"
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
                {/* Right Column */}
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={editForm.stock}
                        onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value) || 0})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Precio de Lista</label>
                      <input
                        type="number"
                        placeholder="$1234"
                        value={editForm.price}
                        onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Precio Mayorista</label>
                      <input
                        type="number"
                        placeholder="$123"
                        value={editForm.wholesale_price || ''}
                        onChange={e => setEditForm({ ...editForm, wholesale_price: parseFloat(e.target.value) || 0 })}
                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                    <select
                      value={editForm.categoryIds && editForm.categoryIds[0] ? editForm.categoryIds[0] : ''}
                      onChange={e => setEditForm({ ...editForm, categoryIds: [e.target.value] })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Seleccionar categoría</option>
                      {availableCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Buttons */}
                <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 border border-black rounded-full text-black bg-white hover:bg-gray-100 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleEditProduct}
                    className="px-6 py-2 rounded-full text-white bg-black hover:bg-gray-900 font-semibold cursor-pointer"
                  >
                    Subir Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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