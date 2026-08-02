import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { usersApi } from '../api/usersApi';
import { usersKeys } from '../api/queryKeys';

/** Картка одного користувача. */
export function useUser(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => usersKeys.detail(toValue(id))),
    queryFn: () => usersApi.get(toValue(id)),
    enabled: computed(() => !!toValue(id)),
  });
}
