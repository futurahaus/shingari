"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  roles: string[];
  created_at?: string;
  updated_at?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  meta_data?: any;
}

interface CreateUserData {
  email: string;
  password: string;
  roles: string[];
}

interface UpdateUserData {
  email?: string;
  roles: string[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningRole, setAssigningRole] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserData>({
    email: '',
    password: '',
    roles: [],
  });
  const [editForm, setEditForm] = useState<UpdateUserData>({
    email: '',
    roles: [],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/user/admin/all', { requireAuth: true });
      console.log('API Response:', response);
      const usersData = Array.isArray(response) ? response : [];
      console.log('Users data to set:', usersData);
      setUsers(usersData);
    } catch (err: any) {
      setError('Error al cargar usuarios: ' + (err.message || 'Error desconocido'));
      setUsers([]); // Set empty array on error
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/user/admin/create', createForm, { requireAuth: true });
      setShowCreateModal(false);
      setCreateForm({ email: '', password: '', roles: [] });
      await fetchUsers();
      alert('Usuario creado exitosamente');
    } catch (err: any) {
      alert('Error al crear usuario: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      await api.put(`/user/admin/${selectedUser.id}`, editForm, { requireAuth: true });
      setShowEditModal(false);
      setSelectedUser(null);
      setEditForm({ email: '', roles: [] });
      await fetchUsers();
      alert('Usuario actualizado exitosamente');
    } catch (err: any) {
      alert('Error al actualizar usuario: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await api.delete(`/user/admin/${selectedUser.id}`, { requireAuth: true });
      setShowDeleteModal(false);
      setSelectedUser(null);
      await fetchUsers();
      alert('Usuario eliminado exitosamente');
    } catch (err: any) {
      alert('Error al eliminar usuario: ' + (err.message || 'Error desconocido'));
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      roles: [...user.roles],
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const assignAdminRole = async (userId: string) => {
    try {
      setAssigningRole(userId);
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const updatedRoles = [...user.roles, 'admin'];
      await api.put(`/user/admin/${userId}`, { roles: updatedRoles }, { requireAuth: true });

      await fetchUsers();
      alert('Rol de administrador asignado exitosamente');
    } catch (err: any) {
      console.error('Error assigning admin role:', err);
      alert('Error al asignar rol de administrador: ' + (err.message || 'Error desconocido'));
    } finally {
      setAssigningRole(null);
    }
  };

  const removeAdminRole = async (userId: string) => {
    try {
      setAssigningRole(userId);
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const updatedRoles = user.roles.filter(role => role !== 'admin');
      await api.put(`/user/admin/${userId}`, { roles: updatedRoles }, { requireAuth: true });

      await fetchUsers();
      alert('Rol de administrador removido exitosamente');
    } catch (err: any) {
      console.error('Error removing admin role:', err);
      alert('Error al remover rol de administrador: ' + (err.message || 'Error desconocido'));
    } finally {
      setAssigningRole(null);
    }
  };

  const handleRoleChange = (role: string, checked: boolean, formType: 'create' | 'edit') => {
    if (formType === 'create') {
      setCreateForm(prev => ({
        ...prev,
        roles: checked
          ? [...prev.roles, role]
          : prev.roles.filter(r => r !== role)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        roles: checked
          ? [...prev.roles, role]
          : prev.roles.filter(r => r !== role)
      }));
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
        <button
          onClick={fetchUsers}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  console.log('Current users state:', users);
  console.log('Users length:', users?.length);
  console.log('Users type:', typeof users);
  console.log('Is users array?', Array.isArray(users));

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-2 text-gray-600">Administra los roles y permisos de los usuarios</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Crear Usuario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Lista de Usuarios ({users?.length || 0})</h2>
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
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                console.log('Rendering table body');
                console.log('users?.length === 0:', users?.length === 0);
                console.log('users?.map available:', users?.map);

                if (users?.length === 0) {
                  console.log('Showing empty state');
                  return (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No hay usuarios registrados
                      </td>
                    </tr>
                  );
                } else {
                  console.log('Mapping users:', users);
                  return users?.map(user => {
                    console.log('Rendering user:', user);
                    const isAdmin = user.roles?.includes('admin');
                    const isAssigning = assigningRole === user.id;
                    const isEmailConfirmed = !!user.email_confirmed_at;

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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isEmailConfirmed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isEmailConfirmed ? 'Verificado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_sign_in_at
                            ? new Date(user.last_sign_in_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Nunca'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => openDeleteModal(user)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Eliminar
                            </button>
                            {isAdmin ? (
                              <button
                                onClick={() => removeAdminRole(user.id)}
                                disabled={isAssigning}
                                className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                              >
                                {isAssigning ? 'Removiendo...' : 'Remover Admin'}
                              </button>
                            ) : (
                              <button
                                onClick={() => assignAdminRole(user.id)}
                                disabled={isAssigning}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                {isAssigning ? 'Asignando...' : 'Hacer Admin'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                }
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Crear Nuevo Usuario</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                <div className="space-y-2">
                  {['admin', 'business', 'consumer'].map(role => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={createForm.roles.includes(role)}
                        onChange={(e) => handleRoleChange(role, e.target.checked, 'create')}
                        className="mr-2"
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Editar Usuario</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                <div className="space-y-2">
                  {['admin', 'business', 'consumer'].map(role => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.roles.includes(role)}
                        onChange={(e) => handleRoleChange(role, e.target.checked, 'edit')}
                        className="mr-2"
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditUser}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Eliminar Usuario</h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que quieres eliminar al usuario <strong>{selectedUser.email}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}