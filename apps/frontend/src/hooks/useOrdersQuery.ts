import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export interface OrderLine {
  id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  product_image?: string;
}

export interface OrderAddress {
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
}

export interface OrderPayment {
  id: string;
  payment_method: string;
  status: string;
  paid_at?: string;
  amount: string;
  transaction_id?: string;
  metadata?: Record<string, unknown>;
}

export interface Order {
  id: string;
  user_id?: string;
  status: string;
  total_amount: string;
  currency: string;
  order_number?: string;
  created_at: string;
  updated_at: string;
  order_lines: OrderLine[];
  order_addresses: OrderAddress[];
  order_payments: OrderPayment[];
}

// Query keys for orders
export const ordersKeys = {
  all: ['orders'] as const,
  user: (userId?: string) => [...ordersKeys.all, 'user', userId] as const,
  userOrders: (userId?: string) => [...ordersKeys.user(userId), 'list'] as const,
  detail: (orderId?: string) => [...ordersKeys.all, 'detail', orderId] as const,
};

// Hook to get user's orders list
export function useUserOrders() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ordersKeys.userOrders(user?.id),
    queryFn: async () => {
      const data = await api.get<Order[]>('/orders/user/me');
      return data;
    },
    enabled: !!user,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// Hook to get a specific order by ID
export function useOrderDetail(orderId: string) {
  return useQuery({
    queryKey: ordersKeys.detail(orderId),
    queryFn: async () => {
      const data = await api.get<Order>(`/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
}

// Main hook that provides all orders functionality with React Query
export function useOrdersQuery() {
  const userOrdersQuery = useUserOrders();
  
  return {
    // Data
    orders: userOrdersQuery.data || [],
    
    // Loading states
    isLoading: userOrdersQuery.isLoading,
    isFetching: userOrdersQuery.isFetching,
    
    // Error states
    error: userOrdersQuery.error,
    isError: userOrdersQuery.isError,
    
    // Actions
    refetch: userOrdersQuery.refetch,
    
    // Status
    isSuccess: userOrdersQuery.isSuccess,
    isStale: userOrdersQuery.isStale,
  };
}
