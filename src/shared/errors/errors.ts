import { AxiosError } from 'axios';
import { t } from '@/i18n';

interface ApiErrorBody {
  error?: {
    code?: string;
    key?: string;
    message?: string;
    details?: unknown;
  };
}

/** Достаёт i18n-ключ ошибки, который прислал бэкенд (error.key). */
export function extractErrorKey(error: unknown): string {
  if (error instanceof AxiosError) {
    if (!error.response) return 'errors.network';
    const body = error.response.data as ApiErrorBody | undefined;
    return body?.error?.key ?? 'errors.unknown';
  }
  return 'errors.unknown';
}

/** Возвращает готовое локализованное сообщение об ошибке. */
export function resolveErrorMessage(error: unknown): string {
  return t(extractErrorKey(error));
}
