import { useEffect, useState } from 'react';
import {
  getDashboardMetrics,
  getRecentApprovals,
  getSystemAlerts,
  DashboardMetrics,
  RecentApproval,
  SystemAlert,
} from '@/lib/services/metric';

export type { RecentApproval, SystemAlert };

export function useMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [approvals, setApprovals] = useState<RecentApproval[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, approvalsData, alertsData] = await Promise.all([
          getDashboardMetrics(),
          getRecentApprovals(),
          getSystemAlerts()
        ]);

        setMetrics(metricsData);
        setApprovals(approvalsData);
        setAlerts(alertsData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    metrics,
    approvals,
    alerts,
    isLoading,
    error
  };
}
