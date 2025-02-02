import { useEffect, useState } from 'react';

import { ProductService } from '@/lib/services/product';
import type { Product, ProductError } from '@/lib/types/product';

import { useAuth } from './use-auth';

export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ProductError | null>(null);
  const { company } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || !company?.id) return;

      try {
        setIsLoading(true);
        const response = await ProductService.getProduct(productId, company.id);
        
        if (response.error) {
          setError(response.error);
          setProduct(null);
        } else if (response.data) {
          setProduct(response.data);
          setError(null);
        }
      } catch (err) {
        setError({ message: err instanceof Error ? err.message : 'Failed to fetch product' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [company?.id, productId]);

  const updateProduct = async (updates: Partial<Product>) => {
    if (!product) return;

    try {
      const updateData = {
        ...updates,
        company_id: company?.id,
        images: updates.images?.map(img => ({
          url: img.url,
          alt: img.alt,
          is_primary: img.is_primary
        })),
        key_features: updates.key_features?.map(feature => ({
          name: feature.name,
          value: feature.value,
          unit: feature.unit
        }))
      };

      const response = await ProductService.updateProduct(product.id, updateData);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setProduct(response.data);
        setError(null);
      }

      return response;
    } catch (err) {
      const error = { message: err instanceof Error ? err.message : 'Failed to update product' };
      setError(error);
      return { error };
    }
  };

  return {
    product,
    isLoading,
    error,
    updateProduct
  };
}