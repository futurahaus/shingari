'use client';

import Link from 'next/link';
import { FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
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
                <input
                  type="text"
                  placeholder="¿Qué estás buscando?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500">
                  <FaSearch />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-red-600"
                  >
                    <FaUser className="h-5 w-5" />
                    <span>{user.email}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-sm font-medium text-white bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-sm font-medium text-white bg-red-600 px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Iniciar sesión
                </button>
              )}
              <button className="text-gray-600 hover:text-red-500">
                <FaShoppingCart className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}