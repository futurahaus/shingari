'use client';

import Link from 'next/link';
import { FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import LoginModal from '@/components/auth/LoginModal';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SearchHeader() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="bg-white py-4">
        <div className="mx-auto px-8 sm:px-6 lg:px-16">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-red-600 font-bold text-xl flex items-center gap-2">
              <Image src="/shingari.svg" alt="Shingari logo" width={105} height={24} priority />
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
                  <button
                    onClick={() => router.push('/dashboard')} disabled={false}
                    className="button"
                  >
                    <FaUser className="h-4 w-4" />
                    Mi perfil
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="button"

                >
                  <FaUser className="h-4 w-4" />
                  Iniciar sesión
                </button>
              )}
              <button className="button h-12 w-12" >
                <FaShoppingCart className="h-4 w-4" />
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