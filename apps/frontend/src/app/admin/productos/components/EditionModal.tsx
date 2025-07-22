"use client";
import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useCategories } from '../hooks/useCategories.hook';
import { Button } from '@/app/ui/components/Button';
import { UpdateProductData, EditionModalProps } from '../interfaces/product.interfaces';

export const EditionModal: React.FC<EditionModalProps> = ({
  isOpen,
  onClose,
  product,
  onProductUpdated
}) => {
  const { showSuccess, showError } = useNotificationContext();
  const { categories, loading: loadingCategories } = useCategories();

  const [editForm, setEditForm] = useState<UpdateProductData>({
    name: '',
    description: '',
    listPrice: 0,
    wholesalePrice: 0,
    stock: 0,
    categoryIds: [],
  });

  // Initialize form when product changes
  React.useEffect(() => {
    if (product) {
      setEditForm({
        name: product.name || '',
        description: product.description || '',
        listPrice: product.listPrice ?? 0,
        wholesalePrice: product.wholesalePrice ?? 0,
        stock: product.stock ?? 0,
        categoryIds: product.categories || [],
        status: product.status ?? 'active',
        images: product.images || [],
        unit_id: product.unit_id ?? undefined,
        units_per_box: product.units_per_box ?? 0,
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
        listPrice: 0,
        wholesalePrice: 0,
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
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Descripción de Producto"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
                    placeholder="0"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Unidades por Caja</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={editForm.units_per_box || ''}
                    onChange={(e) => setEditForm({ ...editForm, units_per_box: parseInt(e.target.value) || 0 })}
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
                    value={editForm.listPrice}
                    onChange={(e) => setEditForm({ ...editForm, listPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Precio Mayorista</label>
                  <input
                    type="number"
                    placeholder="$123"
                    value={editForm.wholesalePrice || ''}
                    onChange={e => setEditForm({ ...editForm, wholesalePrice: parseFloat(e.target.value) || 0 })}
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
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? 'Cargando categorías...' : 'Seleccionar categoría'}
                  </option>
                  {/* Agrupar y mostrar categorías igual que el frontend principal */}
                  {(() => {
                    const parentCategories = categories.filter(cat => !cat.parentId || cat.parentId === '');
                    const childCategories = categories.filter(cat => cat.parentId && cat.parentId !== '');
                    const childrenByParent = {} as Record<string, typeof categories>;
                    childCategories.forEach(child => {
                      if (!childrenByParent[child.parentId!]) childrenByParent[child.parentId!] = [];
                      childrenByParent[child.parentId!].push(child);
                    });
                    return parentCategories.map(parent => [
                      <option key={parent.id} value={parent.id} disabled>
                        {parent.name}
                      </option>,
                      childrenByParent[parent.id]?.map(child => (
                        <option key={child.id} value={child.name}>&nbsp;&nbsp;{child.name}</option>
                      ))
                    ]);
                  })()}
                </select>
              </div>
            </div>
            {/* Buttons */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-8">
              <Button
                onPress={onClose}
                type="secondary"
                text="Cancelar"
                testID="cancel-edit-button"
                inline
              />
              <Button
                onPress={handleEditProduct}
                type="primary-admin"
                text="Actualizar Producto"
                testID="update-product-button"
                inline
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};