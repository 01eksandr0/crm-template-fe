import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { productsApi } from '../api/productsApi';
import { productsKeys } from '../api/queryKeys';
import type { ProductPayload } from '../types';

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => productsApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductPayload }) =>
      productsApi.update(id, payload),
    onSuccess: (product) => {
      void qc.invalidateQueries({ queryKey: productsKeys.lists() });
      void qc.invalidateQueries({ queryKey: productsKeys.detail(product.id) });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: productsKeys.lists() });
      void qc.removeQueries({ queryKey: productsKeys.detail(id) });
    },
  });
}
