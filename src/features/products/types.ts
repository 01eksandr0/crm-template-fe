export interface Product {
  id: string;
  number: number;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ProductsListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'number' | 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductPayload {
  name: string;
  price: number;
}
