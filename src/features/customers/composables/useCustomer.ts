import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { customersApi } from '../api/customersApi';
import { customersKeys } from '../api/queryKeys';

export function useCustomer(id: Ref<string>) {
  return useQuery({
    queryKey: computed(() => customersKeys.detail(id.value)),
    queryFn: () => customersApi.get(id.value),
    enabled: computed(() => !!id.value),
  });
}
