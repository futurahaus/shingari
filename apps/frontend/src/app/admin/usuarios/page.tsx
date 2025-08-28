"use client";
import React, { useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useAdminUsers } from './hooks/useAdminUsers.hook';
import { UsersTableSkeleton } from './components/UsersTableSkeleton';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    first_name: '',
    last_name: '',
    trade_name: '',
    city: '',
    province: '',
    country: '',
    phone: '',
    email: '',
    password: '',
    tax_name: '',
    tax_id: '',
    billing_address: '',
    shipping_address: '',
    postal_code: '',
    internal_id: '',
    roles: [] as string[],
  });
  const [savingNewClient, setSavingNewClient] = useState(false);
  const [saveNewClientError, setSaveNewClientError] = useState<string | null>(null);

  const handleRoleChange = (role: string, isChecked: boolean) => {
    const currentRoles = newClientForm.roles || [];
    const newRoles = isChecked 
      ? [...currentRoles, role]
      : currentRoles.filter(r => r !== role);
    setNewClientForm(f => ({ ...f, roles: newRoles }));
  };

  // Usar el hook para obtener usuarios
  const { users, loading, error, refetch } = useAdminUsers();

  // Filtered users based on search
  const filteredUsers = users.filter(user => {
    const searchLower = search.toLowerCase();
    return (
      ((user.first_name || '') + ' ' + (user.last_name || '')).toLowerCase().includes(searchLower) ||
      (user.tax_name?.toLowerCase().includes(searchLower) || '') ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  async function handleCreateNewUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingNewClient(true);
    setSaveNewClientError(null);
    try {
      // 1. Create user (auth)
      const createRes = await api.post('/user/admin/create', {
        email: newClientForm.email,
        password: newClientForm.password,
        roles: newClientForm.roles,
      }) as { id?: string };
      // 2. Update public profile fields
      if (createRes && typeof createRes === 'object' && 'id' in createRes && createRes.id) {
        await api.put(`/user/admin/${createRes.id}`, {
          first_name: newClientForm.first_name,
          last_name: newClientForm.last_name,
          trade_name: newClientForm.trade_name,
          city: newClientForm.city,
          province: newClientForm.province,
          country: newClientForm.country,
          phone: newClientForm.phone,
          tax_name: newClientForm.tax_name,
          tax_id: newClientForm.tax_id,
          billing_address: newClientForm.billing_address,
          shipping_address: newClientForm.shipping_address,
          postal_code: newClientForm.postal_code,
          internal_id: newClientForm.internal_id,
        });
      }
      setShowNewClientModal(false);
      setNewClientForm({
        first_name: '',
        last_name: '',
        trade_name: '',
        city: '',
        province: '',
        country: '',
        phone: '',
        email: '',
        password: '',
        tax_name: '',
        tax_id: '',
        billing_address: '',
        shipping_address: '',
        postal_code: '',
        internal_id: '',
        roles: [],
      });
      refetch();
    } catch (err: unknown) {
      function isErrorWithMessage(error: unknown): error is { message: string } {
        return (
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message: unknown }).message === 'string'
        );
      }
      let message = 'Error desconocido';
      if (isErrorWithMessage(err)) {
        message = err.message;
      }
      setSaveNewClientError('Error al crear usuario: ' + message);
    } finally {
      setSavingNewClient(false);
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        <p>{error}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold mb-1">Clientes</h1>
          <p className="text-gray-500 text-sm">Gestiona tu cartera de clientes</p>
        </div>
        <button
          className="w-full sm:w-auto px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer text-sm lg:text-base"
          onClick={() => setShowNewClientModal(true)}
        >
          + Nuevo cliente
        </button>
      </div>
      {/* New Client Modal */}
      {showNewClientModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-base lg:text-lg font-medium mb-4">Nuevo Cliente</h3>
            <form
              onSubmit={handleCreateNewUser}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500">Email</label>
                  <input name="email" value={newClientForm.email} onChange={e => setNewClientForm(f => ({ ...f, email: e.target.value }))} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Contraseña</label>
                  <input name="password" type="password" value={newClientForm.password} onChange={e => setNewClientForm(f => ({ ...f, password: e.target.value }))} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Nombre</label>
                  <input name="first_name" value={newClientForm.first_name} onChange={e => setNewClientForm(f => ({ ...f, first_name: e.target.value }))} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Apellido</label>
                  <input name="last_name" value={newClientForm.last_name} onChange={e => setNewClientForm(f => ({ ...f, last_name: e.target.value }))} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Business Name</label>
                  <input name="trade_name" value={newClientForm.trade_name} onChange={e => setNewClientForm(f => ({ ...f, trade_name: e.target.value }))} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Ciudad</label>
                  <input name="city" value={newClientForm.city} onChange={e => setNewClientForm(f => ({ ...f, city: e.target.value }))} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Provincia</label>
                  <input name="province" value={newClientForm.province} onChange={e => setNewClientForm(f => ({ ...f, province: e.target.value }))} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">País</label>
                  <input name="country" value={newClientForm.country} onChange={e => setNewClientForm(f => ({ ...f, country: e.target.value }))} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Teléfono</label>
                  <input name="phone" value={newClientForm.phone} onChange={e => setNewClientForm(f => ({ ...f, phone: e.target.value }))} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>

                <div>
                  <label className="block text-xs text-gray-500">Nombre Fiscal</label>
                  <input name="tax_name" value={newClientForm.tax_name} onChange={e => setNewClientForm(f => ({ ...f, tax_name: e.target.value }))} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">NIF</label>
                  <input name="tax_id" value={newClientForm.tax_id} onChange={e => setNewClientForm(f => ({ ...f, tax_id: e.target.value }))} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Dirección Fiscal</label>
                  <input name="billing_address" value={newClientForm.billing_address} onChange={e => setNewClientForm(f => ({ ...f, billing_address: e.target.value }))} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Dirección de Entrega</label>
                  <input name="shipping_address" value={newClientForm.shipping_address} onChange={e => setNewClientForm(f => ({ ...f, shipping_address: e.target.value }))} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">C.P.</label>
                  <input name="postal_code" value={newClientForm.postal_code} onChange={e => setNewClientForm(f => ({ ...f, postal_code: e.target.value }))} className="w-full border rounded px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">ID Interno</label>
                  <input
                    name="internal_id"
                    value={newClientForm.internal_id}
                    onChange={e => setNewClientForm(f => ({ ...f, internal_id: e.target.value }))}
                    className="w-full border rounded px-2 py-1 text-gray-900"
                  />
                </div>
              </div>

              {/* Role Management Section */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Gestión de Roles</h4>
                <div className="space-y-2">
                  {['consumer', 'business', 'admin'].map((role) => (
                    <label key={role} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newClientForm.roles?.includes(role) || false}
                        onChange={(e) => handleRoleChange(role, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {role === 'consumer' ? 'Consumidor' : 
                         role === 'business' ? 'Empresa' : 
                         role === 'admin' ? 'Administrador' : role}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {saveNewClientError && <div className="text-red-600 text-sm">{saveNewClientError}</div>}
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowNewClientModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer text-sm">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer text-sm" disabled={savingNewClient}>{savingNewClient ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Search Bar */}
      <div className="mb-4 flex items-center relative">
        <input
          type="text"
          placeholder="Buscar cliente"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 lg:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm lg:text-base"
        />
        <span className="absolute right-3 lg:right-4 text-gray-400">
          <svg width="16" height="16" className="lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6Z"/></svg>
        </span>
      </div>
      
      {/* Table or Skeleton */}
      {loading ? (
        <UsersTableSkeleton rowsCount={15} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Fiscal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{user.internal_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.tax_name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{(user.first_name || '') + ' ' + (user.last_name || '')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 underline">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block bg-gray-100 px-4 py-1 rounded-full font-semibold text-gray-700">
                          {user.points ?? '0'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.roles && user.roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <span
                                key={role}
                                className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize"
                              >
                                {role === 'consumer' ? 'Consumidor' : 
                                 role === 'business' ? 'Empresa' : 
                                 role === 'admin' ? 'Administrador' : role}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Sin roles</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/usuarios/${user.id}`}
                          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer text-sm"
                        >
                          Ver Detalles
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {filteredUsers.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No hay usuarios registrados
              </div>
            ) : (
              filteredUsers.map(user => (
                <div key={user.id} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {(user.first_name || '') + ' ' + (user.last_name || '')}
                        </span>
                        <span className="text-xs text-gray-500">#{user.id.slice(0, 6)}</span>
                      </div>
                      <p className="text-sm text-blue-700 underline">{user.email}</p>
                      {user.tax_name && (
                        <p className="text-xs text-gray-600 mt-1">{user.tax_name}</p>
                      )}
                    </div>
                    <Link
                      href={`/admin/usuarios/${user.id}`}
                      className="px-3 py-1 bg-black text-white rounded text-xs hover:bg-gray-800 cursor-pointer"
                    >
                      Ver
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Ciudad:</span>
                      <span className="ml-1 text-gray-900">{user.city || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Teléfono:</span>
                      <span className="ml-1 text-gray-900">{user.phone || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Puntos:</span>
                      <span className="ml-1 bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                        {user.points ?? '0'}
                      </span>
                    </div>
                  </div>

                  {/* Roles in mobile view */}
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-1">Roles:</div>
                    {user.roles && user.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize"
                          >
                            {role === 'consumer' ? 'Consumidor' : 
                             role === 'business' ? 'Empresa' : 
                             role === 'admin' ? 'Administrador' : role}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Sin roles asignados</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}