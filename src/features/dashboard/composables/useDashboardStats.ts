import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { useAuthStore } from '@/features/auth/store/authStore';
import { dashboardApi } from '../api/dashboardApi';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: (userId?: string | null) => [...dashboardKeys.all, 'stats', userId ?? 'anon'] as const,
};

/** Запрос статистики дашборда (кеш/дедуп через TanStack Query). */
export function useDashboardStats() {
  const auth = useAuthStore();
  const userId = computed(() => auth.user?.id ?? null);

  return useQuery({
    queryKey: computed(() => dashboardKeys.stats(userId.value)),
    queryFn: dashboardApi.getStats,
    enabled: computed(() => !!userId.value),
  });
}
