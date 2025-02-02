import { useEffect, useState } from 'react';

import { ProductService } from '@/lib/services/product';
import type { Product } from '@/lib/types/product';

import { useAuth } from './use-auth';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { company } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!company?.id) return;
      
      try {
        setIsLoading(true);
        const data = await ProductService.getProducts(company.id);
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [company?.id]);

  const refreshProducts = async () => {
    if (!company?.id) return;
    
    try {
      const data = await ProductService.getProducts(company.id);
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