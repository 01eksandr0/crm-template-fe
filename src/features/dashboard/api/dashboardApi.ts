import { api } from '@/shared/http/client';
import type { DashboardResponse } from '../types';

export const dashboardApi = {
  getStats(): Promise<DashboardResponse> {
    return api.get<DashboardResponse>('/dashboard/stats').then((r) => r.data);
  },
};
