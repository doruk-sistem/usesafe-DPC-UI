import { supabase } from "@/lib/supabase/client";

export interface ProductCategory {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  user_id?: string;
}

export const productCategoriesService = {
  getCategories: async (): Promise<ProductCategory[]> => {
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .is("deleted_at", null) // Silinmemiş kayıtları getir
        .order("name");

      if (error) {
        console.error("Error fetching product categories:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getCategories:", error);
      throw error;
    }
  },

  createCategory: async (name: string): Promise<ProductCategory> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("product_categories")
        .insert([{ 
          name, 
          user_id: userData.user?.id 
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating product category:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in createCategory:", error);
      throw error;
    }
  },

  updateCategory: async (id: number, name: string): Promise<ProductCategory> => {
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .update({ name })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating product category:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in updateCategory:", error);
      throw error;
    }
  },

  deleteCategory: async (id: number): Promise<void> => {
    try {
      const { error } = await supabase
        .from("product_categories")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Error deleting product category:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in deleteCategory:", error);
      throw error;
    }
  }
}; 