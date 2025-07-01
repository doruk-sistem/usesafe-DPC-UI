import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface ProductCategory {
  id: string;
  name: string;
  label: string;
  subcategories: ProductSubcategory[];
}

export interface ProductSubcategory {
  id: string;
  name: string;
  label: string;
  category_id: string;
}

export function useProductCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('product_categories')
          .select('*')
          .order('name');

        if (categoriesError) throw categoriesError;

        // Fetch subcategories
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('product_subcategories')
          .select('*')
          .order('name');

        if (subcategoriesError) throw subcategoriesError;

        // Combine categories with their subcategories
        const categoriesWithSubcategories = categoriesData?.map(category => ({
          id: category.id,
          name: category.name,
          label: category.label,
          subcategories: subcategoriesData?.filter(sub => sub.category_id === category.id) || []
        })) || [];

        setCategories(categoriesWithSubcategories);
      } catch (err) {
        console.error('Error fetching product categories:', err);
        setError(err instanceof Error ? err.message : 'Kategoriler yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryLabel = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.label || categoryId;
  };

  const getSubcategoryLabel = (subcategoryId: string): string => {
    for (const category of categories) {
      const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
      if (subcategory) return subcategory.label;
    }
    return subcategoryId;
  };

  return {
    categories,
    isLoading,
    error,
    getCategoryLabel,
    getSubcategoryLabel,
  };
} 