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

type Discount = {
  id: number;
  price: number;
  is_active: boolean;
  valid_from?: string;
  valid_to?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

  // 2. Add state for units and status options
  const [availableUnits, setAvailableUnits] = useState<{id: number, name: string}[]>([]);
  const statusOptions = [
    { value: 'active', label: 'Activo' },
    { value: 'draft', label: 'Borrador' },
    { value: 'paused', label: 'Pausado' },
    { value: 'deleted', label: 'Eliminado' },
  ];

  // 1. Add state for discounts in the edit modal
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState<boolean>(false);
  const [newDiscount, setNewDiscount] = useState<{ price: string; is_active: boolean; valid_from: string; valid_to: string }>({ price: '', is_active: true, valid_from: '', valid_to: '' });
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchUnits();
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
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError('Error al cargar productos: ' + errorMsg);
      setProducts([]);
      // Optionally log error
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      // You may need to create this endpoint in your backend
      const units = await api.get<{ id: number; name: string }[]>('/units', { requireAuth: true });
      setAvailableUnits(units);
    } catch {
      setAvailableUnits([]);
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
      await api.delete(`/products/${selectedProduct.id}`, { requireAuth: true });
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
    setLoadingDiscounts(true);
    try {
      const res = await api.get<Discount[]>(`/products/${product.id}/discounts`, { requireAuth: true });
      setDiscounts(res);
    } catch {
      setDiscounts([]);
    } finally {
      setLoadingDiscounts(false);
    }
  };

  // 3. Add handlers for create, update, delete discount
  const handleCreateDiscount = async () => {
    try {
      const res = await api.post<Discount, typeof newDiscount>(`/products/${selectedProduct?.id}/discounts`, newDiscount, { requireAuth: true });
      setDiscounts((prev) => [res, ...prev]);
      setNewDiscount({ price: '', is_active: true, valid_from: '', valid_to: '' });
    } catch {}
  };
  const handleUpdateDiscount = async () => {
    if (!editingDiscount) return;
    try {
      const res = await api.put<Discount, typeof editingDiscount>(`/products/discounts/${editingDiscount.id}`, editingDiscount, { requireAuth: true });
      setDiscounts((prev) => prev.map((d) => d.id === res.id ? res : d));
      setEditingDiscount(null);
    } catch {}
  };
  const handleDeleteDiscount = async (id: string | number) => {
    try {
      await api.delete(`/products/discounts/${id}`, { requireAuth: true });
      setDiscounts((prev) => prev.filter((d) => d.id !== Number(id)));
    } catch {}
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // 4. Add image upload handler (simulate upload, just use URL for now)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, formType: 'create' | 'edit') => {
    const files = e.target.files;
    if (!files) return;
    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        // Get access token for Authorization header
        const accessToken = localStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE_URL}/products/upload-image`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : '',
          },
        });
        if (!res.ok) throw new Error('Error uploading image');
        const data = await res.json();
        if (data.url) uploadedUrls.push(data.url);
      } catch {
        // Optionally show error notification
      }
    }
    if (formType === 'create') {
      setCreateForm(prev => ({ ...prev, images: [...(prev.images || []), ...uploadedUrls] }));
    } else {
      setEditForm(prev => ({ ...prev, images: [...(prev.images || []), ...uploadedUrls] }));
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={createForm.status || 'active'}
                    onChange={e => setCreateForm({ ...createForm, status: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unidad</label>
                  <select
                    value={createForm.unit_id || ''}
                    onChange={e => setCreateForm({ ...createForm, unit_id: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar unidad</option>
                    {availableUnits.map(unit => (
                      <option key={unit.id} value={String(unit.id)}>{unit.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Imágenes</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => handleImageUpload(e, 'create')}
                    className="mt-1 block w-full"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(createForm.images || []).map((img, idx) => (
                      <img key={idx} src={img} alt="preview" className="h-12 w-12 object-cover rounded" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateProduct}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
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
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
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
                          checked={editForm.categoryIds?.map(String).includes(String(category))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditForm({
                                ...editForm,
                                categoryIds: [...(editForm.categoryIds || []), category]
                              });
                            } else {
                              setEditForm({
                                ...editForm,
                                categoryIds: (editForm.categoryIds || []).filter(c => String(c) !== String(category))
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={editForm.status || 'active'}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unidad</label>
                  <select
                    value={editForm.unit_id ? String(editForm.unit_id) : ''}
                    onChange={e => setEditForm({ ...editForm, unit_id: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar unidad</option>
                    {availableUnits.map(unit => (
                      <option key={unit.id} value={String(unit.id)}>{unit.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Imágenes</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => handleImageUpload(e, 'edit')}
                    className="mt-1 block w-full"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(editForm.images || []).map((img, idx) => (
                      <img key={idx} src={img} alt="preview" className="h-12 w-12 object-cover rounded" />
                    ))}
                  </div>
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
                  <label className="block text-sm font-medium text-gray-700">Precio Mayorista</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.wholesale_price || ''}
                    onChange={e => setEditForm({ ...editForm, wholesale_price: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Descuentos Section */}
                <div className="mt-8">
                  <h4 className="text-md font-semibold mb-2">Descuentos</h4>
                  {loadingDiscounts ? (
                    <div>Cargando descuentos...</div>
                  ) : (
                    <>
                      <ul className="mb-4">
                        {discounts.map(discount => (
                          <li key={discount.id} className="flex items-center gap-2 mb-2">
                            <span className="text-sm">Precio: ${discount.price} | Activo: {discount.is_active ? 'Sí' : 'No'} | Desde: {discount.valid_from ? discount.valid_from.split('T')[0] : '-'} | Hasta: {discount.valid_to ? discount.valid_to.split('T')[0] : '-'}</span>
                            <button onClick={() => setEditingDiscount(discount)} className="text-blue-600 text-xs">Editar</button>
                            <button onClick={() => handleDeleteDiscount(String(discount.id))} className="text-red-600 text-xs">Eliminar</button>
                          </li>
                        ))}
                      </ul>
                      {/* New Discount Form */}
                      <div className="mb-4 p-2 border rounded">
                        <div className="flex flex-col gap-2">
                          <input type="number" placeholder="Precio" value={newDiscount.price} onChange={e => setNewDiscount(nd => ({ ...nd, price: e.target.value }))} className="border rounded px-2 py-1" />
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={newDiscount.is_active} onChange={e => setNewDiscount(nd => ({ ...nd, is_active: e.target.checked }))} /> Activo
                          </label>
                          <input type="date" value={newDiscount.valid_from} onChange={e => setNewDiscount(nd => ({ ...nd, valid_from: e.target.value }))} className="border rounded px-2 py-1" />
                          <input type="date" value={newDiscount.valid_to} onChange={e => setNewDiscount(nd => ({ ...nd, valid_to: e.target.value }))} className="border rounded px-2 py-1" />
                          <button onClick={handleCreateDiscount} className="bg-green-600 text-white rounded px-3 py-1 mt-2">Agregar Descuento</button>
                        </div>
                      </div>
                      {/* Edit Discount Form */}
                      {editingDiscount && (
                        <div className="mb-4 p-2 border rounded bg-gray-50">
                          <div className="flex flex-col gap-2">
                            <input type="number" placeholder="Precio" value={editingDiscount.price} onChange={e => setEditingDiscount(ed => ed ? { ...ed, price: Number(e.target.value) } : ed)} className="border rounded px-2 py-1" />
                            <label className="flex items-center gap-2">
                              <input type="checkbox" checked={editingDiscount.is_active} onChange={e => setEditingDiscount(ed => ed ? { ...ed, is_active: e.target.checked } : ed)} /> Activo
                            </label>
                            <input type="date" value={editingDiscount.valid_from || ''} onChange={e => setEditingDiscount(ed => ed ? { ...ed, valid_from: e.target.value } : ed)} className="border rounded px-2 py-1" />
                            <input type="date" value={editingDiscount.valid_to || ''} onChange={e => setEditingDiscount(ed => ed ? { ...ed, valid_to: e.target.value } : ed)} className="border rounded px-2 py-1" />
                            <div className="flex gap-2 mt-2">
                              <button onClick={handleUpdateDiscount} className="bg-blue-600 text-white rounded px-3 py-1">Guardar</button>
                              <button onClick={() => setEditingDiscount(null)} className="bg-gray-300 text-gray-800 rounded px-3 py-1">Cancelar</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditProduct}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
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