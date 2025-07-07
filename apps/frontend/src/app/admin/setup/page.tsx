"use client";
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function AdminSetupPage() {
  const { user } = useAuth();
  const [isAssigning, setIsAssigning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assignAdminRoleToSelf = async () => {
    if (!user) {
      setError('No hay usuario autenticado');
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

      setMessage('¡Rol de administrador asignado exitosamente! Ahora puedes acceder al panel de administración.');
      
      // Refresh the page after a short delay to update the user context
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error assigning admin role:', err);
      setError(err instanceof Error ? err.message : 'Error al asignar rol de administrador');
    } finally {
      setIsAssigning(false);
    }
  };

  const isAdmin = user?.roles?.includes('admin');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Administrador</h1>
        <p className="mt-2 text-gray-600">Configura el acceso al panel de administración</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Usuario Actual</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Email: <span className="font-medium text-gray-900">{user?.email}</span></p>
            <p className="text-sm text-gray-600">ID: <span className="font-medium text-gray-900">{user?.id}</span></p>
            <p className="text-sm text-gray-600">Roles: 
              <span className="font-medium text-gray-900 ml-1">
                {user?.roles?.join(', ') || 'Ninguno'}
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
                  ¡Ya tienes permisos de administrador!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Puedes acceder al panel de administración en <a href="/admin/dashboard" className="underline">/admin/dashboard</a>
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
                    No tienes permisos de administrador
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Haz clic en el botón de abajo para asignarte el rol de administrador.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={assignAdminRoleToSelf}
              disabled={isAssigning}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              {isAssigning ? 'Asignando rol...' : 'Asignarme Rol de Administrador'}
            </button>
          </div>
        )}

        {message && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Información:</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Esta página te permite asignarte el rol de administrador</li>
          <li>Una vez asignado, tendrás acceso completo al panel de administración</li>
          <li>El rol de administrador te permite gestionar usuarios, productos y configuraciones</li>
          <li>Después de asignar el rol, serás redirigido automáticamente</li>
        </ul>
      </div>
    </div>
  );
} 