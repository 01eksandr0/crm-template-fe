import { api } from '@/shared/http/client';
import type { DictOption } from '../types';

function list(path: string): Promise<DictOption[]> {
  return api.get<{ items: DictOption[] }>(`/dictionaries/${path}`).then((r) => r.data.items);
}

export const dictionariesApi = {
  colors: () => list('colors'),
  materials: () => list('materials'),
  kits: () => list('kits'),
  deliveryMethods: () => list('delivery-methods'),
  paymentMethods: () => list('payment-methods'),
  users: () => list('users'),
};
