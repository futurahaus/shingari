import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DashboardAnalytics {
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
  topProducts: Array<{ productId: number; productName: string; quantity: number; revenue: number }>;
  topClients: Array<{ userId: string; email: string; totalBilled: number; orderCount: number }>;
  inactiveUsers: Array<{ id: string; email: string; lastSignIn: string | null; daysInactive: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    userEmail?: string;
  }>;
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private calcChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    type KpiRow = {
      total_users: bigint;
      prev_month_users: bigint;
      new_users_this_month: bigint;
      new_users_last_month: bigint;
      total_orders: bigint;
      orders_this_month: bigint;
      orders_last_month: bigint;
      orders_today: bigint;
      orders_yesterday: bigint;
      revenue_this_month: number;
      revenue_last_month: number;
      total_revenue: number;
      total_orders_for_avg: bigint;
      last_month_revenue_for_avg: number;
      last_month_orders_for_avg: bigint;
    };

    const [kpiRow] = await this.prisma.$queryRaw<KpiRow[]>`
      SELECT
        (SELECT COUNT(*) FROM auth.users WHERE is_anonymous = false AND deleted_at IS NULL)::bigint as total_users,
        (SELECT COUNT(*) FROM auth.users WHERE is_anonymous = false AND deleted_at IS NULL AND created_at < ${monthStart})::bigint as prev_month_users,
        (SELECT COUNT(*) FROM auth.users WHERE is_anonymous = false AND deleted_at IS NULL AND created_at >= ${monthStart} AND created_at <= ${monthEnd})::bigint as new_users_this_month,
        (SELECT COUNT(*) FROM auth.users WHERE is_anonymous = false AND deleted_at IS NULL AND created_at >= ${lastMonthStart} AND created_at <= ${lastMonthEnd})::bigint as new_users_last_month,
        (SELECT COUNT(*) FROM public.orders WHERE status != 'cancelled')::bigint as total_orders,
        (SELECT COUNT(*) FROM public.orders WHERE status != 'cancelled' AND created_at >= ${monthStart} AND created_at <= ${monthEnd})::bigint as orders_this_month,
        (SELECT COUNT(*) FROM public.orders WHERE status != 'cancelled' AND created_at >= ${lastMonthStart} AND created_at <= ${lastMonthEnd})::bigint as orders_last_month,
        (SELECT COUNT(*) FROM public.orders WHERE status != 'cancelled' AND created_at >= ${todayStart} AND created_at <= ${todayEnd})::bigint as orders_today,
        (SELECT COUNT(*) FROM public.orders WHERE status != 'cancelled' AND created_at >= ${yesterdayStart} AND created_at <= ${yesterdayEnd})::bigint as orders_yesterday,
        (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status != 'cancelled' AND created_at >= ${monthStart} AND created_at <= ${monthEnd})::decimal as revenue_this_month,
        (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status != 'cancelled' AND created_at >= ${lastMonthStart} AND created_at <= ${lastMonthEnd})::decimal as revenue_last_month,
        (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status != 'cancelled')::decimal as total_revenue,
        (SELECT COUNT(*) FROM public.orders WHERE status != 'cancelled')::bigint as total_orders_for_avg,
        (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status != 'cancelled' AND created_at >= ${lastMonthStart} AND created_at <= ${lastMonthEnd})::decimal as last_month_revenue_for_avg,
        (SELECT COUNT(*) FROM public.orders WHERE status != 'cancelled' AND created_at >= ${lastMonthStart} AND created_at <= ${lastMonthEnd})::bigint as last_month_orders_for_avg
    `;

    const totalUsers = Number(kpiRow.total_users);
    const lastMonthUsers = Number(kpiRow.prev_month_users);
    const newUsersThisMonth = Number(kpiRow.new_users_this_month);
    const lastMonthNewUsers = Number(kpiRow.new_users_last_month);
    const totalOrders = Number(kpiRow.total_orders);
    const ordersThisMonth = Number(kpiRow.orders_this_month);
    const lastMonthOrders = Number(kpiRow.orders_last_month);
    const ordersToday = Number(kpiRow.orders_today);
    const ordersYesterday = Number(kpiRow.orders_yesterday);
    const monthlyRevenue = Number(kpiRow.revenue_this_month);
    const lastMonthRevenue = Number(kpiRow.revenue_last_month);
    const totalRevenue = Number(kpiRow.total_revenue);
    const totalOrdersCount = Number(kpiRow.total_orders_for_avg);
    const lastMonthTotalRevenue = Number(kpiRow.last_month_revenue_for_avg);
    const lastMonthTotalOrders = Number(kpiRow.last_month_orders_for_avg);

    const avgTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
    const lastMonthAvgTicket =
      lastMonthTotalOrders > 0 ? lastMonthTotalRevenue / lastMonthTotalOrders : 0;
    const avgTicketChange = this.calcChange(avgTicket, lastMonthAvgTicket);

    const [seriesAndDistributionsRaw, inactiveUsersRaw, recentOrdersData] = await Promise.all([
      this.prisma.$queryRaw<
        Array<{
          orders_monthly_json: unknown;
          users_monthly_json: unknown;
          order_status_json: unknown;
          top_products_json: unknown;
          top_clients_json: unknown;
        }>
      >`
        SELECT
          (SELECT COALESCE(json_agg(json_build_object('year_num', year_num, 'month_num', month_num, 'revenue', revenue, 'order_count', order_count)), '[]'::json)
           FROM (SELECT EXTRACT(YEAR FROM o.created_at)::int as year_num, EXTRACT(MONTH FROM o.created_at)::int as month_num,
                 COALESCE(SUM(o.total_amount), 0)::decimal as revenue, COUNT(*)::bigint as order_count
                 FROM public.orders o
                 WHERE o.status != 'cancelled' AND o.created_at >= ${twelveMonthsAgo}
                 GROUP BY EXTRACT(YEAR FROM o.created_at), EXTRACT(MONTH FROM o.created_at)
                 ORDER BY year_num, month_num) t) as orders_monthly_json,
          (SELECT COALESCE(json_agg(json_build_object('year_num', year_num, 'month_num', month_num, 'user_count', user_count)), '[]'::json)
           FROM (SELECT EXTRACT(YEAR FROM u.created_at)::int as year_num, EXTRACT(MONTH FROM u.created_at)::int as month_num,
                 COUNT(*)::bigint as user_count
                 FROM auth.users u
                 WHERE u.is_anonymous = false AND u.deleted_at IS NULL AND u.created_at >= ${twelveMonthsAgo}
                 GROUP BY EXTRACT(YEAR FROM u.created_at), EXTRACT(MONTH FROM u.created_at)
                 ORDER BY year_num, month_num) t) as users_monthly_json,
          (SELECT COALESCE(json_agg(json_build_object('status', status, 'count', cnt)), '[]'::json)
           FROM (SELECT status, COUNT(*)::int as cnt FROM public.orders GROUP BY status) t) as order_status_json,
          (SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
           FROM (SELECT ol.product_id as product_id, ol.product_name as product_name,
                 COALESCE(SUM(ol.quantity), 0)::bigint as total_qty,
                 COALESCE(SUM(ol.total_price), 0)::decimal as total_rev
                 FROM public.order_lines ol
                 JOIN public.orders o ON o.id = ol.order_id
                 WHERE o.status != 'cancelled' AND ol.product_id IS NOT NULL
                 GROUP BY ol.product_id, ol.product_name
                 ORDER BY total_qty DESC LIMIT 10) t) as top_products_json,
          (SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
           FROM (SELECT o.user_id as user_id, u.email as email,
                 COALESCE(SUM(o.total_amount), 0)::decimal as total_billed,
                 COUNT(*)::bigint as order_count
                 FROM public.orders o
                 JOIN auth.users u ON u.id = o.user_id
                 WHERE o.status != 'cancelled'
                 GROUP BY o.user_id, u.email
                 ORDER BY total_billed DESC LIMIT 5) t) as top_clients_json
      `,
      this.prisma.$queryRaw<
        Array<{ id: string; email: string | null; last_sign_in_at: Date | null }>
      >`
        SELECT id, email, last_sign_in_at
        FROM auth.users
        WHERE is_anonymous = false AND deleted_at IS NULL
          AND (last_sign_in_at < ${thirtyDaysAgo} OR last_sign_in_at IS NULL)
        LIMIT 20
      `,
      this.prisma.$queryRaw<
        Array<{
          id: string;
          order_number: string | null;
          total_amount: number;
          status: string;
          created_at: Date;
          email: string | null;
        }>
      >`
        SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at, u.email
        FROM public.orders o
        JOIN auth.users u ON u.id = o.user_id
        ORDER BY o.created_at DESC
        LIMIT 5
      `,
    ]);

    const seriesRow = seriesAndDistributionsRaw[0]!;
    const ordersMonthlyRaw = (seriesRow.orders_monthly_json as Array<{ year_num: number; month_num: number; revenue: number; order_count: string }>) ?? [];
    const usersMonthlyRaw = (seriesRow.users_monthly_json as Array<{ year_num: number; month_num: number; user_count: string }>) ?? [];
    const orderStatusRaw = (seriesRow.order_status_json as Array<{ status: string; count: number }>) ?? [];
    const topProductsRaw = (seriesRow.top_products_json as Array<{ product_id: number; product_name: string; total_qty: string; total_rev: number }>) ?? [];
    const topClientsRaw = (seriesRow.top_clients_json as Array<{ user_id: string; email: string | null; total_billed: number; order_count: string }>) ?? [];

    const monthLabels = this.buildMonthLabels();
    const ordersByKey = new Map(
      ordersMonthlyRaw.map((r) => [`${r.year_num}-${r.month_num}`, r])
    );
    const usersByKey = new Map(
      usersMonthlyRaw.map((r) => [`${r.year_num}-${r.month_num}`, r])
    );

    const monthlyRevenueSeries = monthLabels.map((m) => {
        const key = `${m.year}-${m.monthNum}`;
        const row = ordersByKey.get(key);
        return {
          month: m.month,
          year: m.year,
          revenue: row ? Number(row.revenue) : 0,
      };
    });

    const ordersPerMonth = monthLabels.map((m) => {
        const key = `${m.year}-${m.monthNum}`;
        const row = ordersByKey.get(key);
        return {
          month: m.month,
          year: m.year,
          count: row ? Number(row.order_count) : 0,
      };
    });

    const usersPerMonth = monthLabels.map((m) => {
        const key = `${m.year}-${m.monthNum}`;
        const row = usersByKey.get(key);
        return {
          month: m.month,
          year: m.year,
          count: row ? Number(row.user_count) : 0,
      };
    });

    const topProducts = topProductsRaw.map((r) => ({
        productId: r.product_id,
        productName: r.product_name,
        quantity: Number(r.total_qty),
        revenue: Number(r.total_rev),
    }));

    const topClients = topClientsRaw.map((r) => ({
        userId: r.user_id,
        email: r.email ?? '',
        totalBilled: Number(r.total_billed),
        orderCount: Number(r.order_count),
    }));

    const inactiveUsers = inactiveUsersRaw.map((u) => {
        const lastSignIn = u.last_sign_in_at;
        const daysInactive = lastSignIn
          ? Math.floor((now.getTime() - lastSignIn.getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        return {
          id: u.id,
          email: u.email ?? '',
          lastSignIn: lastSignIn?.toISOString() ?? null,
          daysInactive,
      };
    });

    const recentOrders = recentOrdersData.map((o) => ({
        id: o.id,
        orderNumber: o.order_number ?? o.id.slice(0, 8),
        totalAmount: Number(o.total_amount),
        status: o.status ?? 'pending',
        createdAt: o.created_at?.toISOString() ?? '',
        userEmail: o.email ?? undefined,
    }));

    return {
      kpis: {
          totalUsers,
          totalUsersChange: this.calcChange(totalUsers, lastMonthUsers),
          newUsersThisMonth,
          newUsersChange: this.calcChange(newUsersThisMonth, lastMonthNewUsers),
          totalOrders,
          totalOrdersChange: this.calcChange(ordersThisMonth, lastMonthOrders),
          ordersToday,
          ordersTodayChange: this.calcChange(ordersToday, ordersYesterday),
        monthlyRevenue,
        monthlyRevenueChange: this.calcChange(monthlyRevenue, lastMonthRevenue),
        avgTicket: Math.round(avgTicket * 100) / 100,
        avgTicketChange,
      },
      monthlyRevenue: monthlyRevenueSeries,
      ordersPerMonth,
      usersPerMonth,
      orderStatusDistribution: orderStatusRaw.map((a) => ({
        status: a.status ?? 'unknown',
        count: a.count,
      })),
      topProducts,
      topClients,
      inactiveUsers,
      recentOrders,
    };
  }

  private buildMonthLabels(): Array<{ month: string; year: number; monthNum: number }> {
    const result: Array<{ month: string; year: number; monthNum: number }> = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        month: MONTH_NAMES[d.getMonth()],
        year: d.getFullYear(),
        monthNum: d.getMonth() + 1,
      });
    }
    return result;
  }
}
