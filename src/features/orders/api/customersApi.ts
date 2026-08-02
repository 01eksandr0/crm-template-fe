import { api } from '@/shared/http/client';
import type { CreateCustomerPayload, Customer } from '../types';

export const customersApi = {
  search(search: string, limit = 20): Promise<Customer[]> {
    return api
      .get<{ items: Customer[] }>('/customers', { params: { search, limit, page: 1 } })
      .then((r) => r.data.items);
  },
  create(payload: CreateCustomerPayload): Promise<Customer> {
    return api.post<Customer>('/customers', payload).then((r) => r.data);
  },
};
