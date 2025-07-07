import { supabase } from "@/lib/supabase/client";
import type { KeyFeature, ProductKeyFeature } from "@/lib/types/product";

export const productKeyFeaturesService = {
  // Belirli bir ürünün key features'larını getir
  getByProductId: async (productId: string): Promise<ProductKeyFeature[]> => {
    try {
      const { data, error } = await supabase
        .from("product_key_features")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching product key features:", error);
      return [];
    }
  },

  // Yeni key features'ları oluştur
  create: async (productId: string, features: KeyFeature[]): Promise<ProductKeyFeature[]> => {
    try {
      // Önce mevcut key features'ları sil
      await supabase
        .from("product_key_features")
        .delete()
        .eq("product_id", productId);

      // Yeni key features'ları ekle
      if (features.length > 0) {
        const keyFeaturesData = features.map(feature => ({
          product_id: productId,
          name: feature.name,
          value: feature.value,
          unit: feature.unit,
        }));

        const { data, error } = await supabase
          .from("product_key_features")
          .insert(keyFeaturesData)
          .select("*");

        if (error) throw error;
        return data || [];
      }

      return [];
    } catch (error) {
      console.error("Error creating product key features:", error);
      throw error;
    }
  },

  // Key features'ları güncelle
  update: async (productId: string, features: KeyFeature[]): Promise<ProductKeyFeature[]> => {
    try {
      // Önce mevcut key features'ları sil
      await supabase
        .from("product_key_features")
        .delete()
        .eq("product_id", productId);

      // Yeni key features'ları ekle
      if (features.length > 0) {
        const keyFeaturesData = features.map(feature => ({
          product_id: productId,
          name: feature.name,
          value: feature.value,
          unit: feature.unit,
        }));

        const { data, error } = await supabase
          .from("product_key_features")
          .insert(keyFeaturesData)
          .select("*");

        if (error) throw error;
        return data || [];
      }

      return [];
    } catch (error) {
      console.error("Error updating product key features:", error);
      throw error;
    }
  },

  // Key features'ları sil
  delete: async (productId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("product_key_features")
        .delete()
        .eq("product_id", productId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting product key features:", error);
      throw error;
    }
  },
}; 