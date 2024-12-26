import { useEffect, useState } from 'react';

import { DPPTemplateService } from '@/lib/services/dpp-template';
import type { DPPTemplate } from '@/lib/types/dpp';

export function useDPPTemplates() {
  const [templates, setTemplates] = useState<DPPTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const data = await DPPTemplateService.getTemplates();
        setTemplates(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const refreshTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await DPPTemplateService.getTemplates();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    templates,
    isLoading,
    error,
    refreshTemplates
  };
}