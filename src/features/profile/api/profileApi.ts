import { api } from '@/shared/http/client';
import type { Profile, UpdateProfilePayload } from '../types';

export const profileApi = {
  get(): Promise<Profile> {
    return api.get<Profile>('/profile').then((r) => r.data);
  },
  update(payload: UpdateProfilePayload): Promise<Profile> {
    return api.patch<Profile>('/profile', payload).then((r) => r.data);
  },
};
