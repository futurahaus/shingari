"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from '@/lib/api';
import { EditUserModal } from './components/EditUserModal';
import { UserInfo } from './components/UserInfo';
import { UserOrders } from './components/UserOrders';
import { UserSpecialPrices } from './components/UserSpecialPrices';

export interface UserDetails {
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
  internal_id?: string;
  roles?: string[];
}

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params?.id as string;
  const router = useRouter();

  const [user, setUser] = useState<UserDetails | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<UserDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setEditForm(user);
  }, [user]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role: string, isChecked: boolean) => {
    if (!editForm) return;
    const currentRoles = editForm.roles || [];
    const newRoles = isChecked
      ? [...currentRoles, role]
      : currentRoles.filter(r => r !== role);
    setEditForm({ ...editForm, roles: newRoles });
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
      const userRes = await api.get(`/user/admin/${userId}`);
      setUser(userRes as UserDetails);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      setSaveError('Error al actualizar usuario: ' + error);
    } finally {
      setSaving(false);
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
      const error = err instanceof Error ? err.message : 'Unknown error';
      setDeleteError('Error al cancelar la cuenta: ' + error);
    } finally {
      setDeleting(false);
    }
  };

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
      <EditUserModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editForm={editForm}
        setEditForm={setEditForm}
        handleEditChange={handleEditChange}
        handleEditSubmit={handleEditSubmit}
        saveError={saveError}
        saving={saving}
        handleRoleChange={handleRoleChange}
      />

      {/* Información del Cliente */}
      <UserInfo
        userId={userId}
        onUserLoaded={setUser}
      />

      {/* Historial de compras */}
      <UserOrders
        userId={userId}
      />

      {/* Lista de Precios especial */}
      <UserSpecialPrices
        userId={userId}
      />

      {deleteError && <div className="text-red-600 text-sm mb-4">{deleteError}</div>}
    </div>
  );
}