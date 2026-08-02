import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { customersApi } from '../api/customersApi';
import { customersKeys } from '../api/queryKeys';
import type { CustomersListParams } from '../types';

export function useCustomersList(params: Ref<CustomersListParams>) {
  return useQuery({
    queryKey: computed(() => customersKeys.list(params.value)),
    queryFn: () => customersApi.list(params.value),
  });
}
