"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const mockKPIs = [
  { label: 'Usuarios activos', value: 120 },
  { label: 'Productos', value: 45 },
  { label: 'Ventas hoy', value: 32 },
];

const mockTable = [
  { id: 1, usuario: 'admin1', email: 'admin1@email.com', rol: 'admin' },
  { id: 2, usuario: 'user2', email: 'user2@email.com', rol: 'usuario' },
  { id: 3, usuario: 'user3', email: 'user3@email.com', rol: 'usuario' },
];

function ClientOnlyAdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && (!user.roles || !user.roles.includes('admin'))) {
      router.replace('/');
    }
  }, [user, router]);

  if (user === null) {
    return <div>Cargando...</div>;
  }
  if (!user.roles || !user.roles.includes('admin')) return null;

  return (
    <div>
      <h1>Bienvenido al Dashboard de Administrador</h1>
      <div style={{ display: 'flex', gap: 32, margin: '32px 0' }}>
        {mockKPIs.map(kpi => (
          <div key={kpi.label} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #0001', padding: 24, minWidth: 160 }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{kpi.value}</div>
            <div style={{ color: '#888', marginTop: 8 }}>{kpi.label}</div>
          </div>
        ))}
      </div>
      <h2>Usuarios recientes</h2>
      <table style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #0001', marginTop: 16 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 12 }}>ID</th>
            <th style={{ textAlign: 'left', padding: 12 }}>Usuario</th>
            <th style={{ textAlign: 'left', padding: 12 }}>Email</th>
            <th style={{ textAlign: 'left', padding: 12 }}>Rol</th>
          </tr>
        </thead>
        <tbody>
          {mockTable.map(row => (
            <tr key={row.id}>
              <td style={{ padding: 12 }}>{row.id}</td>
              <td style={{ padding: 12 }}>{row.usuario}</td>
              <td style={{ padding: 12 }}>{row.email}</td>
              <td style={{ padding: 12 }}>{row.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboardPage() {
  return <ClientOnlyAdminDashboard />;
}