import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { profileApi } from '../api/profileApi';
import type { UpdateProfilePayload } from '../types';

export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => profileApi.get(),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.update(payload),
    onSuccess: (data) => {
      qc.setQueryData(profileKeys.me(), data);
    },
  });
}
