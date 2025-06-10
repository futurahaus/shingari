'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface UserProfile extends Record<string, unknown> {
  nombre: string;
  apellidos: string;
  localidad: string;
  provincia: string;
  nombreComercial: string;
  pais: string;
  nombreFiscal: string;
  telefono: string;
  nif: string;
  direccionFiscal: string;
  direccionEntrega: string;
  cp: string;
  howDidYouKnowUs: string;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserProfile>({
    nombre: '',
    apellidos: '',
    localidad: '',
    provincia: '',
    nombreComercial: '',
    pais: 'España',
    nombreFiscal: '',
    telefono: '',
    nif: '',
    direccionFiscal: '',
    direccionEntrega: '',
    cp: '',
    howDidYouKnowUs: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await api.get<UserProfile>('/auth/me', { requireAuth: true });
        setFormData(prev => ({
          ...prev,
          nombre: data.nombre || prev.nombre,
          apellidos: data.apellidos || prev.apellidos,
          localidad: data.localidad || prev.localidad,
          provincia: data.provincia || prev.provincia,
          nombreComercial: data.nombreComercial || prev.nombreComercial,
          nombreFiscal: data.nombreFiscal || prev.nombreFiscal,
          telefono: data.telefono || prev.telefono,
          nif: data.nif || prev.nif,
          direccionFiscal: data.direccionFiscal || prev.direccionFiscal,
          direccionEntrega: data.direccionEntrega || prev.direccionEntrega,
          cp: data.cp || prev.cp,
          howDidYouKnowUs: data.howDidYouKnowUs || prev.howDidYouKnowUs
        }));
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
        if (err instanceof Error && err.message === 'Authentication required') {
          router.push('/login?from=/completar-perfil');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [accessToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await api.put('/auth/profile', formData, { requireAuth: true });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el perfil');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button
            onClick={() => router.push('/')}
            className="button mt-4 text-sm font-medium text-red-600 hover:text-red-500"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <div className="mb-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Completar Perfil
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Por favor, completa tu información para continuar
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700">
                Apellidos
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                value={formData.apellidos}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="localidad" className="block text-sm font-medium text-gray-700">
                Localidad
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
                Provincia
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
              <label htmlFor="nombreComercial" className="block text-sm font-medium text-gray-700">
                Nombre Comercial
              </label>
              <input
                type="text"
                id="nombreComercial"
                name="nombreComercial"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                value={formData.nombreComercial}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="pais" className="block text-sm font-medium text-gray-700">
                País
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
              <label htmlFor="nombreFiscal" className="block text-sm font-medium text-gray-700">
                Nombre Fiscal
              </label>
              <input
                type="text"
                id="nombreFiscal"
                name="nombreFiscal"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                value={formData.nombreFiscal}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="+034567890"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="nif" className="block text-sm font-medium text-gray-700">
                NIF
              </label>
              <input
                type="text"
                id="nif"
                name="nif"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                value={formData.nif}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="direccionFiscal" className="block text-sm font-medium text-gray-700">
                Dirección Fiscal
              </label>
              <input
                type="text"
                id="direccionFiscal"
                name="direccionFiscal"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                value={formData.direccionFiscal}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="direccionEntrega" className="block text-sm font-medium text-gray-700">
                Dirección de Entrega
              </label>
              <input
                type="text"
                id="direccionEntrega"
                name="direccionEntrega"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                value={formData.direccionEntrega}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="cp" className="block text-sm font-medium text-gray-700">
                C.P.
              </label>
              <input
                type="text"
                id="cp"
                name="cp"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="12345"
                value={formData.cp}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-2">¿Cómo nos conociste?</p>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="howDidYouKnowUs"
                  value="redes"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  checked={formData.howDidYouKnowUs === 'redes'}
                  onChange={handleChange}
                />
                <span className="ml-2 text-sm text-gray-600">Redes Sociales</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="howDidYouKnowUs"
                  value="recomendacion"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  checked={formData.howDidYouKnowUs === 'recomendacion'}
                  onChange={handleChange}
                />
                <span className="ml-2 text-sm text-gray-600">Recomendación</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="howDidYouKnowUs"
                  value="publicidad"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  checked={formData.howDidYouKnowUs === 'publicidad'}
                  onChange={handleChange}
                />
                <span className="ml-2 text-sm text-gray-600">Publicidad</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="howDidYouKnowUs"
                  value="otros"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  checked={formData.howDidYouKnowUs === 'otros'}
                  onChange={handleChange}
                />
                <span className="ml-2 text-sm text-gray-600">Otros</span>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="button w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Guardar Perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
