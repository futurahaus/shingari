import React from "react";

interface EditUserModalProps {
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  editForm: any;
  setEditForm: (form: any) => void;
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEditSubmit: (e: React.FormEvent) => void;
  saveError: string | null;
  saving: boolean;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  showEditModal,
  setShowEditModal,
  editForm,
  handleEditChange,
  handleEditSubmit,
  saveError,
  saving,
}) => {
  if (!showEditModal || !editForm) return null;

  return (
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
            <div>
              <label className="block text-xs text-gray-500">ID Interno</label>
              <input name="internal_id" value={editForm.internal_id || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
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
  );
}; 