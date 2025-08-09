'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/app/ui/components/Button';
import { useTranslation } from '@/contexts/I18nContext';

export interface UserProfile extends Record<string, unknown> {
  nombre: string;
  apellidos: string;
  localidad: string;
  provincia: string;
  trade_name: string;
  pais: string;
  tax_name: string;
  telefono: string;
  tax_id: string;
  billing_address: string;
  shipping_address: string;
  cp: string;
  referral_source: string;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserProfile>({
    nombre: '',
    apellidos: '',
    localidad: '',
    provincia: '',
    trade_name: '',
    pais: t('dashboard.spain'),
    tax_name: '',
    telefono: '',
    tax_id: '',
    billing_address: '',
    shipping_address: '',
    cp: '',
    referral_source: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await api.get<UserProfile>('/auth/me');

        setFormData(prev => ({
          ...prev,
          nombre: data.nombre || prev.nombre,
          apellidos: data.apellidos || prev.apellidos,
          localidad: data.localidad || prev.localidad,
          provincia: data.provincia || prev.provincia,
          trade_name: data.trade_name || prev.trade_name,
          tax_name: data.tax_name || prev.tax_name,
          telefono: data.telefono || prev.telefono,
          tax_id: data.tax_id || prev.tax_id,
          billing_address: data.billing_address || prev.billing_address,
          shipping_address: data.shipping_address || prev.shipping_address,
          cp: data.cp || prev.cp,
          referral_source: data.referral_source || prev.referral_source
        }));
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : t('dashboard.profile_update_error'));
        if (err instanceof Error && err.message === 'Authentication required') {
          window.location.hash = '#login?from=/complete-profile';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [accessToken, router, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await api.put('/auth/profile', formData);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dashboard.profile_update_error'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const FormSkeleton = () => (
    <div className="flex-1 bg-white shadow-sm rounded-lg p-4 sm:p-6">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="pb-5 border-b border-gray-200 mb-6">
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>

        {/* Form Fields Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Radio Buttons Skeleton */}
        <div className="mt-6">
          <div className="h-4 bg-gray-200 rounded w-40 mb-3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="mt-6">
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  const ErrorContent = () => (
    <div className="flex-1 bg-white shadow-sm rounded-lg p-4 sm:p-6">
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-xl sm:text-2xl leading-6 font-medium text-gray-900">
          {t('dashboard.my_profile')}
        </h3>
      </div>
      <div className="mt-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-sm font-medium text-red-600 hover:text-red-500"
          >
            {t('dashboard.back_to_login')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-16 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        <Sidebar />
        {loading ? (
          <FormSkeleton />
        ) : error ? (
          <ErrorContent />
        ) : (
          <div className="flex-1 bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <div className="pb-5 border-b border-gray-200">
              <h3 className="text-xl sm:text-2xl leading-6 font-medium text-gray-900">
                {t('dashboard.my_profile')}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('complete_profile.subtitle')}
              </p>
            </div>

            <div className="mt-6">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Personal Information */}
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                      {t('profile.name')}
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700">
                      {t('profile.last_name')}
                    </label>
                    <input
                      type="text"
                      id="apellidos"
                      name="apellidos"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                      value={formData.apellidos}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="localidad" className="block text-sm font-medium text-gray-700">
                      {t('profile.city')}
                    </label>
                    <input
                      type="text"
                      id="localidad"
                      name="localidad"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      value={formData.localidad}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="provincia" className="block text-sm font-medium text-gray-700">
                      {t('profile.province')}
                    </label>
                    <input
                      type="text"
                      id="provincia"
                      name="provincia"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      value={formData.provincia}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="trade_name" className="block text-sm font-medium text-gray-700">
                      {t('profile.trade_name')}
                    </label>
                    <input
                      type="text"
                      id="trade_name"
                      name="trade_name"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      value={formData.trade_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="pais" className="block text-sm font-medium text-gray-700">
                      {t('profile.country')}
                    </label>
                    <input
                      type="text"
                      id="pais"
                      name="pais"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-gray-50"
                      value={formData.pais}
                      readOnly
                    />
                  </div>

                  <div>
                    <label htmlFor="tax_name" className="block text-sm font-medium text-gray-700">
                      {t('profile.tax_name')}
                    </label>
                    <input
                      type="text"
                      id="tax_name"
                      name="tax_name"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      value={formData.tax_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                      {t('profile.phone')}
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder={t('profile.phone_placeholder')}
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700">
                      {t('profile.tax_id')}
                    </label>
                    <input
                      type="text"
                      id="tax_id"
                      name="tax_id"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      value={formData.tax_id}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="billing_address" className="block text-sm font-medium text-gray-700">
                      {t('profile.billing_address')}
                    </label>
                    <input
                      type="text"
                      id="billing_address"
                      name="billing_address"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      value={formData.billing_address}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700">
                      {t('profile.shipping_address')}
                    </label>
                    <input
                      type="text"
                      id="shipping_address"
                      name="shipping_address"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      value={formData.shipping_address}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="cp" className="block text-sm font-medium text-gray-700">
                      {t('profile.postal_code')}
                    </label>
                    <input
                      type="text"
                      id="cp"
                      name="cp"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder={t('profile.postal_code_placeholder')}
                      value={formData.cp}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">{t('profile.how_did_you_find_us')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="referral_source"
                        value="redes"
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        checked={formData.referral_source === 'redes'}
                        onChange={handleChange}
                      />
                      <span className="ml-2 text-sm text-gray-600">{t('profile.social_media')}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="referral_source"
                        value="recomendacion"
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        checked={formData.referral_source === 'recomendacion'}
                        onChange={handleChange}
                      />
                      <span className="ml-2 text-sm text-gray-600">{t('profile.recommendation')}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="referral_source"
                        value="publicidad"
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        checked={formData.referral_source === 'publicidad'}
                        onChange={handleChange}
                      />
                      <span className="ml-2 text-sm text-gray-600">{t('profile.advertising')}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="referral_source"
                        value="otros"
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        checked={formData.referral_source === 'otros'}
                        onChange={handleChange}
                      />
                      <span className="ml-2 text-sm text-gray-600">{t('profile.others')}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    onPress={() => {}} // Form submit will handle this
                    testID="save-profile-button"
                    text={t('profile.save_profile')}
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
