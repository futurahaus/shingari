'use client';

import Link from 'next/link';
import { Text } from '@/app/ui/components/Text';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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
                Categorías
              </Text>
            </Link>
            
            <Link href="/about-us" className="flex flex-1 items-center justify-center h-full text-white hover:opacity-80 transition-opacity">
              <Text as="span" size="md" color="white">
                Sobre Shingari
              </Text>
            </Link>
            
            <Link href="/contacto" className="flex flex-1 items-center justify-center h-full text-white hover:opacity-80 transition-opacity">
              <Text as="span" size="md" color="white">
                Contacto
              </Text>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex justify-end w-full">
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMenu}
              className="text-white p-2 focus:outline-none"
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
          <div className="md:hidden relative top-0 left-0 right-0 bg-white z-50">
            <div className="bg-primary">
              <Link 
                href="/products" 
                onClick={closeMenu}
                className="block py-3 text-gray-800 hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                    <rect y="5" width="24" height="2" rx="1" fill="currentColor" />
                    <rect y="11" width="24" height="2" rx="1" fill="currentColor" />
                    <rect y="17" width="24" height="2" rx="1" fill="currentColor" />
                  </svg>
                  <Text as="span" size="md" color="white">
                    Categorías
                  </Text>
                </div>
              </Link>
              <Link 
                href="/about-us" 
                onClick={closeMenu}
                className="block py-3 text-gray-800 hover:text-primary transition-colors"
              >
                <Text as="span" size="md" color="white">
                  Sobre Shingari
                </Text>
              </Link>
              <Link 
                href="/contacto" 
                onClick={closeMenu}
                className="block py-3 text-white hover:text-primary transition-colors"
              >
                <Text as="span" size="md" color="white">
                  Contacto
                </Text>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}