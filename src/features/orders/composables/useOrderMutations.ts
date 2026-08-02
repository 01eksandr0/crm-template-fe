import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ordersApi } from '../api/ordersApi';
import { ordersKeys } from '../api/queryKeys';
import type { OrderPayload, OrderStatus } from '../types';

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderPayload) => ordersApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ordersKeys.lists() });
    },
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OrderPayload }) =>
      ordersApi.update(id, payload),
    onSuccess: (order) => {
      void qc.invalidateQueries({ queryKey: ordersKeys.lists() });
      void qc.invalidateQueries({ queryKey: ordersKeys.detail(order.id) });
    },
  });
}

export function useChangeOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.changeStatus(id, status),
    onSuccess: (order) => {
      void qc.invalidateQueries({ queryKey: ordersKeys.lists() });
      void qc.invalidateQueries({ queryKey: ordersKeys.detail(order.id) });
    },
  });
}
