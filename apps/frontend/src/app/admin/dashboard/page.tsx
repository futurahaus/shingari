"use client";
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { api } from '../../../lib/api';

interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  roles: string[];
  meta_data: Record<string, unknown>;
  first_name: string;
  last_name: string;
  trade_name: string;
  city: string;
  province: string;
  country: string;
  phone: string;
  profile_is_complete: boolean;
  internal_id?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount: number;
  stock?: number;
  units_per_box?: number;
  createdAt: string;
  updatedAt: string;
  images: string[];
  sku: string;
  categories?: string[];
  wholesalePrice?: number;
  status?: string;
  unit_id?: number;
  unit_name?: string;
  iva?: number;
  translations?: Array<{
    id: number;
    product_id: number;
    locale: string;
    name: string;
    description?: string;
  }>;
}

interface Order {
  id: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  user_trade_name?: string;
  status: string;
  total_amount: number;
  currency: string;
  order_number?: string;
  created_at: string;
  updated_at: string;
  order_lines: Array<{
    id: string;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_image?: string;
  }>;
  order_addresses: Array<{
    id: string;
    type: string;
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
    phone?: string;
  }>;
  order_payments: Array<{
    id: string;
    payment_method: string;
    status: string;
    paid_at?: string;
    amount: number;
    transaction_id?: string;
    metadata?: Record<string, unknown>;
  }>;
}

interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

interface DashboardData {
  users: {
    total: number;
    recent: User[];
  };
  products: {
    total: number;
  };
  orders: {
    total: number;
    today: number;
    monthlyRevenue: number;
  };
}

interface KPIData {
  label: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener usuarios (primeros 5 para la tabla)
        const usersResponse: User[] = await api.get<User[]>('/user/admin/all');
        const recentUsers = usersResponse.slice(0, 5).sort((a, b) => new Date(b.last_sign_in_at || '').getTime() - new Date(a.last_sign_in_at || '').getTime());

        // Obtener productos
        const productsResponse: ProductsResponse = await api.get<ProductsResponse>('/products/admin/all?limit=1');
        
        // Obtener órdenes
        const ordersResponse: OrdersResponse = await api.get<OrdersResponse>('/orders/admin/all?limit=1');

        // Calcular métricas
        const today = new Date();
        const todayOrders = ordersResponse.data?.filter((order: Order) => {
          const orderDate = new Date(order.created_at);
          return orderDate.toDateString() === today.toDateString();
        }) || [];

        const monthlyOrders = ordersResponse.data?.filter((order: Order) => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === today.getMonth() && 
                 orderDate.getFullYear() === today.getFullYear();
        }) || [];

        const monthlyRevenue = monthlyOrders.reduce((total: number, order: Order) => {
          return total + (order.total_amount || 0);
        }, 0);

        setDashboardData({
          users: {
            total: usersResponse.length,
            recent: recentUsers
          },
          products: {
            total: productsResponse.total || 0
          },
          orders: {
            total: ordersResponse.total || 0,
            today: todayOrders.length,
            monthlyRevenue
          }
        });
      } catch (err: unknown) {
        console.error('Error fetching dashboard data:', err);
        setError(t('admin.dashboard.error_loading_data'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  const getKPIs = (): KPIData[] => {
    if (!dashboardData) return [];

    return [
      {
        label: t('admin.dashboard.kpis.active_users'),
        value: dashboardData.users.total,
        change: '+12%', // Mock change - se podría calcular comparando con período anterior
        changeType: 'positive'
      },
      {
        label: t('admin.dashboard.kpis.products'),
        value: dashboardData.products.total,
        change: '+5%', // Mock change
        changeType: 'positive'
      },
      {
        label: t('admin.dashboard.kpis.sales_today'),
        value: dashboardData.orders.today,
        change: '-3%', // Mock change
        changeType: 'negative'
      },
      {
        label: t('admin.dashboard.kpis.monthly_revenue'),
        value: `€${+dashboardData.orders.monthlyRevenue}`,
        change: '+8%', // Mock change
        changeType: 'positive'
      }
    ];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('admin.dashboard.never');
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getRoleDisplay = (roles: string[]) => {
    if (roles.includes('admin')) return t('admin.dashboard.roles.admin');
    if (roles.includes('business')) return t('admin.dashboard.roles.business');
    if (roles.includes('consumer')) return t('admin.dashboard.roles.consumer');
    return t('admin.dashboard.roles.user');
  };

  const getStatusDisplay = (emailConfirmed: string | null, lastSignIn: string | null) => {
    if (!emailConfirmed) return t('admin.dashboard.status.pending');
    if (!lastSignIn) return t('admin.dashboard.status.inactive');
    return t('admin.dashboard.status.active');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600">{t('admin.dashboard.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600">{t('admin.dashboard.subtitle')}</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  const kpis = getKPIs();

  return (
    <div className="space-y-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
        <p className="mt-2 text-sm lg:text-base text-gray-600">{t('admin.dashboard.subtitle')}</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {kpis.map(kpi => (
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
          <h2 className="text-base lg:text-lg font-medium text-gray-900">{t('admin.dashboard.recent_users')}</h2>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.dashboard.table.id')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.dashboard.table.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.dashboard.table.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.dashboard.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.dashboard.table.last_access')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData?.users.recent.map(user => {
                const role = getRoleDisplay(user.roles);
                const status = getStatusDisplay(user.email_confirmed_at, user.last_sign_in_at);
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : role === 'business'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        status === 'Activo'
                          ? 'bg-green-100 text-green-800'
                          : status === 'Pendiente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.last_sign_in_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {dashboardData?.users.recent.map(user => {
            const role = getRoleDisplay(user.roles);
            const status = getStatusDisplay(user.email_confirmed_at, user.last_sign_in_at);
            
            return (
              <div key={user.id} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">#{user.id.slice(0, 8)}...</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : role === 'business'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {role}
                    </span>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    status === 'Activo'
                      ? 'bg-green-100 text-green-800'
                      : status === 'Pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">{t('admin.dashboard.table.last_access')}: {formatDate(user.last_sign_in_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}