"use client";
import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useCategories } from '../hooks/useCategories.hook';
import { CreateProductData, CreationModalProps } from '../interfaces/product.interfaces';

export const CreationModal: React.FC<CreationModalProps> = ({
  isOpen,
  onClose,
  onProductCreated
}) => {
  const { showSuccess, showError } = useNotificationContext();
  const { categories, loading: loadingCategories } = useCategories();
  
  const [createForm, setCreateForm] = useState<CreateProductData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryIds: [],
  });

  const handleCreateProduct = async () => {
    try {
      // Only include unit_id if valid
      const payload = { ...createForm };
      if (!payload.unit_id || isNaN(Number(payload.unit_id))) {
        delete payload.unit_id;
      }

      await api.post('/products', payload as unknown as Record<string, unknown>);
      onClose();
      setCreateForm({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        categoryIds: [],
      });
      onProductCreated();
      showSuccess('Producto Creado', 'El producto se ha creado exitosamente');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError('Error al Crear', 'Error al crear producto: ' + (err.message || 'Error desconocido'));
      } else {
        showError('Error al Crear', 'Error al crear producto: Error desconocido');
      }
    }
  };

  const handleClose = () => {
    setCreateForm({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryIds: [],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
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
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? 'Cargando categorías...' : 'Seleccionar categoría'}
                  </option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Buttons */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={handleClose}
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
  );
}; 