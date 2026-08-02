import { api } from '@/shared/http/client';
import type { LoginCredentials, LoginResponse, User } from '../types';

/** Сервис аутентификации — единственное место с auth-эндпоинтами. */
export const authApi = {
  login(credentials: LoginCredentials): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', credentials).then((r) => r.data);
  },
  logout(): Promise<void> {
    return api.post('/auth/logout').then(() => undefined);
  },
  refresh(): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/refresh').then((r) => r.data);
  },
  me(): Promise<User> {
    return api.get<{ user: User }>('/auth/me').then((r) => r.data.user);
  },
};
