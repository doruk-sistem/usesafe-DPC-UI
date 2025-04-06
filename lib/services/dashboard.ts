import { api } from '@/lib/api';

export interface DashboardMetrics {
  totalManufacturers: {
    count: number;
    change: number;
  };
  pendingApprovals: {
    count: number;
    change: number;
  };
  activeDPCs: {
    count: number;
    change: number;
  };
  documentVerifications: {
    count: number;
    change: number;
  };
  systemAlerts: {
    count: number;
    change: number;
  };
  verificationRate: {
    rate: number;
    change: number;
  };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await api.get('/admin/dashboard/metrics');
  return response.data;
} 