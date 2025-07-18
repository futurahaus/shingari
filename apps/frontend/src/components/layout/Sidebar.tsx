'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { User, MapPin, ShoppingBag, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  className?: string;
  children?: ReactNode;
}

const navItems = [
  { label: 'Datos Personales', href: '/dashboard', icon: User },
  { label: 'Mi perfil', href: '/complete-profile' },
  { label: 'Direcciones', href: '/dashboard/direcciones', icon: MapPin },
  { label: 'Mis Compras', href: '/dashboard/compras', icon: ShoppingBag },
];

export default function Sidebar({ className = '', children }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className={`bg-white w-full max-w-xs ${className}`}>
      <nav className="flex flex-col gap-2 justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors
                ${pathname === item.href ? 'text-white' : 'text-gray-700 hover:bg-red-100'}`}
              style={pathname === item.href ? { backgroundColor: 'var(--color-primary)' } : {}}
            >
              {Icon && <Icon size={20} />}
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors text-gray-700 hover:bg-red-100 cursor-pointer"
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </nav>
      {children}
    </aside>
  );
}