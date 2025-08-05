import { useState, useEffect } from 'react';

import { ChatGPTService, type ProductDocumentGuidance } from '@/lib/services/chatgpt';

interface UseChatGPTGuidanceProps {
  productType: string; // LABEL (isim) olarak gelmeli
  subcategory: string; // LABEL (isim) olarak gelmeli
  weight?: number; // Ürün ağırlığı (kg)
  enabled?: boolean;
}

export function useChatGPTGuidance({
  productType,
  subcategory,
  weight,
  enabled = true,
}: UseChatGPTGuidanceProps) {
  const [guidance, setGuidance] = useState<ProductDocumentGuidance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !productType || !subcategory) {
      setGuidance(null);
      return;
    }

    const fetchGuidance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Artık doğrudan label (isim) gönderiyoruz ve weight'i ekliyoruz
        const result = await ChatGPTService.getDocumentGuidance(productType, subcategory, weight);
        setGuidance(result);
      } catch (err) {
        console.error('Error fetching ChatGPT guidance:', err);
        setError(err instanceof Error ? err.message : 'Belge rehberliği alınamadı');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchGuidance, 1000);

    return () => clearTimeout(timeoutId);
  }, [productType, subcategory, weight, enabled]);

  const refreshGuidance = async () => {
    if (!productType || !subcategory) return;

    setIsLoading(true);
    setError(null);

    try {
      // Artık doğrudan label (isim) gönderiyoruz ve weight'i ekliyoruz
      const result = await ChatGPTService.getDocumentGuidance(productType, subcategory, weight);
      setGuidance(result);
    } catch (err) {
      console.error('Error refreshing ChatGPT guidance:', err);
      setError(err instanceof Error ? err.message : 'Belge rehberliği yenilenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    guidance,
    isLoading,
    error,
    refreshGuidance,
  };
} 