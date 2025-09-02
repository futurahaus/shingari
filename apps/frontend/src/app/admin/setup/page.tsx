"use client";
import React, { useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

// Tab interface
interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

// Sub-tab interface for nested tabs
interface SubTab {
  id: string;
  label: string;
  component: React.ReactNode;
}

export default function AdminSetupPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('admin-role');
  const [activeSubTab, setActiveSubTab] = useState('precios-especiales');
  const [isAssigning, setIsAssigning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assignAdminRoleToSelf = async () => {
    if (!user) {
      setError(t('admin.setup.no_authenticated_user'));
      return;
    }

    try {
      setIsAssigning(true);
      setError(null);
      setMessage(null);

      await api.post('/auth/assign-role', {
        userId: user.id,
        role: 'admin'
      });

      setMessage(t('admin.setup.admin_role_assigned_success'));

      // Refresh the page after a short delay to update the user context
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error assigning admin role:', err);
      setError(err instanceof Error ? err.message : t('admin.setup.error_assigning_admin_role'));
    } finally {
      setIsAssigning(false);
    }
  };

  const isAdmin = user?.roles?.includes('admin');

  // Admin Role Tab Component
  const AdminRoleTab = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">{t('admin.setup.current_user')}</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">{t('admin.setup.email')}: <span className="font-medium text-gray-900">{user?.email}</span></p>
          <p className="text-sm text-gray-600">{t('admin.setup.id')}: <span className="font-medium text-gray-900">{user?.id}</span></p>
          <p className="text-sm text-gray-600">{t('admin.setup.roles')}:
            <span className="font-medium text-gray-900 ml-1">
              {user?.roles?.join(', ') || t('admin.setup.none')}
            </span>
          </p>
        </div>
      </div>

      {isAdmin ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                {t('admin.setup.already_admin_permissions')}
              </h3>
              <p className="text-sm text-green-700 mt-1">
                {t('admin.setup.can_access_admin_panel')} <a href="/admin/dashboard" className="underline">/admin/dashboard</a>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {t('admin.setup.no_admin_permissions')}
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {t('admin.setup.click_button_to_assign_admin')}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={assignAdminRoleToSelf}
            disabled={isAssigning}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            {isAssigning ? t('admin.setup.assigning_role') : t('admin.setup.assign_admin_role_to_self')}
          </button>
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">{t('admin.setup.information')}:</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>{t('admin.setup.info_1')}</li>
          <li>{t('admin.setup.info_2')}</li>
          <li>{t('admin.setup.info_3')}</li>
          <li>{t('admin.setup.info_4')}</li>
        </ul>
      </div>
    </div>
  );

  // System Configuration Tab Component
  const SystemConfigTab = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Coming Soon
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              System configuration options will be available here soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Database Configuration Tab Component
  const DatabaseConfigTab = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Coming Soon
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Database configuration options will be available here soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // API Configuration Tab Component
  const ApiConfigTab = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Coming Soon
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              API configuration options will be available here soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Bulk Operations Tab Component with nested tabs
  const BulkTab = () => {
    // Precios Especiales Sub-tab Component
    const PreciosEspecialesSubTab = () => {
      const [selectedFile, setSelectedFile] = useState<File | null>(null);
      const [isUploading, setIsUploading] = useState(false);
      const [uploadResult, setUploadResult] = useState<any>(null);
      const [uploadError, setUploadError] = useState<string | null>(null);

      const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          // Validate file type
          const allowedTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',
            'application/csv'
          ];

          if (!allowedTypes.includes(file.type)) {
            setUploadError('Please select a valid Excel file (.xlsx, .xls) or CSV file (.csv)');
            setSelectedFile(null);
            return;
          }

          setUploadError(null);
          setSelectedFile(file);
          setUploadResult(null);
        }
      };

      const handleUpload = async () => {
        if (!selectedFile) {
          setUploadError('Please select a file first');
          return;
        }

        setIsUploading(true);
        setUploadError(null);
        setUploadResult(null);

        try {
          const formData = new FormData();
          formData.append('file', selectedFile);

          // Create a custom upload request with proper authentication
          const accessToken = localStorage.getItem('accessToken');
          const response = await fetch('http://localhost:3001/api/products/bulk-discounts/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText };
            }
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          setUploadResult(result);
        } catch (error) {
          console.error('Upload error:', error);
          setUploadError(error instanceof Error ? error.message : 'Error uploading file');
        } finally {
          setIsUploading(false);
        }
      };

      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Precios Especiales
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Upload Excel or CSV file to configure special pricing rules and bulk price updates.
                </p>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Upload Excel or CSV File</h4>

            <div className="space-y-4">
              {/* File Input */}
              <div>
                <label htmlFor="excel-file" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Excel or CSV File
                </label>
                <input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Excel files (.xlsx, .xls) and CSV files (.csv) are allowed
                </p>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
              >
                {isUploading ? 'Processing...' : 'Upload and Process'}
              </button>

              {/* Error Message */}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  <p>{uploadError}</p>
                </div>
              )}

              {/* Success Result */}
              {uploadResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Upload Completed
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900">Successful</p>
                      <p className="text-2xl font-bold text-green-600">{uploadResult.success}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900">Errors</p>
                      <p className="text-2xl font-bold text-red-600">{uploadResult.errors}</p>
                    </div>
                  </div>

                  {/* Details Table */}
                  {uploadResult.details && uploadResult.details.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Processing Details</h4>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="max-h-60 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {uploadResult.details.map((detail: any, index: number) => (
                                <tr key={index} className={detail.message.includes('successfully') ? 'bg-green-50' : 'bg-red-50'}>
                                  <td className="px-3 py-2 text-sm text-gray-900">{detail.row}</td>
                                  <td className="px-3 py-2 text-sm text-gray-900">{detail.sku}</td>
                                  <td className="px-3 py-2 text-sm text-gray-900">{detail.userId}</td>
                                  <td className="px-3 py-2 text-sm">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      detail.message.includes('successfully')
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {detail.message.includes('successfully') ? 'Success' : 'Error'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Excel/CSV File Format</h4>
            <p className="text-sm text-gray-600 mb-3">
              Your Excel or CSV file must contain ALL the following columns (even optional ones must be present as headers):
            </p>

            {/* Important Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-xs text-amber-800 font-medium">
                    All 6 columns must be present as headers, even if you leave optional values empty.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left font-medium text-gray-900 py-1">Column</th>
                    <th className="text-left font-medium text-gray-900 py-1">Description</th>
                    <th className="text-left font-medium text-gray-900 py-1">Required</th>
                    <th className="text-left font-medium text-gray-900 py-1">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-1 font-mono text-gray-700">SKU</td>
                    <td className="py-1 text-gray-600">Product SKU to find the product</td>
                    <td className="py-1 text-red-600 font-medium">Yes</td>
                    <td className="py-1 font-mono text-xs text-gray-500">C2391</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-mono text-gray-700">USER_ID</td>
                    <td className="py-1 text-gray-600">User ID to assign the discount</td>
                    <td className="py-1 text-red-600 font-medium">Yes</td>
                    <td className="py-1 font-mono text-xs text-gray-500">ea22587b-86cc...</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-mono text-gray-700">PRECIO</td>
                    <td className="py-1 text-gray-600">Special price amount</td>
                    <td className="py-1 text-red-600 font-medium">Yes</td>
                    <td className="py-1 font-mono text-xs text-gray-500">10</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-mono text-gray-700">VALIDO_DESDE</td>
                    <td className="py-1 text-gray-600">Valid from date (can be empty) - Format: YYYY-MM-DD</td>
                    <td className="py-1 text-orange-600 font-medium">Header Required</td>
                    <td className="py-1 font-mono text-xs text-gray-500">2025-01-01</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-mono text-gray-700">VALIDO_HASTA</td>
                    <td className="py-1 text-gray-600">Valid until date (can be empty) - Format: YYYY-MM-DD</td>
                    <td className="py-1 text-orange-600 font-medium">Header Required</td>
                    <td className="py-1 font-mono text-xs text-gray-500">2025-12-31</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-mono text-gray-700">ESTADO</td>
                    <td className="py-1 text-gray-600">Active status (can be empty) - activo/inactivo</td>
                    <td className="py-1 text-orange-600 font-medium">Header Required</td>
                    <td className="py-1 font-mono text-xs text-gray-500">activo</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Sample Data */}
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Sample File Content:</h5>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <table className="min-w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-1 px-2 bg-gray-50">SKU</th>
                      <th className="text-left py-1 px-2 bg-gray-50">USER_ID</th>
                      <th className="text-left py-1 px-2 bg-gray-50">PRECIO</th>
                      <th className="text-left py-1 px-2 bg-gray-50">VALIDO_DESDE</th>
                      <th className="text-left py-1 px-2 bg-gray-50">VALIDO_HASTA</th>
                      <th className="text-left py-1 px-2 bg-gray-50">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-1 px-2">C2391</td>
                      <td className="py-1 px-2">ea22587b-86cc-4d38...</td>
                      <td className="py-1 px-2">10</td>
                      <td className="py-1 px-2">2025-01-01</td>
                      <td className="py-1 px-2">2025-12-31</td>
                      <td className="py-1 px-2">activo</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2">C2392</td>
                      <td className="py-1 px-2">ea22587b-86cc-4d38...</td>
                      <td className="py-1 px-2">15</td>
                      <td className="py-1 px-2"></td>
                      <td className="py-1 px-2"></td>
                      <td className="py-1 px-2">inactivo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      );
    };

    // Usuarios Sub-tab Component
    const UsuariosSubTab = () => (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Usuarios
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Bulk user management and operations.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Coming Soon
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Bulk user operations will be available here soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    );

    // Define sub-tabs
    const subTabs: SubTab[] = [
      {
        id: 'precios-especiales',
        label: 'Precios Especiales',
        component: <PreciosEspecialesSubTab />
      },
      {
        id: 'usuarios',
        label: 'Usuarios',
        component: <UsuariosSubTab />
      }
    ];

    const activeSubTabData = subTabs.find(subTab => subTab.id === activeSubTab);

    return (
      <div className="space-y-6">
        {/* Sub-tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Sub-tabs">
            {subTabs.map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => setActiveSubTab(subTab.id)}
                className={`
                  group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm
                  ${activeSubTab === subTab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {subTab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Sub-tab Content */}
        <div>
          {activeSubTabData?.component}
        </div>
      </div>
    );
  };

  // Define tabs
  const tabs: Tab[] = [
    {
      id: 'admin-role',
      label: 'Admin Role',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      component: <AdminRoleTab />
    },
    {
      id: 'bulk',
      label: 'Bulk',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      component: <BulkTab />
    },
    {
      id: 'system-config',
      label: 'System Config',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      component: <SystemConfigTab />
    },
    {
      id: 'database-config',
      label: 'Database',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      component: <DatabaseConfigTab />
    },
    {
      id: 'api-config',
      label: 'API Config',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      component: <ApiConfigTab />
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.setup.title')}</h1>
        <p className="mt-2 text-gray-600">{t('admin.setup.subtitle')}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTabData?.component}
        </div>
      </div>
    </div>
  );
}