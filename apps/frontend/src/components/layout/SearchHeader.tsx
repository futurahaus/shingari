'use client';

import Link from 'next/link';
import { FaSearch, FaShoppingCart, FaUser, FaCog } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import LoginModal from '@/components/auth/LoginModal';

export default function SearchHeader() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-red-600 font-bold text-xl">
              SHINGARI
            </Link>

            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  placeholder="Buscar"
                  className="w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 bg-[color:var(--search-background)]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-red-600"
                  >
                    <FaUser className="h-4 w-4" />
                    <span>{user.email}</span>
                  </Link>

                  {user.roles?.includes('admin') && (
                      <Link href="/admin/dashboard" className="ml-2 text-gray-500 hover:text-red-600" title="Admin Dashboard">
                        <FaCog className="h-4 w-4" />
                      </Link>
                    )}
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="button text-sm font-medium text-white bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="button text-sm font-medium text-white bg-red-600 px-4 py-2 rounded-md hover:bg-red-700"
                >
                  <FaUser className="h-4 w-4" />
                  Iniciar sesión
                </button>
              )}
              <button className="button text-gray-600 hover:text-red-500">
                <FaShoppingCart className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectPath={null}
      />
    </>
  );
}