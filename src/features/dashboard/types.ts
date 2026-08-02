export type ChartGranularity = 'year' | 'quarter' | 'month' | 'week';

export interface DashboardMetric {
  key: string;
  value: number;
  unit?: string;
}

export interface DashboardChartPoint {
  label: string;
  value: number;
  revenue: number;
  avgOrderValue: number;
  periodStart: string;
  periodEnd: string;
}

export interface DashboardChartSeries {
  points: DashboardChartPoint[];
}

export interface DashboardAnalytics {
  metrics: DashboardMetric[];
  chart: {
    defaultGranularity: ChartGranularity;
    series: Record<ChartGranularity, DashboardChartSeries>;
  };
  computedAt: string;
  weekKey: string;
}

export interface DashboardWorkspace {
  myActiveOrders: number;
  myNewOrders: number;
}

export interface DashboardResponse {
  greeting: {
    firstName: string | null;
    roleDisplayName?: string;
  };
  canViewAnalytics: boolean;
  analytics: DashboardAnalytics | null;
  workspace: DashboardWorkspace | null;
}
