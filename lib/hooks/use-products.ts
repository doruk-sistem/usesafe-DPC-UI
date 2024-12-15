import { useEffect, useState } from 'react';

import { ProductService } from '@/lib/services/product';
import type { Product } from '@/lib/types/product';

import { useAuth } from './use-auth';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const companyId = user?.user_metadata["company_id"] || "7d26ed35-49ca-4c0d-932e-52254fb0e5b8";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await ProductService.getProducts(companyId);
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [companyId]);

  const refreshProducts = async () => {
    try {
      const data = await ProductService.getProducts(companyId);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    }
  };

  return {
    products,
    isLoading,
    error,
    refreshProducts
  };
}