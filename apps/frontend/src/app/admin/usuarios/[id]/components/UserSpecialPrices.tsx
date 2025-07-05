import React, { useEffect, useState } from "react";
import { api } from '@/lib/api';

interface SpecialPrice {
  product: string;
  priceRetail: string;
  priceClient: string;
}

interface UserSpecialPricesProps {
  userId: string;
  onSpecialPricesLoaded?: (specialPrices: SpecialPrice[]) => void;
}

export const UserSpecialPrices: React.FC<UserSpecialPricesProps> = ({ userId, onSpecialPricesLoaded }) => {
  const [specialPrices, setSpecialPrices] = useState<SpecialPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="mb-8">
        <div className="h-6 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
        <div className="overflow-x-auto">
          <div className="min-w-full border border-gray-200 rounded-lg">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-4 gap-4">
                <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
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
        <h2 className="text-lg font-semibold mb-4">Lista de Precios especial</h2>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Lista de Precios especial</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Minorista</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio por cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {specialPrices.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Sin precios especiales</td></tr>
            ) : (
              specialPrices.map((row, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{row.product || <span className="inline-block w-6 h-6 bg-black rounded-full mr-2 align-middle"></span>}</td>
                  <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{row.priceRetail}</td>
                  <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{row.priceClient}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-700 underline">Editar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 