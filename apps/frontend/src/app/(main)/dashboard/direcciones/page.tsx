'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { useTranslation } from '@/contexts/I18nContext';
import { api } from '@/lib/api';

interface UserProfile {
  nombre?: string;
  apellidos?: string;
  billing_address?: string;
  shipping_address?: string;
  city?: string;
  province?: string;
  country?: string;
  postal_code?: string;
  [key: string]: unknown;
}

const AddressCard = ({ 
  title, 
  address, 
  city, 
  province, 
  country, 
  postalCode 
}: { 
  title: string; 
  address?: string; 
  city?: string; 
  province?: string; 
  country?: string; 
  postalCode?: string; 
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-[4px] p-4">
      <div className="flex flex-col gap-1 mb-3">
        <h3 className="text-[14px] font-normal text-black leading-[1.29]">
          {title}
        </h3>
        <div className="text-[14px] font-normal text-[#545454] leading-[1.29]">
          {address ? (
            <>
              <div>{address}</div>
              <div>{postalCode && `${postalCode}, `}{city}{province && `, ${province}`}</div>
              <div>{country}</div>
            </>
          ) : (
            <div className="text-gray-400 italic">
              {t('dashboard.no_address_configured')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DireccionesPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await api.get<UserProfile>('/auth/me');
        setUser(userData);
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        setError(t('dashboard.error_loading_user'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [t]);

  if (loading) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="flex gap-8">
          <Sidebar />
          <div className="flex-1 bg-white shadow-sm rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="flex gap-8">
          <Sidebar />
          <div className="flex-1 bg-white shadow-sm rounded-lg p-6">
            <div className="text-red-600 text-center py-8">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-16 py-12">
      <div className="flex gap-8">
        <Sidebar />
        <div className="flex-1 bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">{t('dashboard.addresses')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AddressCard
              title={t('dashboard.billing_address')}
              address={user?.billing_address}
              city={user?.city}
              province={user?.province}
              country={user?.country}
              postalCode={user?.postal_code}
            />
            
            <AddressCard
              title={t('dashboard.shipping_address')}
              address={user?.shipping_address}
              city={user?.city}
              province={user?.province}
              country={user?.country}
              postalCode={user?.postal_code}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 