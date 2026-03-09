"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "@/contexts/I18nContext";
import { api } from "@/lib/api";

const AnalyticsDashboardContent = dynamic(
  () => import("./AnalyticsDashboardContent").then((mod) => ({ default: mod.AnalyticsDashboardContent })),
  { ssr: false }
);

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

  return <AnalyticsDashboardContent data={data} t={t} />;
}
