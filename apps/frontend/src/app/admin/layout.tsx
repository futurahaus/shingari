"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarOptions = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Usuarios', path: '/admin/usuarios' },
  { name: 'Productos', path: '/admin/productos' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#f5f5f5', padding: 24 }}>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {sidebarOptions.map(option => (
              <li key={option.path} style={{ margin: '16px 0' }}>
                <Link href={option.path} legacyBehavior>
                  <a style={{
                    color: pathname === option.path ? '#1976d2' : '#222',
                    fontWeight: pathname === option.path ? 'bold' : 'normal',
                    textDecoration: 'none',
                  }}>
                    {option.name}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 32 }}>{children}</main>
    </div>
  );
}