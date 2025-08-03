'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';

interface UserData {
  id: string;
  email: string;
  [key: string]: unknown;
}

export default function DashboardPage() {
  const router = useRouter();
  const { logout, accessToken } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!accessToken) {
      window.location.hash = '#login?from=/dashboard';
      return;
    }

    const fetchUserData = async () => {
      try {
        const data = await api.get<UserData>('/auth/me');
        setUserData(data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
        if (err instanceof Error && err.message === 'Authentication required') {
          logout();
          window.location.hash = '#login?from=/dashboard';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [accessToken, logout, router]);

  const DashboardSkeleton = () => (
    <div className="flex-1 bg-white shadow-sm rounded-lg p-6 animate-pulse">
      <div className="pb-5 border-b border-gray-200">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
      </div>

      <div className="mt-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-8 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-16 py-12">
      <div className="flex gap-8">
        <Sidebar />
        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <div className="flex-1 bg-white shadow-sm rounded-lg p-6">
            <div className="pb-5 border-b border-gray-200">
              <h3 className="text-2xl leading-6 font-medium text-gray-900">
                Panel de Control
              </h3>
            </div>
            <div className="mt-6">
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                <p>{error}</p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white shadow-sm rounded-lg p-6">
            <div className="pb-5 border-b border-gray-200">
              <h3 className="text-2xl leading-6 font-medium text-gray-900">
                Panel de Control
              </h3>
            </div>

            <div className="mt-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Información del Usuario
                </h4>
                {userData && (
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.id}</dd>
                    </div>
                    {/* Add more user data fields as needed */}
                  </dl>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={logout}
                  className="button inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}