import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { productsApi } from '../api/productsApi';
import { productsKeys } from '../api/queryKeys';
import type { ProductsListParams } from '../types';

export function useProductsList(params: Ref<ProductsListParams>) {
  return useQuery({
    queryKey: computed(() => productsKeys.list(params.value)),
    queryFn: () => productsApi.list(params.value),
  });
}
