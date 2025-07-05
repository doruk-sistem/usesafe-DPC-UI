import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export interface ProductType {
  id: number;
  product: string;
  description?: string;
  category_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  user_id?: string;
}

export interface ProductTypesByCategoryRequest {
  categoryId: number;
  select?: (keyof ProductType)[];
}

// Select query formatını düzenleyen yardımcı fonksiyon
function formatSelectQuery<T extends string>(select?: T[]): string {
  if (!select || select.length === 0) return "*";
  return select.join(", ");
}

export const productTypesService = {
  // Basit versiyon (mevcut)
  getTypesByCategory: async (categoryId: number): Promise<ProductType[]> => {
    try {
      const { data, error } = await supabase
        .from("product_types")
        .select("*")
        .eq("category_id", categoryId)
        .order("product");
      if (error) {
        console.error("Error fetching product types:", error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error in getTypesByCategory:", error);
      throw error;
    }
  },

  // Gelişmiş versiyon (yeni)
  getProductTypesByCategory: async ({
    categoryId,
    select,
  }: ProductTypesByCategoryRequest) => {
    const selectQuery = formatSelectQuery<keyof ProductType>(select);

    const { data, error } = await supabase
      .from("product_types")
      .select(selectQuery)
      .eq("category_id", categoryId)
      // .is("deleted_at", null) // Bu filtreyi kaldırdık
      .order("product", { ascending: true });

    if (error) throw error;
    return data as unknown as ProductType[];
  }
};

// Category ID'sine göre product types'ları getiren hook
export const useProductTypesByCategory = (params: ProductTypesByCategoryRequest) => {
  return useQuery({
    queryKey: ["product-types-by-category", params],
    queryFn: () => productTypesService.getProductTypesByCategory(params),
    enabled: !!params.categoryId, // categoryId varsa çalışır
  });
}; 