"use client";
import React from 'react';

const mockKPIs = [
  { label: 'Usuarios activos', value: 120, change: '+12%', changeType: 'positive' },
  { label: 'Productos', value: 45, change: '+5%', changeType: 'positive' },
  { label: 'Ventas hoy', value: 32, change: '-3%', changeType: 'negative' },
  { label: 'Ingresos mensuales', value: '€12,450', change: '+8%', changeType: 'positive' },
];

const mockTable = [
  { id: 1, usuario: 'admin1', email: 'admin1@email.com', rol: 'admin', estado: 'Activo' },
  { id: 2, usuario: 'user2', email: 'user2@email.com', rol: 'usuario', estado: 'Activo' },
  { id: 3, usuario: 'user3', email: 'user3@email.com', rol: 'usuario', estado: 'Inactivo' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard de Administrador</h1>
        <p className="mt-2 text-sm lg:text-base text-gray-600">Resumen general de la plataforma</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {mockKPIs.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">{kpi.label}</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
              </div>
              <div className={`text-xs lg:text-sm font-medium ${
                kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.change}
              </div>
            </div>
          </div>
        ))}
      </div>

            {/* Recent Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base lg:text-lg font-medium text-gray-900">Usuarios Recientes</h2>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockTable.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.usuario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      row.rol === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {row.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      row.estado === 'Activo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {row.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {mockTable.map(row => (
            <div key={row.id} className="p-4 border-b border-gray-200 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">#{row.id}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    row.rol === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {row.rol}
                  </span>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  row.estado === 'Activo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {row.estado}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">{row.usuario}</p>
                <p className="text-xs text-gray-500">{row.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}