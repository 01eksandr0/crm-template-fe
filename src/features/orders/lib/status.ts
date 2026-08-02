import type { OrderStatus } from '../types';

/**
 * Кольори бейджів (PrimeVue Aura + семантика статусу):
 * new — нейтральний; inProduction — у роботі; ready — потребує уваги;
 * completed — успіх; cancelled — скасовано (негативний фінал).
 */
export function statusSeverity(
  status: OrderStatus,
): 'secondary' | 'info' | 'warn' | 'success' | 'danger' {
  switch (status) {
    case 'new':
      return 'secondary';
    case 'inProduction':
      return 'info';
    case 'ready':
      return 'warn';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
  }
}

/** Наступний статус «вперед» ланцюжком (без скасування). */
export function nextForwardStatus(allowed: OrderStatus[]): OrderStatus | undefined {
  return allowed.find((s) => s !== 'cancelled');
}
