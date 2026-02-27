"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/contexts/I18nContext";
import { api } from "@/lib/api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DashboardAnalytics {
  kpis: {
    totalUsers: number;
    totalUsersChange: number;
    newUsersThisMonth: number;
    newUsersChange: number;
    totalOrders: number;
    totalOrdersChange: number;
    ordersToday: number;
    ordersTodayChange: number;
    monthlyRevenue: number;
    monthlyRevenueChange: number;
    avgTicket: number;
    avgTicketChange: number;
  };
  monthlyRevenue: Array<{ month: string; revenue: number; year: number }>;
  ordersPerMonth: Array<{ month: string; count: number; year: number }>;
  usersPerMonth: Array<{ month: string; count: number; year: number }>;
  orderStatusDistribution: Array<{ status: string; count: number }>;
  topProducts: Array<{
    productId: number;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  topClients: Array<{
    userId: string;
    email: string;
    totalBilled: number;
    orderCount: number;
  }>;
  inactiveUsers: Array<{
    id: string;
    email: string;
    lastSignIn: string | null;
    daysInactive: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    userEmail?: string;
  }>;
}

function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change}%`;
}

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  accepted: "#3b82f6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export default function AdminAnalyticsPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<DashboardAnalytics>("/analytics/dashboard");
        setData(res);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(t("admin.dashboard.error_loading_data"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {t("admin.analytics.title")}
          </h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600">
            {t("admin.analytics.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-80 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {t("admin.analytics.title")}
          </h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600">
            {t("admin.analytics.subtitle")}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const revenueChartData = data.monthlyRevenue.map((r) => ({
    name: `${r.month} ${r.year}`,
    revenue: r.revenue,
    ingresos: r.revenue,
  }));

  const ordersChartData = data.ordersPerMonth.map((r) => ({
    name: `${r.month} ${r.year}`,
    count: r.count,
    pedidos: r.count,
  }));

  const usersChartData = data.usersPerMonth.map((r) => ({
    name: `${r.month} ${r.year}`,
    count: r.count,
    usuarios: r.count,
  }));

  const statusChartData = data.orderStatusDistribution.map((s) => ({
    name: t(`order_status.${s.status}`) || s.status,
    value: s.count,
    fill: STATUS_COLORS[s.status] ?? "#6b7280",
  }));

  const topProductsData = data.topProducts.map((p, i) => ({
    name: p.productName.length > 30 ? p.productName.slice(0, 30) + "…" : p.productName,
    quantity: p.quantity,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="space-y-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          {t("admin.analytics.title")}
        </h1>
        <p className="mt-2 text-sm lg:text-base text-gray-600">
          {t("admin.analytics.subtitle")}
        </p>
        <Link
          href="/admin/dashboard"
          className="mt-4 inline-flex text-sm font-medium text-red-600 hover:text-red-700"
        >
          ← {t("admin.analytics.back_to_dashboard")}
        </Link>
      </div>

      {/* KPIs: nuevos usuarios, crecimiento, etc. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: t("admin.dashboard.kpis.total_users"), value: data.kpis.totalUsers, change: data.kpis.totalUsersChange },
          { label: t("admin.dashboard.kpis.new_users"), value: data.kpis.newUsersThisMonth, change: data.kpis.newUsersChange },
          { label: t("admin.dashboard.kpis.total_orders"), value: data.kpis.totalOrders, change: data.kpis.totalOrdersChange },
          { label: t("admin.dashboard.kpis.sales_today"), value: data.kpis.ordersToday, change: data.kpis.ordersTodayChange },
          { label: t("admin.dashboard.kpis.monthly_revenue"), value: `€${data.kpis.monthlyRevenue.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, change: data.kpis.monthlyRevenueChange },
          { label: t("admin.dashboard.kpis.avg_ticket"), value: `€${data.kpis.avgTicket.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: data.kpis.avgTicketChange },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <p className="text-xs font-medium text-gray-600">{kpi.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{kpi.value}</p>
            <p
              className={`text-xs font-medium mt-1 ${
                kpi.change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatChange(kpi.change)}
            </p>
          </div>
        ))}
      </div>

      {/* Ingresos mensuales - gráfico mejorado */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("admin.dashboard.charts.monthly_revenue")}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${v}`} />
              <Tooltip
                formatter={(value: number | undefined) => value != null ? [`€${value.toLocaleString("es-ES")}`, t("admin.dashboard.charts.monthly_revenue")] : null}
                contentStyle={{ borderRadius: "8px" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pedidos por mes - gráfico de barras mejorado */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("admin.dashboard.charts.orders_per_month")}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px" }} />
              <Bar dataKey="count" name={t("admin.dashboard.charts.orders_count")} fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estado de pedidos + Top productos - lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("admin.dashboard.charts.order_status")}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}
                >
                  {statusChartData.map((_, i) => (
                    <Cell key={i} fill={statusChartData[i].fill} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number | undefined) => value != null ? [value, t("admin.dashboard.table.status")] : null} contentStyle={{ borderRadius: "8px" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("admin.dashboard.charts.top_products")}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProductsData}
                layout="vertical"
                margin={{ left: 10, right: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip contentStyle={{ borderRadius: "8px" }} />
                <Bar dataKey="quantity" name={t("admin.dashboard.charts.orders_count")} radius={[0, 6, 6, 0]}>
                  {topProductsData.map((_, i) => (
                    <Cell key={i} fill={topProductsData[i].fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Crecimiento de usuarios - gráfico de líneas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("admin.dashboard.charts.user_growth")}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={usersChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px" }} />
              <Line
                type="monotone"
                dataKey="count"
                name={t("admin.dashboard.charts.user_growth")}
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top clientes + Usuarios inactivos + Últimos pedidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("admin.dashboard.charts.top_clients")}
          </h3>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.dashboard.table.email")}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t("admin.dashboard.charts.orders_count")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.topClients.map((c, i) => (
                  <tr key={c.userId}>
                    <td className="px-3 py-2 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 truncate max-w-[120px]">{c.email}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">€{c.totalBilled.toLocaleString("es-ES")}</td>
                    <td className="px-3 py-2 text-sm text-gray-500 text-right">{c.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.topClients.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">Sin datos</p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("admin.dashboard.charts.inactive_users")}
          </h3>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.dashboard.table.email")}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t("admin.dashboard.charts.no_activity_days")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.inactiveUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="px-3 py-2 text-sm text-gray-900 truncate max-w-[150px]">{u.email}</td>
                    <td className="px-3 py-2 text-sm text-gray-500 text-right">{u.daysInactive >= 999 ? "—" : u.daysInactive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.inactiveUsers.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">Sin usuarios inactivos</p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("admin.dashboard.charts.recent_orders")}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t("admin.dashboard.table.status")}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">{o.orderNumber}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">€{o.totalAmount.toLocaleString("es-ES")}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          o.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : o.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : o.status === "accepted"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {t(`order_status.${o.status}`) || o.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString("es-ES")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.recentOrders.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">Sin pedidos recientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
