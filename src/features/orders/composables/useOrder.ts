import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { ordersApi } from '../api/ordersApi';
import { ordersKeys } from '../api/queryKeys';

export function useOrder(id: Ref<string>) {
  return useQuery({
    queryKey: computed(() => ordersKeys.detail(id.value)),
    queryFn: () => ordersApi.get(id.value),
    enabled: computed(() => !!id.value),
  });
}
