"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from '@/lib/api';

interface UserDetails {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  trade_name?: string;
  city?: string;
  province?: string;
  country?: string;
  phone?: string;
  profile_is_complete?: boolean;
  name: string;
  restaurant: string;
}

interface Order {
  id: string;
  date: string;
  total: string;
}

interface SpecialPrice {
  product: string;
  priceRetail: string;
  priceClient: string;
}

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<UserDetails | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [specialPrices, setSpecialPrices] = useState<SpecialPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get(`/user/admin/${userId}`, { requireAuth: true }),
      api.get(`/user/admin/${userId}/orders`, { requireAuth: true }),
      api.get(`/user/admin/${userId}/special-prices`, { requireAuth: true })
    ])
      .then(([userRes, ordersRes, pricesRes]) => {
        setUser(userRes as UserDetails);
        setOrders(Array.isArray(ordersRes) ? ordersRes : []);
        setSpecialPrices(Array.isArray(pricesRes) ? pricesRes : []);
      })
      .catch((err) => {
        setError('Error al cargar los datos: ' + (err.message || 'Error desconocido'));
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }
  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }
  if (!user) {
    return <div className="p-8">Usuario no encontrado.</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Detalles</h1>
          <p className="text-gray-500 text-sm">Gestiona Descuentos y Promociones por cliente</p>
        </div>
        <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
          + Editar Detalles del Cliente
        </button>
      </div>

      {/* Información del Cliente */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Información del Cliente</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-gray-200 pb-6">
          <div>
            <div className="text-xs text-gray-500">ID</div>
            <div className="font-medium">#{user.id}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Nombre</div>
            <div className="font-medium">{(user.first_name || '') + ' ' + (user.last_name || '')}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Business Name</div>
            <div className="font-medium">{user.trade_name || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Ciudad</div>
            <div className="font-medium">{user.city || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Provincia</div>
            <div className="font-medium">{user.province || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">País</div>
            <div className="font-medium">{user.country || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Teléfono</div>
            <div className="font-medium">{user.phone || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Perfil Completo</div>
            <div className="font-medium">{user.profile_is_complete ? 'Sí' : 'No'}</div>
          </div>
        </div>
      </div>

      {/* Historial de compras */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Historial de compras</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID de orden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Sin compras registradas</td></tr>
              ) : (
                orders.map((order, idx) => (
                  <tr key={idx} className="border-t border-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer text-sm">Ver Detalles</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista de Precios especial */}
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
                    <td className="px-6 py-4 whitespace-nowrap">{row.product || <span className="inline-block w-6 h-6 bg-black rounded-full mr-2 align-middle"></span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.priceRetail}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.priceClient}</td>
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
    </div>
  );
} 