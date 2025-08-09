'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { User, MapPin, ShoppingBag, LogOut, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';

interface SidebarProps {
  className?: string;
  children?: ReactNode;
}

export default function Sidebar({ className = '', children }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { label: t('navigation.personal_data'), href: '/dashboard', icon: User },
    { label: t('navigation.profile'), href: '/complete-profile', icon: UserCheck },
    { label: t('navigation.addresses'), href: '/dashboard/direcciones', icon: MapPin },
    { label: t('navigation.my_orders'), href: '/dashboard/compras', icon: ShoppingBag },
  ];

  return (
    <aside className={`bg-white w-full max-w-xs hidden md:block ${className}`}>
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
          {t('navigation.logout')}
        </button>
      </nav>
      {children}
    </aside>
  );
} 