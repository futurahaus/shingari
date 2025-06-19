"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  tax_name?: string;
  tax_id?: string;
  billing_address?: string;
  shipping_address?: string;
  postal_code?: string;
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
  const router = useRouter();

  const [user, setUser] = useState<UserDetails | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [specialPrices, setSpecialPrices] = useState<SpecialPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<UserDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get(`/user/admin/${userId}`),
      api.get(`/user/admin/${userId}/orders`),
      api.get(`/user/admin/${userId}/special-prices`)
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

  useEffect(() => {
    if (user) setEditForm(user);
  }, [user]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setSaving(true);
    setSaveError(null);
    try {
      await api.put(`/user/admin/${userId}`, editForm as unknown as Record<string, unknown>);
      setShowEditModal(false);
      // Refetch user data
      setLoading(true);
      const userRes = await api.get(`/user/admin/${userId}`);
      setUser(userRes as UserDetails);
    } catch (err: any) {
      setSaveError('Error al actualizar usuario: ' + (err.message || 'Error desconocido'));
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userId) return;
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cuenta? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/user/admin/${userId}`);
      router.push('/admin/usuarios');
    } catch (err: unknown) {
      let message = 'Error desconocido';
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
        message = (err as { message: string }).message;
      }
      setDeleteError('Error al cancelar la cuenta: ' + message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
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
        <div>
          <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer" onClick={() => setShowEditModal(true)}>
            + Editar Detalles del Cliente
          </button>
          <button className="ml-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer" onClick={handleDeleteUser} disabled={deleting}>
            {deleting ? 'Cancelando...' : 'Cancelar cuenta'}
          </button>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium mb-4">Editar Usuario</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500">Nombre</label>
                  <input name="first_name" value={editForm.first_name || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Apellido</label>
                  <input name="last_name" value={editForm.last_name || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Business Name</label>
                  <input name="trade_name" value={editForm.trade_name || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Ciudad</label>
                  <input name="city" value={editForm.city || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Provincia</label>
                  <input name="province" value={editForm.province || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">País</label>
                  <input name="country" value={editForm.country || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Teléfono</label>
                  <input name="phone" value={editForm.phone || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Email</label>
                  <input name="email" value={editForm.email || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Nombre Fiscal</label>
                  <input name="tax_name" value={editForm.tax_name || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">NIF</label>
                  <input name="tax_id" value={editForm.tax_id || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Dirección Fiscal</label>
                  <input name="billing_address" value={editForm.billing_address || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Dirección de Entrega</label>
                  <input name="shipping_address" value={editForm.shipping_address || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">C.P.</label>
                  <input name="postal_code" value={editForm.postal_code || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
              </div>
              {saveError && <div className="text-red-600 text-sm">{saveError}</div>}
              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Información del Cliente */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Información del Cliente</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-gray-200 pb-6">
          <div>
            <div className="text-xs text-gray-500">ID</div>
            <div className="font-medium text-gray-900">#{user.id}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Nombre</div>
            <div className="font-medium text-gray-900">{(user.first_name || '') + ' ' + (user.last_name || '')}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Business Name</div>
            <div className="font-medium text-gray-900">{user.trade_name || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Ciudad</div>
            <div className="font-medium text-gray-900">{user.city || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Provincia</div>
            <div className="font-medium text-gray-900">{user.province || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">País</div>
            <div className="font-medium text-gray-900">{user.country || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Teléfono</div>
            <div className="font-medium text-gray-900">{user.phone || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Perfil Completo</div>
            <div className="font-medium text-gray-900">{user.profile_is_complete ? 'Sí' : 'No'}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{order.total}</td>
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

      {deleteError && <div className="text-red-600 text-sm mb-4">{deleteError}</div>}
    </div>
  );
}