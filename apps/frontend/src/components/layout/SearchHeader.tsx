'use client';

import Link from 'next/link';
import { FaSearch } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import LoginModal from '@/components/auth/LoginModal';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/ui/components/Button';
import { useCart } from '@/contexts/CartContext';

export default function SearchHeader() {
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();
  const { openCart, cart } = useCart();

  return (
    <>
      <div className="bg-white py-4">
        <div className="mx-auto px-4 sm:px-6 lg:px-16">
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
                <Button
                  onPress={() => router.push('/dashboard')}
                  type="primary"
                  text="Mi perfil"
                  testID="profile-button"
                  icon="FaUser"
                  textProps={{
                    size: 'sm',
                  }}
                  inline={true}
                />
              ) : (
                <Button
                  onPress={() => setIsLoginModalOpen(true)}
                  type="primary"
                  text="Iniciar sesión"
                  testID="login-button"
                  icon="FaUser"
                  textProps={{
                    size: 'sm',
                  }}
                  inline={true}
                />
              )}
              <div className="relative">
                <Button
                  onPress={openCart}
                  type="primary"
                  testID="cart-button"
                  icon="FaShoppingCart"
                  textProps={{
                    size: 'sm',
                  }}
                  inline={true}
                />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {cart.length}
                  </span>
                )}
              </div>
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