import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { customersApi } from '../api/customersApi';
import { customersKeys } from '../api/queryKeys';
import type { CustomerPayload } from '../types';

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerPayload) => customersApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: customersKeys.lists() });
    },
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CustomerPayload }) =>
      customersApi.update(id, payload),
    onSuccess: (customer) => {
      void qc.invalidateQueries({ queryKey: customersKeys.lists() });
      void qc.invalidateQueries({ queryKey: customersKeys.detail(customer.id) });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.remove(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: customersKeys.lists() });
      void qc.removeQueries({ queryKey: customersKeys.detail(id) });
    },
  });
}
