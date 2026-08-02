import { useMutation } from '@tanstack/vue-query';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials } from '../types';

/** Мутация входа: инкапсулирует состояние pending/error. */
export function useLogin() {
  const auth = useAuthStore();
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => auth.login(credentials),
  });
}
