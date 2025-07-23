"use client";
import React from "react";
import Link from "next/link";
import { Text } from "@/app/ui/components/Text";
import { ProductsListSkeleton } from "../productos/components/ProductsListSkeleton";
import { useAdminOrders } from "./hooks/useAdminOrders.hook";

export default function AdminOrdersPage() {
  const { orders, loading, error } = useAdminOrders({ page: 1 });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Text size="3xl" weight="bold" color="gray-900" as="h1">
            Pedidos
          </Text>
        </div>
        <Text size="sm" weight="normal" color="gray-500" as="p" className="mb-4">
          Gestión de pedidos realizados en la plataforma
        </Text>
      </div>
      {loading ? (
        <ProductsListSkeleton />
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.user_id || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€{Number(order.total_amount).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === "Completada" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/admin/pedidos/${order.id}`} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer">
                      Ver Detalles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}