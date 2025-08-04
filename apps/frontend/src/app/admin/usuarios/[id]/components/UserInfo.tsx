import React, { useEffect, useState } from "react";
import { api } from '@/lib/api';

interface UserDetails {
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

interface UserInfoProps {
  userId: string;
  onUserLoaded?: (user: UserDetails) => void;
}

export const UserInfo: React.FC<UserInfoProps> = ({ userId, onUserLoaded }) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    api.get(`/user/admin/${userId}`)
      .then((userRes) => {
        const userData = userRes as UserDetails;
        setUser(userData);
        onUserLoaded?.(userData);
      })
      .catch((err) => {
        const error = err instanceof Error ? err.message : 'Unknown error';
        setError('Error al cargar los datos del usuario: ' + error);
      })
      .finally(() => setLoading(false));
  }, [userId, onUserLoaded]);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="h-6 bg-gray-300 rounded w-48 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-gray-200 pb-6">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index}>
              <div className="h-3 bg-gray-300 rounded w-16 mb-2 animate-pulse"></div>
              <div className="h-5 bg-gray-300 rounded w-24 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mb-8">
        <div className="text-gray-500">Usuario no encontrado.</div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Información del Cliente</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-gray-200 pb-6">
        <div>
          <div className="text-xs text-gray-500">ID Interno</div>
          <div className="font-medium text-gray-900">#{user.internal_id}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Nombre</div>
          <div className="font-medium text-gray-900">{(user.first_name || '') + ' ' + (user.last_name || '')}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Business Name</div>
          <div className="font-medium text-gray-900">{user.trade_name || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Ciudad</div>
          <div className="font-medium text-gray-900">{user.city || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Provincia</div>
          <div className="font-medium text-gray-900">{user.province || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">País</div>
          <div className="font-medium text-gray-900">{user.country || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Teléfono</div>
          <div className="font-medium text-gray-900">{user.phone || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Perfil Completo</div>
          <div className="font-medium text-gray-900">{user.profile_is_complete ? 'Sí' : 'No'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Roles</div>
          <div className="font-medium text-gray-900">
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
              'Sin roles asignados'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 