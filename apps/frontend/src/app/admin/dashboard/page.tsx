"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/contexts/I18nContext";
import { api } from "@/lib/api";

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

export default function AdminDashboardPage() {
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
            {t("admin.dashboard.title")}
          </h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600">
            {t("admin.dashboard.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
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
            {t("admin.dashboard.title")}
          </h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600">
            {t("admin.dashboard.subtitle")}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { kpis } = data;

  const kpiItems = [
    {
      label: t("admin.dashboard.kpis.total_users"),
      value: kpis.totalUsers,
      change: kpis.totalUsersChange,
    },
    {
      label: t("admin.dashboard.kpis.new_users"),
      value: kpis.newUsersThisMonth,
      change: kpis.newUsersChange,
    },
    {
      label: t("admin.dashboard.kpis.total_orders"),
      value: kpis.totalOrders,
      change: kpis.totalOrdersChange,
    },
    {
      label: t("admin.dashboard.kpis.sales_today"),
      value: kpis.ordersToday,
      change: kpis.ordersTodayChange,
    },
    {
      label: t("admin.dashboard.kpis.monthly_revenue"),
      value: `€${kpis.monthlyRevenue.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      change: kpis.monthlyRevenueChange,
    },
    {
      label: t("admin.dashboard.kpis.avg_ticket"),
      value: `€${kpis.avgTicket.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: kpis.avgTicketChange,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          {t("admin.dashboard.title")}
        </h1>
        <p className="mt-2 text-sm lg:text-base text-gray-600">
          {t("admin.dashboard.subtitle")}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiItems.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
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

      {/* Link to Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-base font-medium text-gray-900 mb-2">
          {t("admin.analytics.title")}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t("admin.analytics.subtitle")}
        </p>
        <Link
          href="/admin/analytics"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          {t("admin.sidebar.analytics")} →
        </Link>
      </div>
    </div>
  );
}
