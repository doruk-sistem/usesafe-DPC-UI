import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface ProductCategory {
  id: number;
  name: string;
  label?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  user_id?: string | null;
}

export interface ProductSubcategory {
  id: number;
  name: string;
  label?: string;
  category_id: number;
}

export function useProductCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>([]);
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
          .order('id');

        if (categoriesError) throw categoriesError;

        // Fetch subcategories if the table exists
        try {
          const { data: subcategoriesData, error: subcategoriesError } = await supabase
            .from('product_subcategories')
            .select('*')
            .order('id');

          if (!subcategoriesError && subcategoriesData) {
            setSubcategories(subcategoriesData);
          }
        } catch (subError) {
          // Subcategories table might not exist, just continue
          console.log('Subcategories might not be available:', subError);
        }

        setCategories(categoriesData || []);
      } catch (err) {
        console.error('Error fetching product categories:', err);
        setError(err instanceof Error ? err.message : 'Kategoriler yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Kategori ID'sine göre kategori adını bul (string veya number olabilir)
  const getCategoryName = (categoryId: string | number): string => {
    // Eğer categoryId bir çeviri anahtarı formatındaysa (products.list.categories.XXX)
    if (typeof categoryId === 'string' && categoryId.startsWith('products.list.categories.')) {
      // Çeviri anahtarından kategori adını çıkar (son kısmı al)
      return categoryId.replace('products.list.categories.', '');
    }
    
    // Normal durumda ID'ye göre kategori adını bul
    const numericId = typeof categoryId === 'string' ? Number(categoryId) : categoryId;
    const category = categories.find(cat => cat.id === numericId);
    return category?.name || String(categoryId);
  };

  // Eski getCategoryLabel fonksiyonu için uyumluluk
  const getCategoryLabel = (categoryId: string | number): string => {
    return getCategoryName(categoryId);
  };

  const getSubcategoryName = (subcategoryId: string | number): string => {
    const numericId = typeof subcategoryId === 'string' ? Number(subcategoryId) : subcategoryId;
    const subcategory = subcategories.find(sub => sub.id === numericId);
    return subcategory?.name || String(subcategoryId);
  };

  return {
    categories,
    subcategories,
    isLoading,
    error,
    getCategoryName,
    getCategoryLabel, // Eski kod için uyumluluk
    getSubcategoryName,
  };
}