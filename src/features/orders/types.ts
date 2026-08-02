export type OrderStatus =
  | 'new'
  | 'inProduction'
  | 'ready'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  colorId: string;
  colorName?: string;
  materialId: string;
  materialName?: string;
  kitId: string | null;
  kitName?: string | null;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  responsibleId: string;
  responsibleName: string;
  deliveryMethodId: string | null;
  deliveryMethodName: string | null;
  deliveryMethodCode?: string | null;
  city: string | null;
  deliveryPostOffice: string | null;
  deliveryAddress: string | null;
  paymentMethodId: string | null;
  paymentMethodName: string | null;
  comment: string | null;
  totalAmount: number;
  items?: OrderItem[];
  allowedNextStatuses?: OrderStatus[];
  editable?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface OrdersListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  responsibleId?: string;
  createdFrom?: string;
  createdTo?: string;
  amount?: number;
  sortBy?: 'createdAt' | 'number' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderItemPayload {
  productId: string;
  quantity: number;
  colorId: string;
  materialId: string;
  kitId?: string | null;
}

export interface OrderPayload {
  customerId: string;
  city?: string | null;
  deliveryMethodId?: string | null;
  deliveryPostOffice?: string | null;
  deliveryAddress?: string | null;
  paymentMethodId?: string | null;
  comment?: string | null;
  responsibleId?: string;
  items: OrderItemPayload[];
}

export interface Customer {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string | null;
  phone: string;
  city: string;
  deliveryMethodId: string | null;
  deliveryMethodCode?: string | null;
  deliveryMethodName?: string | null;
  deliveryPostOffice: string | null;
  deliveryAddress: string | null;
  displayName: string;
}

export interface CreateCustomerPayload {
  lastName: string;
  firstName: string;
  middleName?: string | null;
  phone: string;
  city: string;
  deliveryMethodId?: string | null;
  deliveryPostOffice?: string | null;
  deliveryAddress?: string | null;
}

export interface DictOption {
  id: string;
  name: string;
  code?: string;
}
