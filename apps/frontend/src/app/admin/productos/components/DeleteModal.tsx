"use client";
import React from 'react';
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

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onProductDeleted: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  product,
  onProductDeleted
}) => {
  const { showSuccess, showError } = useNotificationContext();

  const handleDeleteProduct = async () => {
    if (!product) return;

    try {
      await api.delete(`/products/${product.id}`);
      onClose();
      onProductDeleted();
      showSuccess('Producto Eliminado', 'El producto se ha eliminado exitosamente');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError('Error al Eliminar', 'Error al eliminar producto: ' + (err.message || 'Error desconocido'));
      } else {
        showError('Error al Eliminar', 'Error al eliminar producto: Error desconocido');
      }
    }
  };

  if (!isOpen || !product) return null;

  return (
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
                ¿Estás seguro de que quieres eliminar el producto &quot;{product.name}&quot;? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex justify-center space-x-3 mt-6">
              <button
                onClick={onClose}
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
  );
}; 