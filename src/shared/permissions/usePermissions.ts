import { computed } from 'vue';
import { useAuthStore } from '@/features/auth/store/authStore';
import { can, canAll, canAny } from './permissions';

/**
 * Композабл для проверки доступов в компонентах.
 * Реактивен относительно текущего пользователя.
 */
export function usePermissions() {
  const auth = useAuthStore();
  const permissions = computed(() => auth.permissions);

  return {
    permissions,
    can: (permission: string) => can(auth.permissions, permission),
    canAny: (list: string[]) => canAny(auth.permissions, list),
    canAll: (list: string[]) => canAll(auth.permissions, list),
  };
}
