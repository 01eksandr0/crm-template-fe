import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { usersApi } from '../api/usersApi';
import { usersKeys } from '../api/queryKeys';
import type { UsersListParams } from '../types';

/** Список користувачів з пагінацією та пошуком. */
export function useUsersList(params: Ref<UsersListParams>) {
  return useQuery({
    queryKey: computed(() => usersKeys.list(params.value)),
    queryFn: () => usersApi.list(params.value),
  });
}
