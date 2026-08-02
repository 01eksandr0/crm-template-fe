import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/shared/config/env';

const baseURL = env.apiUrl;

/** Access-токен живёт только в памяти (не в localStorage). */
let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}

/** Колбэки, которые регистрирует auth-store, чтобы не плодить циклические импорты. */
let onRefreshed: ((token: string) => void) | null = null;
let onRefreshFailed: (() => void) | null = null;
export function registerAuthHandlers(handlers: {
  onRefreshed: (token: string) => void;
  onRefreshFailed: () => void;
}) {
  onRefreshed = handlers.onRefreshed;
  onRefreshFailed = handlers.onRefreshFailed;
}

/** Глобальный обработчик ошибок API (напр. показ toast). Регистрируется в App.vue. */
let onApiError: ((error: AxiosError) => void) | null = null;
export function registerErrorHandler(fn: (error: AxiosError) => void) {
  onApiError = fn;
}

const MUTATION_METHODS = ['post', 'put', 'patch', 'delete'];

function isAuthEndpoint(url: string) {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  );
}

/**
 * Уведомляем о неудачных мутациях (POST/PUT/PATCH/DELETE).
 * Auth-роуты пропускаем — их ошибки показывает сам экран входа.
 */
function maybeNotify(error: AxiosError) {
  const method = (error.config?.method ?? '').toLowerCase();
  const url = error.config?.url ?? '';
  if (!MUTATION_METHODS.includes(method) || isAuthEndpoint(url)) return;
  onApiError?.(error);
}

export const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

// --- Обновление токена по 401 с очередью параллельных запросов ---
let isRefreshing = false;
let queue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = [];

function flushQueue(error: unknown, token: string | null) {
  queue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  queue = [];
}

async function requestRefresh(): Promise<string> {
  // Отдельный axios без интерсепторов, чтобы не зациклиться.
  const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
  return data.accessToken as string;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const url = original?.url ?? '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/refresh');

    if (error.response?.status !== 401 || !original || original._retry || isAuthRoute) {
      maybeNotify(error);
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            original.headers.set('Authorization', `Bearer ${token}`);
            resolve(api(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;
    try {
      const newToken = await requestRefresh();
      setAccessToken(newToken);
      onRefreshed?.(newToken);
      flushQueue(null, newToken);
      original.headers.set('Authorization', `Bearer ${newToken}`);
      return api(original);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      onRefreshFailed?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
