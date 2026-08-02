import { api } from '@/shared/http/client';
import type { Paginated, Product, ProductPayload, ProductsListParams } from '../types';

export const productsApi = {
  list(params: ProductsListParams): Promise<Paginated<Product>> {
    return api.get<Paginated<Product>>('/products', { params }).then((r) => r.data);
  },
  get(id: string): Promise<Product> {
    return api.get<Product>(`/products/${id}`).then((r) => r.data);
  },
  create(payload: ProductPayload): Promise<Product> {
    return api.post<Product>('/products', payload).then((r) => r.data);
  },
  update(id: string, payload: ProductPayload): Promise<Product> {
    return api.put<Product>(`/products/${id}`, payload).then((r) => r.data);
  },
  remove(id: string): Promise<void> {
    return api.delete(`/products/${id}`).then(() => undefined);
  },
};
