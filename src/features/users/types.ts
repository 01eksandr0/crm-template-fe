export interface Vacation {
  id: string;
  startDate: string;
  endDate: string;
  note: string | null;
  cancelledAt: string | null;
  status: 'active' | 'scheduled' | 'past' | 'cancelled';
  createdAt: string;
}

export interface UserRecord {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  phone: string | null;
  birthDate: string | null;
  hireDate: string | null;
  isActive: boolean;
  onVacation: boolean;
  currentVacation?: Vacation | null;
  roleId: string;
  roleName: string;
  roleDisplayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleOption {
  id: string;
  name: string;
  displayName: string;
}

export interface Paginated<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface UsersListParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  roleId?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  phone: string | null;
  birthDate: string | null;
  hireDate: string | null;
  isActive: boolean;
}

export type UpdateUserPayload = Omit<CreateUserPayload, 'password'> & { password?: string };

export interface CreateVacationPayload {
  startDate: string;
  endDate: string;
  note?: string | null;
}
