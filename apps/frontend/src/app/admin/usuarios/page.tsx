"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  trade_name?: string;
  city?: string;
  province?: string;
  country?: string;
  phone?: string;
  profile_is_complete?: boolean;
  compras?: number;
  scoring?: number;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  roles: string[];
  meta_data?: any;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/user/admin/all', { requireAuth: true });
      const usersData = Array.isArray(response) ? response : [];
      setUsers(usersData);
    } catch (err: any) {
      setError('Error al cargar usuarios: ' + (err.message || 'Error desconocido'));
      setUsers([]); // Set empty array on error
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered users based on search
  const filteredUsers = users.filter(user => {
    const searchLower = search.toLowerCase();
    return (
      ((user.first_name || '') + ' ' + (user.last_name || '')).toLowerCase().includes(searchLower) ||
      (user.trade_name?.toLowerCase().includes(searchLower) || '') ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        <p>{error}</p>
        <button
          onClick={fetchUsers}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Clientes</h1>
        <p className="text-gray-500 text-sm">Gestiona tu cartera de clientes</p>
      </div>
      {/* Search Bar */}
      <div className="mb-4 flex items-center relative">
        <input
          type="text"
          placeholder="Buscar cliente"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <span className="absolute right-4 text-gray-400">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6Z"/></svg>
        </span>
      </div>
      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compras</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scoring</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Últ. Login</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{(user.first_name || '') + ' ' + (user.last_name || '')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user.trade_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 underline">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user.city || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">{user.compras ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">#{user.id.slice(0, 6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block bg-gray-100 px-4 py-1 rounded-full font-semibold text-gray-700">
                        {user.scoring ?? '0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toISOString().slice(0, 10)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/usuarios/${user.id}`}
                        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
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
      </div>
    </div>
  );
}