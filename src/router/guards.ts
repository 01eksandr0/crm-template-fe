import type { Router } from 'vue-router';
import { useAuthStore } from '@/features/auth/store/authStore';

export function setupGuards(router: Router) {
  router.beforeEach(async (to) => {
    const auth = useAuthStore();

    // Одноразовое восстановление сессии по refresh-cookie.
    if (!auth.initialized) {
      await auth.bootstrap();
    }

    if (to.meta.guestOnly && auth.isAuthenticated) {
      return { name: 'dashboard' };
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }

    const permission = to.meta.permission as string | undefined;
    if (permission && !auth.can(permission)) {
      return { name: 'forbidden' };
    }

    return true;
  });
}
