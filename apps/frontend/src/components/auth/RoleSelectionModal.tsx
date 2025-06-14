'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onRoleSelected: (role: string) => void;
  userId: string;
}

export default function RoleSelectionModal({
  isOpen,
  onRoleSelected,
  userId
}: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<'consumer' | 'business' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = async (role: 'consumer' | 'business') => {
    setSelectedRole(role);
    setIsLoading(true);
    setError(null);

    try {
      // Call the backend to assign the role
      await api.post('/auth/assign-role', {
        userId,
        role
      });

      onRoleSelected(role);
    } catch (err) {
      console.error('Error assigning role:', err);
      setError(err instanceof Error ? err.message : 'Error al asignar el rol');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Bienvenido! Por favor selecciona tu rol
          </h2>
          <p className="text-gray-600 mb-6">
            Esto nos ayudará a personalizar tu experiencia. Puedes cambiar esto más tarde en la configuración de tu perfil.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Consumer Option */}
            <button
              onClick={() => handleRoleSelect('consumer')}
              disabled={isLoading}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 ${selectedRole === 'consumer'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Consumidor Final</h3>
                  <p className="text-sm text-gray-600">Quiero navegar y comprar productos</p>
                </div>
              </div>
            </button>

            {/* Business Option */}
            <button
              onClick={() => handleRoleSelect('business')}
              disabled={isLoading}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 ${selectedRole === 'business'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Empresa</h3>
                  <p className="text-sm text-gray-600">Quiero vender productos y gestionar mi negocio</p>
                </div>
              </div>
            </button>
          </div>

          {isLoading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
              <span className="ml-2 text-sm text-gray-600">Asignando rol...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}