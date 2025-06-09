import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface SidebarProps {
  className?: string;
  children?: ReactNode;
}

const navItems = [
  { label: 'Datos Personales', href: '/dashboard' },
  { label: 'Direcciones', href: '/dashboard/direcciones' },
  { label: 'Mis Compras', href: '/dashboard/compras' },
];

export default function Sidebar({ className = '', children }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`bg-white rounded-lg shadow-sm p-4 w-full max-w-xs ${className}`}>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${pathname === item.href ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-red-100'}`}
          >
            {item.label}
          </Link>
        ))}
        <form action="/logout" method="post">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100 mt-4 w-full text-left"
          >
            Cerrar Sesión
          </button>
        </form>
      </nav>
      {children}
    </aside>
  );
} 