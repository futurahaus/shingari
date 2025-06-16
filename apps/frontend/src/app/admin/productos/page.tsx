"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';

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
  sku?: string;
}

interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock?: number;
  categoryIds: string[];
}

interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryIds?: string[];
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
      const response = await api.get('/products/admin/all', { requireAuth: true });
      console.log('API Response:', response);
      const productsData = Array.isArray(response) ? response : [];
      console.log('Products data to set:', productsData);
      setProducts(productsData);
    } catch (err: any) {
      setError('Error al cargar productos: ' + (err.message || 'Error desconocido'));
      setProducts([]);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      await api.post('/products', createForm as unknown as Record<string, unknown>, { requireAuth: true });
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
    } catch (err: any) {
      showError('Error al Crear', 'Error al crear producto: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;

    try {
      await api.put(`/products/${selectedProduct.id}`, editForm as unknown as Record<string, unknown>, { requireAuth: true });
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
    } catch (err: any) {
      showError('Error al Actualizar', 'Error al actualizar producto: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await api.delete(`/products/${selectedProduct.id}`, { requireAuth: true });
      setShowDeleteModal(false);
      setSelectedProduct(null);
      await fetchProducts();
      showSuccess('Producto Eliminado', 'El producto se ha eliminado exitosamente');
    } catch (err: any) {
      showError('Error al Eliminar', 'Error al eliminar producto: ' + (err.message || 'Error desconocido'));
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: 0, // You might want to add stock to your Product interface
      categoryIds: product.categories,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleCategoryChange = (category: string, checked: boolean, formType: 'create' | 'edit') => {
    if (formType === 'create') {
      setCreateForm(prev => ({
        ...prev,
        categoryIds: checked
          ? [...prev.categoryIds, category]
          : prev.categoryIds.filter(c => c !== category)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        categoryIds: checked
          ? [...(prev.categoryIds || []), category]
          : (prev.categoryIds || []).filter(c => c !== category)
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
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
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.images[0]}
                            alt={product.name}
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
                          {product.sku && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              SKU: {product.sku}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-3 rounded-lg text-sm transition duration-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-3 rounded-lg text-sm transition duration-200"
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
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Producto</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.price}
                    onChange={(e) => setCreateForm({...createForm, price: parseFloat(e.target.value) || 0})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    value={createForm.stock}
                    onChange={(e) => setCreateForm({...createForm, stock: parseInt(e.target.value) || 0})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categorías</label>
                  <div className="mt-2 space-y-2">
                    {availableCategories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={createForm.categoryIds.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCreateForm({
                                ...createForm,
                                categoryIds: [...createForm.categoryIds, category]
                              });
                            } else {
                              setCreateForm({
                                ...createForm,
                                categoryIds: createForm.categoryIds.filter(c => c !== category)
                              });
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateProduct}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Producto</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value) || 0})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categorías</label>
                  <div className="mt-2 space-y-2">
                    {availableCategories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editForm.categoryIds?.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditForm({
                                ...editForm,
                                categoryIds: [...(editForm.categoryIds || []), category]
                              });
                            } else {
                              setEditForm({
                                ...editForm,
                                categoryIds: editForm.categoryIds?.filter(c => c !== category) || []
                              });
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditProduct}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Actualizar
                </button>
              </div>
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
                    ¿Estás seguro de que quieres eliminar el producto "{selectedProduct.name}"? Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-6">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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