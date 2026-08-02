import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { productsApi } from '../api/productsApi';
import { productsKeys } from '../api/queryKeys';

export function useProduct(id: Ref<string>) {
  return useQuery({
    queryKey: computed(() => productsKeys.detail(id.value)),
    queryFn: () => productsApi.get(id.value),
    enabled: computed(() => !!id.value),
  });
}
