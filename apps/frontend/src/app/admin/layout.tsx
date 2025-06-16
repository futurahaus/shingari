"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Users, Boxes, Settings, LogOut } from 'lucide-react';

const sidebarOptions = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: <Home className="w-5 h-5 text-gray-400" /> },
  { name: 'Usuarios', path: '/admin/usuarios', icon: <Users className="w-5 h-5 text-gray-400" /> },
  { name: 'Productos', path: '/admin/productos', icon: <Boxes className="w-5 h-5 text-gray-400" /> },
  { name: 'Configuración', path: '/admin/setup', icon: <Settings className="w-5 h-5 text-gray-400" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Only check authentication after the auth context has finished loading
    if (!isLoading && !isLoggingOut) {
      console.log('Admin Layout - Auth Check:', {
        user: user ? { id: user.id, email: user.email, roles: user.roles } : null,
        isLoading
      });

      if (!user) {
        console.log('Admin Layout - No user found, redirecting to login');
        router.push(`/#login?from=${encodeURIComponent(pathname)}`);
        return;
      }

      // For now, allow business users to access admin panel
      // TODO: Create proper admin role in the system
      if (!user.roles || (!user.roles.includes('business') && !user.roles.includes('admin'))) {
        console.log('Admin Layout - User does not have required roles:', user.roles);
        router.push('/');
        return;
      }

      console.log('Admin Layout - User authenticated, showing admin panel');
    }
  }, [user, router, pathname, isLoading, isLoggingOut]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    router.push('/');
  };

  // Show loading while auth context is loading or user is not authenticated
  if (isLoading || !user || (!user.roles || (!user.roles.includes('business') && !user.roles.includes('admin')))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Render admin layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      {/* <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Shingari Admin</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Bienvenido, {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav> */}

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen flex flex-col justify-between">
          <nav className="mt-8 flex-1 flex flex-col justify-between">
            <div className="px-4">
              <ul className="space-y-2">
                {sidebarOptions.map(option => (
                  <li key={option.path}>
                    <Link href={option.path} legacyBehavior>
                      <a className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                        pathname === option.path
                          ? 'bg-red-50 text-red-700 border-r-2 border-red-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}>
                        <span className="mr-3">
                          {option.icon}
                        </span>
                        {option.name}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-4 mb-6">
              <div className="mb-4">
                <span className="block text-xs text-gray-400 mb-1">Bienvenido,</span>
                <span className="block text-sm font-semibold text-gray-700">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-red-50 hover:text-red-700"
              >
                <span className="mr-3">
                  <LogOut className="w-5 h-5 text-gray-400" />
                </span>
                Cerrar Sesión
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}