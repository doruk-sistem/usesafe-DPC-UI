import { supabase } from "@/lib/supabase/client";

export interface Material {
  id: string;
  name: string;
  percentage: number;
  recyclable: boolean;
  description?: string;
  sustainability_score?: number;
  carbon_footprint?: string;
  water_usage?: string;
  energy_consumption?: string;
  chemical_usage?: string;
  co2_emissions?: string;
  recycled_content_percentage?: number;
  biodegradability_percentage?: number;
  minimum_durability_years?: number;
  water_consumption_per_unit?: string;
  greenhouse_gas_emissions?: string;
  chemical_consumption_per_unit?: string;
  recycled_materials_percentage?: number;
}

export interface CreateMaterialData {
  product_id: string;
  name: string;
  percentage: number;
  recyclable: boolean;
  description?: string;
}

export interface UpdateMaterialData {
  sustainability_score?: number;
  carbon_footprint?: string;
  water_usage?: string;
  energy_consumption?: string;
  chemical_usage?: string;
  co2_emissions?: string;
  recycled_content_percentage?: number;
  biodegradability_percentage?: number;
  minimum_durability_years?: number;
  water_consumption_per_unit?: string;
  greenhouse_gas_emissions?: string;
  chemical_consumption_per_unit?: string;
  recycled_materials_percentage?: number;
}

export const materialsService = {
  // Get materials for a product with sustainability metrics
  async getMaterialsWithSustainability(productId: string): Promise<Material[]> {
    try {
      const { data, error } = await supabase
        .from("product_materials")
        .select(`
          id, 
          name, 
          percentage, 
          recyclable, 
          description,
          sustainability_score,
          carbon_footprint,
          water_usage,
          energy_consumption,
          chemical_usage,
          co2_emissions,
          recycled_content_percentage,
          biodegradability_percentage,
          minimum_durability_years,
          water_consumption_per_unit,
          greenhouse_gas_emissions,
          chemical_consumption_per_unit,
          recycled_materials_percentage
        `)
        .eq("product_id", productId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching materials with sustainability:", error);
      throw error;
    }
  },

  // Get basic materials for a product
  async getMaterials(productId: string): Promise<Material[]> {
    try {
      const { data, error } = await supabase
        .from("product_materials")
        .select("id, name, percentage, recyclable, description")
        .eq("product_id", productId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching materials:", error);
      throw error;
    }
  },

  // Add a new material
  async addMaterial(materialData: CreateMaterialData): Promise<Material> {
    try {
      const { data, error } = await supabase
        .from("product_materials")
        .insert(materialData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error adding material:", error);
      throw error;
    }
  },

  // Remove a material
  async removeMaterial(materialId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("product_materials")
        .delete()
        .eq("id", materialId);

      if (error) throw error;
    } catch (error) {
      console.error("Error removing material:", error);
      throw error;
    }
  },

  // Update material sustainability metrics
  async updateMaterialSustainability(materialId: string, sustainabilityData: UpdateMaterialData): Promise<void> {
    try {
      const { error } = await supabase
        .from("product_materials")
        .update(sustainabilityData)
        .eq("id", materialId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating material sustainability:", error);
      throw error;
    }
  },

  // Update multiple materials with sustainability metrics
  async updateMaterialsSustainability(materials: Material[], sustainabilityData: UpdateMaterialData): Promise<void> {
    try {
      const updatePromises = materials.map(material => 
        this.updateMaterialSustainability(material.id, sustainabilityData)
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating materials sustainability:", error);
      throw error;
    }
  }
};
