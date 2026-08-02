import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { usersApi } from '../api/usersApi';
import { usersKeys } from '../api/queryKeys';
import type { CreateUserPayload, UpdateUserPayload } from '../types';

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: (user) => {
      void qc.invalidateQueries({ queryKey: usersKeys.lists() });
      void qc.invalidateQueries({ queryKey: usersKeys.detail(user.id) });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: usersKeys.lists() });
      void qc.removeQueries({ queryKey: usersKeys.detail(id) });
    },
  });
}
