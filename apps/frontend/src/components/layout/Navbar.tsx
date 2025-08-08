'use client';

import Link from 'next/link';
import { Text } from '@/app/ui/components/Text';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, MapPin, ShoppingBag } from 'lucide-react';
import { api } from '@/lib/api';
import { UserProfile } from '@/app/(main)/complete-profile/page';
import { useTranslation } from '@/contexts/I18nContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const { user: authUser } = useAuth();
  const { t } = useTranslation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Fetch user data from auth/me endpoint
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.get<UserProfile>('/auth/me');
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      }
    };

    if (authUser) {
      fetchUser();
    } else {
      setUser(null);
    }
  }, [authUser]);

  // Sidebar navigation items for logged users
  const sidebarItems = [
    { label: t('navigation.dashboard'), href: '/dashboard', icon: User },
    { label: t('navigation.profile'), href: '/complete-profile' },
    { label: 'Direcciones', href: '/dashboard/direcciones', icon: MapPin },
    { label: 'Mis Compras', href: '/dashboard/compras', icon: ShoppingBag },
  ];

  return (
    <nav className="main-navbar">
      <div className="px-4 sm:px-6 lg:px-16">
        <div className="flex justify-between items-center h-12">
          {/* Desktop Navigation */}
          <div className="hidden md:flex w-full h-12 items-center">
            <Link href="/products" className="flex flex-1 items-center flex-stat h-full gap-2 text-white hover:opacity-80 transition-opacity">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                <rect y="5" width="24" height="2" rx="1" fill="currentColor" />
                <rect y="11" width="24" height="2" rx="1" fill="currentColor" />
                <rect y="17" width="24" height="2" rx="1" fill="currentColor" />
              </svg>
              <Text as="span" size="md" color="white">
                {t('navigation.products')}
              </Text>
            </Link>

            <Link href="/about-us" className="flex flex-1 items-center justify-center h-full text-white hover:opacity-80 transition-opacity">
              <Text as="span" size="md" color="white">
                {t('navigation.about')}
              </Text>
            </Link>

            <Link href="/contacto" className="flex flex-1 items-center justify-center h-full text-white hover:opacity-80 transition-opacity">
              <Text as="span" size="md" color="white">
                {t('navigation.contact')}
              </Text>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex justify-end w-full">
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMenu}
              className="text-white py-2 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden relative top-0 left-0 right-0 bg-white z-50 mb-4">
            <div className="bg-primary">
              {/* Main Navigation Links */}
              <Link
                href="/products"
                onClick={closeMenu}
                className="block py-3 hover:bg-primary-dark transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Text as="span" size="md" color="white">
                    {t('navigation.products')}
                  </Text>
                </div>
              </Link>
              <Link
                href="/about-us"
                onClick={closeMenu}
                className="block py-3 hover:bg-primary-dark transition-colors"
              >
                <Text as="span" size="md" color="white">
                  {t('navigation.about')}
                </Text>
              </Link>
              <Link
                href="/contacto"
                onClick={closeMenu}
                className="block py-3 hover:bg-primary-dark transition-colors"
              >
                <Text as="span" size="md" color="white">
                  {t('navigation.contact')}
                </Text>
              </Link>

              {/* User Dashboard Links - Only show if user is logged in */}
              {user && (
                <>
                  <div className="border-t border-white/20 my-2"></div>
                  {sidebarItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="block py-3 hover:bg-primary-dark transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon && <item.icon className="w-5 h-5 text-white" />}
                        <Text as="span" size="md" color="white">
                          {item.label}
                        </Text>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}