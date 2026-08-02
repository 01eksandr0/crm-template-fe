import type { CustomersListParams } from '../types';

export const customersKeys = {
  all: ['customers'] as const,
  lists: () => [...customersKeys.all, 'list'] as const,
  list: (params: CustomersListParams) => [...customersKeys.lists(), params] as const,
  details: () => [...customersKeys.all, 'detail'] as const,
  detail: (id: string) => [...customersKeys.details(), id] as const,
};
