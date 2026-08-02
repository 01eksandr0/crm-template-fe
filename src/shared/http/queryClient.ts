import { QueryClient } from '@tanstack/vue-query';

/** Общий клиент TanStack Query. Разумные дефолты для CRM. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
