export interface Customer {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string | null;
  phone: string;
  city: string;
  deliveryMethodId: string | null;
  deliveryMethodName: string | null;
  deliveryMethodCode: string | null;
  deliveryPostOffice: string | null;
  deliveryAddress: string | null;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface CustomersListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'lastName' | 'phone' | 'city' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerPayload {
  lastName: string;
  firstName: string;
  middleName?: string | null;
  phone: string;
  city: string;
  deliveryMethodId?: string | null;
  deliveryPostOffice?: string | null;
  deliveryAddress?: string | null;
}
