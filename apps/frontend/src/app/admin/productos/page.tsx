"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  roles?: string[];
  created_at?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningRole, setAssigningRole] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since we don't have a users endpoint
      // TODO: Create a proper users endpoint in the backend
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@example.com',
          roles: ['admin'],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          email: 'business@example.com',
          roles: ['business'],
          created_at: '2024-01-02T00:00:00Z'
        },
        {
          id: '3',
          email: 'consumer@example.com',
          roles: ['consumer'],
          created_at: '2024-01-03T00:00:00Z'
        }
      ];
      setUsers(mockUsers);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const assignAdminRole = async (userId: string) => {
    try {
      setAssigningRole(userId);
      await api.post('/auth/assign-role', {
        userId,
        role: 'admin'
      }, { requireAuth: true });

      // Update the user in the local state
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, roles: [...(user.roles || []), 'admin'] }
          : user
      ));

      alert('Rol de administrador asignado exitosamente');
    } catch (err) {
      console.error('Error assigning admin role:', err);
      alert('Error al asignar rol de administrador');
    } finally {
      setAssigningRole(null);
    }
  };

  const removeAdminRole = async (userId: string) => {
    try {
      setAssigningRole(userId);
      // TODO: Create an endpoint to remove roles
      // For now, we'll just update the local state
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, roles: user.roles?.filter(role => role !== 'admin') || [] }
          : user
      ));

      alert('Rol de administrador removido exitosamente');
    } catch (err) {
      console.error('Error removing admin role:', err);
      alert('Error al remover rol de administrador');
    } finally {
      setAssigningRole(null);
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
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="mt-2 text-gray-600">Administra los roles y permisos de los usuarios</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Lista de Usuarios</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => {
                const isAdmin = user.roles?.includes('admin');
                const isAssigning = assigningRole === user.id;

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map(role => (
                          <span
                            key={role}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              role === 'admin'
                                ? 'bg-red-100 text-red-800'
                                : role === 'business'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {isAdmin ? (
                        <button
                          onClick={() => removeAdminRole(user.id)}
                          disabled={isAssigning}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {isAssigning ? 'Removiendo...' : 'Remover Admin'}
                        </button>
                      ) : (
                        <button
                          onClick={() => assignAdminRole(user.id)}
                          disabled={isAssigning}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          {isAssigning ? 'Asignando...' : 'Hacer Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Instrucciones para crear un Admin:</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Registra un nuevo usuario o usa uno existente</li>
          <li>Haz clic en &quot;Hacer Admin&quot; junto al email del usuario</li>
          <li>El usuario ahora tendrá acceso al panel de administración</li>
          <li>Puedes acceder a /admin/dashboard con ese usuario</li>
        </ol>
      </div>
    </div>
  );
}