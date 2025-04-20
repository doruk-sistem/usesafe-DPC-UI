import { useEffect, useState } from 'react';

import { DPPService } from '@/lib/services/dpp';
import type { DPPListItem } from '@/lib/types/dpp';

import { useAuth } from './use-auth';

export function useDPPs() {
  const [dpps, setDPPs] = useState<DPPListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const companyId = user?.user_metadata?.company_id || "7d26ed35-49ca-4c0d-932e-52254fb0e5b8";

  useEffect(() => {
    const fetchDPPs = async () => {
      if (!companyId) return;

      try {
        setIsLoading(true);
        const data = await DPPService.getDPPs(companyId);
        setDPPs(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch DPPs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDPPs();
  }, [companyId]);

  const refreshDPPs = async () => {
    if (!companyId) return;

    try {
      const data = await DPPService.getDPPs(companyId);
      setDPPs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch DPPs');
    }
  };

  return {
    dpps,
    isLoading,
    error,
    refreshDPPs
  };
}