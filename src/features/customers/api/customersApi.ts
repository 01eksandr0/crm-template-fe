import { api } from '@/shared/http/client';
import type { Customer, CustomerPayload, CustomersListParams, Paginated } from '../types';

export const customersApi = {
  list(params: CustomersListParams): Promise<Paginated<Customer>> {
    return api.get<Paginated<Customer>>('/customers', { params }).then((r) => r.data);
  },
  get(id: string): Promise<Customer> {
    return api.get<Customer>(`/customers/${id}`).then((r) => r.data);
  },
  create(payload: CustomerPayload): Promise<Customer> {
    return api.post<Customer>('/customers', payload).then((r) => r.data);
  },
  update(id: string, payload: CustomerPayload): Promise<Customer> {
    return api.put<Customer>(`/customers/${id}`, payload).then((r) => r.data);
  },
  remove(id: string): Promise<void> {
    return api.delete(`/customers/${id}`).then(() => undefined);
  },
};
