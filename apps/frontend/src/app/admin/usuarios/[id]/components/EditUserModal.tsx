import React from "react";
import { useTranslation } from '@/contexts/I18nContext';
import { UserDetails } from "../page";

interface EditUserModalProps {
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  editForm: UserDetails | null;
  setEditForm: (form: UserDetails) => void;
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEditSubmit: (e: React.FormEvent) => void;
  saveError: string | null;
  saving: boolean;
  handleRoleChange?: (role: string, isChecked: boolean) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  showEditModal,
  setShowEditModal,
  editForm,
  handleEditChange,
  handleEditSubmit,
  saveError,
  saving,
  handleRoleChange,
}) => {
  const { t } = useTranslation();
  if (!showEditModal || !editForm) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-medium mb-4">{t('admin.users.detail.edit_user')}</h3>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500">{t('admin.users.form.first_name')}</label>
              <input name="first_name" value={editForm.first_name || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">{t('admin.users.form.last_name')}</label>
              <input name="last_name" value={editForm.last_name || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">{t('admin.users.form.trade_name')}</label>
              <input name="trade_name" value={editForm.trade_name || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">{t('admin.users.form.city')}</label>
              <input name="city" value={editForm.city || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">{t('admin.users.form.province')}</label>
              <input name="province" value={editForm.province || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">{t('admin.users.form.country')}</label>
              <input name="country" value={editForm.country || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">{t('admin.users.form.phone')}</label>
              <input name="phone" value={editForm.phone || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">{t('admin.users.form.email')}</label>
              <input name="email" value={editForm.email || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">{t('admin.users.form.tax_name')}</label>
              <input name="tax_name" value={editForm.tax_name || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">{t('admin.users.form.tax_id')}</label>
              <input name="tax_id" value={editForm.tax_id || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">{t('admin.users.form.billing_address')}</label>
              <input name="billing_address" value={editForm.billing_address || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">{t('admin.users.form.shipping_address')}</label>
              <input name="shipping_address" value={editForm.shipping_address || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">{t('admin.users.form.postal_code')}</label>
              <input name="postal_code" value={editForm.postal_code || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">{t('admin.users.form.internal_id')}</label>
              <input name="internal_id" value={editForm.internal_id || ''} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-gray-900" />
            </div>
          </div>

          {/* Role Management Section */}
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{t('admin.users.form.role_management')}</h4>
            <div className="space-y-2">
              {['consumer', 'business', 'admin'].map((role) => (
                <label key={role} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.roles?.includes(role) || false}
                    onChange={(e) => handleRoleChange?.(role, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {t(`admin.users.roles.${role}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>
          {saveError && <div className="text-red-600 text-sm">{saveError}</div>}
          <div className="flex justify-end space-x-2 mt-6">
            <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer">{t('admin.users.cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer" disabled={saving}>{saving ? t('admin.users.saving') : t('admin.users.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}; 