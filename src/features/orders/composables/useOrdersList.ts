import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { ordersApi } from '../api/ordersApi';
import { ordersKeys } from '../api/queryKeys';
import type { OrdersListParams } from '../types';

export function useOrdersList(params: Ref<OrdersListParams>) {
  return useQuery({
    queryKey: computed(() => ordersKeys.list(params.value)),
    queryFn: () => ordersApi.list(params.value),
  });
}
