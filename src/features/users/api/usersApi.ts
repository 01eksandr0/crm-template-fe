import { api } from '@/shared/http/client';
import type {
  CreateUserPayload,
  CreateVacationPayload,
  Paginated,
  RoleOption,
  UpdateUserPayload,
  UserRecord,
  UsersListParams,
  Vacation,
} from '../types';

export const usersApi = {
  list(params: UsersListParams): Promise<Paginated<UserRecord>> {
    return api.get<Paginated<UserRecord>>('/users', { params }).then((r) => r.data);
  },
  get(id: string): Promise<UserRecord> {
    return api.get<UserRecord>(`/users/${id}`).then((r) => r.data);
  },
  create(payload: CreateUserPayload): Promise<UserRecord> {
    return api.post<UserRecord>('/users', payload).then((r) => r.data);
  },
  update(id: string, payload: UpdateUserPayload): Promise<UserRecord> {
    return api.put<UserRecord>(`/users/${id}`, payload).then((r) => r.data);
  },
  remove(id: string): Promise<void> {
    return api.delete(`/users/${id}`).then(() => undefined);
  },
  listRoles(): Promise<RoleOption[]> {
    return api.get<{ roles: RoleOption[] }>('/meta/roles').then((r) => r.data.roles);
  },
  listVacations(userId: string): Promise<Vacation[]> {
    return api.get<{ items: Vacation[] }>(`/users/${userId}/vacations`).then((r) => r.data.items);
  },
  createVacation(userId: string, payload: CreateVacationPayload): Promise<Vacation> {
    return api.post<Vacation>(`/users/${userId}/vacations`, payload).then((r) => r.data);
  },
  cancelVacation(userId: string, vacationId: string): Promise<Vacation> {
    return api
      .post<Vacation>(`/users/${userId}/vacations/${vacationId}/cancel`)
      .then((r) => r.data);
  },
};
