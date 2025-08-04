import React, { useEffect, useState, useCallback } from "react";
import { api } from '@/lib/api';
import { AddSpecialPriceModal } from './AddSpecialPriceModal';

interface SpecialPrice {
  id: string;
  product: string;
  priceRetail: string;
  priceWholesale: string;
  priceClient: string;
  productId?: string;
  isActive?: boolean;
  validFrom?: string;
  validTo?: string;
}

interface UserSpecialPricesProps {
  userId: string;
  onSpecialPricesLoaded?: (specialPrices: SpecialPrice[]) => void;
}

export const UserSpecialPrices: React.FC<UserSpecialPricesProps> = ({ userId, onSpecialPricesLoaded }) => {
  const [specialPrices, setSpecialPrices] = useState<SpecialPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSpecialPrice, setEditingSpecialPrice] = useState<SpecialPrice | null>(null);

      const loadSpecialPrices = useCallback(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    api.get(`/user/admin/${userId}/special-prices`)
      .then((pricesRes) => {
        const pricesData = Array.isArray(pricesRes) ? pricesRes : [];
        setSpecialPrices(pricesData);
        onSpecialPricesLoaded?.(pricesData);
      })
      .catch((err) => {
        const error = err instanceof Error ? err.message : 'Unknown error';
        setError('Error al cargar los precios especiales: ' + error);
      })
      .finally(() => setLoading(false));
  }, [userId, onSpecialPricesLoaded]);

  useEffect(() => {
    loadSpecialPrices();
  }, [loadSpecialPrices]);

  const handleSpecialPriceAdded = () => {
    setShowAddModal(false);
    setEditingSpecialPrice(null);
    loadSpecialPrices(); // Refresh the list
  };

  const handleEditSpecialPrice = (specialPrice: SpecialPrice) => {
    setEditingSpecialPrice(specialPrice);
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="h-6 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
        <div className="overflow-x-auto">
          <div className="min-w-full border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-5 gap-4">
                <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-28 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-28 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-4 bg-gray-300 rounded w-full mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Lista de Precios especial</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
          >
            Agregar precio especial
          </button>
        </div>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Lista de Precios especial</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
        >
          Agregar precio especial
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Minorista</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Mayorista</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio por cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {specialPrices.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Sin precios especiales</td></tr>
            ) : (
              specialPrices.map((row, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{row.product || <span className="inline-block w-6 h-6 bg-black rounded-full mr-2 align-middle"></span>}</td>
                  <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{row.priceRetail}</td>
                  <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{row.priceWholesale}</td>
                  <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{row.priceClient}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="p-2 text-black rounded-lg transition duration-200 hover:bg-gray-100 cursor-pointer"
                      title="Editar precio especial"
                      onClick={() => handleEditSpecialPrice(row)}
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddSpecialPriceModal
          userId={userId}
          editingSpecialPrice={editingSpecialPrice}
          onClose={() => {
            setShowAddModal(false);
            setEditingSpecialPrice(null);
          }}
          onSpecialPriceAdded={handleSpecialPriceAdded}
        />
      )}
    </div>
  );
};