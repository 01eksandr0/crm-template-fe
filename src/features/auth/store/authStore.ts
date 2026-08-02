import { defineStore } from 'pinia';
import { registerAuthHandlers, setAccessToken } from '@/shared/http/client';
import { queryClient } from '@/shared/http/queryClient';
import { can as canCheck, canAny as canAnyCheck } from '@/shared/permissions/permissions';
import { authApi } from '../api/authApi';
import type { LoginCredentials, LoginResponse, SessionInfo, User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  initialized: boolean;
  session: SessionInfo | null;
  /** Момент получения текущего access-токена (для планирования проактивного refresh). */
  tokenObtainedAt: number;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    initialized: false,
    session: null,
    tokenObtainedAt: 0,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.accessToken,
    permissions: (state) => state.user?.permissions ?? [],
    fullName: (state) => {
      if (!state.user) return '';
      const name = [state.user.firstName, state.user.lastName].filter(Boolean).join(' ');
      return name || state.user.email;
    },
  },

  actions: {
    can(permission: string): boolean {
      return canCheck(this.permissions, permission);
    },
    canAny(permissions: string[]): boolean {
      return canAnyCheck(this.permissions, permissions);
    },

    setSession(payload: LoginResponse) {
      this.user = payload.user;
      this.accessToken = payload.accessToken;
      this.session = payload.session;
      this.tokenObtainedAt = Date.now();
      setAccessToken(payload.accessToken);
    },

    clearSession() {
      this.user = null;
      this.accessToken = null;
      this.session = null;
      this.tokenObtainedAt = 0;
      setAccessToken(null);
      // Не залишаємо дані попереднього користувача в кеші (дашборд, списки тощо).
      queryClient.clear();
    },

    async login(credentials: LoginCredentials): Promise<User> {
      // На випадок повторного логіну без явного logout.
      queryClient.clear();
      const data = await authApi.login(credentials);
      this.setSession(data);
      return data.user;
    },

    /** Проактивное продление сессии (sliding) — вызывает менеджер сессии. */
    async refresh(): Promise<void> {
      this.setSession(await authApi.refresh());
    },

    async logout() {
      try {
        await authApi.logout();
      } catch {
        // игнорируем — всё равно чистим локальную сессию
      }
      this.clearSession();
    },

    /** Тихая попытка восстановить сессию при загрузке (через refresh-cookie). */
    async bootstrap() {
      if (this.initialized) return;
      try {
        this.setSession(await authApi.refresh());
      } catch {
        this.clearSession();
      } finally {
        this.initialized = true;
      }
    },

    /** Обработчики для axios-интерсептора (refresh). */
    registerInterceptors() {
      registerAuthHandlers({
        onRefreshed: (token) => {
          this.accessToken = token;
          this.tokenObtainedAt = Date.now();
        },
        onRefreshFailed: () => {
          this.clearSession();
        },
      });
    },
  },
});
