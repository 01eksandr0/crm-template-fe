import { api } from '@/shared/http/client';
import type {
  Order,
  OrderPayload,
  OrderStatus,
  OrdersListParams,
  Paginated,
} from '../types';

export const ordersApi = {
  list(params: OrdersListParams): Promise<Paginated<Order>> {
    return api.get<Paginated<Order>>('/orders', { params }).then((r) => r.data);
  },
  get(id: string): Promise<Order> {
    return api.get<Order>(`/orders/${id}`).then((r) => r.data);
  },
  create(payload: OrderPayload): Promise<Order> {
    return api.post<Order>('/orders', payload).then((r) => r.data);
  },
  update(id: string, payload: OrderPayload): Promise<Order> {
    return api.put<Order>(`/orders/${id}`, payload).then((r) => r.data);
  },
  changeStatus(id: string, status: OrderStatus): Promise<Order> {
    return api.patch<Order>(`/orders/${id}/status`, { status }).then((r) => r.data);
  },
};
