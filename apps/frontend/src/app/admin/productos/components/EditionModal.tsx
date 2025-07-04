"use client";
import React, { useState } from 'react';
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
  wholesale_price?: number;
  status?: string;
  unit_id?: number;
  unit_name?: string;
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

interface EditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onProductUpdated: () => void;
}

export const EditionModal: React.FC<EditionModalProps> = ({
  isOpen,
  onClose,
  product,
  onProductUpdated
}) => {
  const { showSuccess, showError } = useNotificationContext();
  
  const [editForm, setEditForm] = useState<UpdateProductData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryIds: [],
  });

  // Available categories (you might want to fetch this from the API)
  const availableCategories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Food'];

  // Initialize form when product changes
  React.useEffect(() => {
    if (product) {
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
    }
  }, [product]);

  const handleEditProduct = async () => {
    if (!product) return;

    try {
      // Only include unit_id if valid
      const payload = { ...editForm };
      if (!payload.unit_id || isNaN(Number(payload.unit_id))) {
        delete payload.unit_id;
      }
      console.log('Payload for update:', payload);
      await api.put(`/products/${product.id}`, payload as unknown as Record<string, unknown>);
      onClose();
      setEditForm({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        categoryIds: [],
      });
      onProductUpdated();
      showSuccess('Producto Actualizado', 'El producto se ha actualizado exitosamente');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError('Error al Actualizar', 'Error al actualizar producto: ' + (err.message || 'Error desconocido'));
      } else {
        showError('Error al Actualizar', 'Error al actualizar producto: Error desconocido');
      }
    }
  };

  if (!isOpen || !product) return null;

  return (
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
                onClick={onClose}
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
  );
}; 