import { supabase } from "@/lib/supabase/client";

interface RawManufacturer {
  id: string;
  name: string;
  companyType: string;
}

interface RawMaterialManufacturer {
  material_id: string;
  manufacturer: RawManufacturer;
  assigned_by: string;
}

interface RawMaterial {
  id: string;
  name: string;
  percentage: number;
  recyclable: boolean;
  description?: string;
}

interface RawAssignedBy {
  id: string;
  name: string;
}

export interface MaterialManufacturer {
  id: string;
  material_id: string;
  manufacturer_id: string;
  assigned_by: string;
  created_at: string;
  updated_at: string;
  // Relations
  manufacturer?: {
    id: string;
    name: string;
    companyType: string;
  };
  assigned_by_company?: {
    id: string;
    name: string;
  };
}

export interface MaterialWithManufacturer {
  id: string;
  name: string;
  percentage: number;
  recyclable: boolean;
  description?: string;
  manufacturer?: {
    id: string;
    name: string;
    companyType: string;
  } | null;
  assigned_by?: {
    id: string;
    name: string;
  } | null;
}

export class MaterialManufacturerService {
  /**
   * Materyal üreticisi ata
   */
  static async assignManufacturer(data: {
    materialId: string;
    manufacturerId: string;
    assignedBy: string;
  }): Promise<MaterialManufacturer> {
    // Önce mevcut atamayı kontrol et
    const { data: existing } = await supabase
      .from("material_manufacturers")
      .select("id")
      .eq("material_id", data.materialId)
      .single();

    if (existing) {
      // Güncelle
      const { data: updated, error } = await supabase
        .from("material_manufacturers")
        .update({
          manufacturer_id: data.manufacturerId,
          assigned_by: data.assignedBy,
          updated_at: new Date().toISOString(),
        })
        .eq("material_id", data.materialId)
        .select()
        .single();

      if (error) throw error;
      return updated;
    } else {
      // Yeni oluştur
      const { data: created, error } = await supabase
        .from("material_manufacturers")
        .insert({
          material_id: data.materialId,
          manufacturer_id: data.manufacturerId,
          assigned_by: data.assignedBy,
        })
        .select()
        .single();

      if (error) throw error;
      return created;
    }
  }

  /**
   * Materyal üreticisi atamasını kaldır
   */
  static async removeAssignment(materialId: string): Promise<void> {
    const { error } = await supabase
      .from("material_manufacturers")
      .delete()
      .eq("material_id", materialId);

    if (error) throw error;
  }

  /**
   * Bir ürünün tüm materyallerini üreticileri ile birlikte getir
   */
  static async getProductMaterialsWithManufacturers(
    productId: string
  ): Promise<MaterialWithManufacturer[]> {
    const { data: materials, error: materialsError } = await supabase
      .from("product_materials")
      .select("*")
      .eq("product_id", productId)
      .order("percentage", { ascending: false });

    if (materialsError) throw materialsError;

    if (!materials || materials.length === 0) {
      return [];
    }

    // Her materyal için üretici bilgisini getir
    const materialIds = materials.map((m) => m.id);
    
    const { data: manufacturers, error: manufacturersError } = await supabase
      .from("material_manufacturers")
      .select(`
        material_id,
        manufacturer:companies!manufacturer_id(id, name, companyType),
        assigned_by_company:companies!assigned_by(id, name)
      `)
      .in("material_id", materialIds);

    if (manufacturersError) throw manufacturersError;

    // Materyal ve üretici verilerini birleştir
    return materials.map((material: RawMaterial) => {
      const manufacturerData = manufacturers?.find(
        (m) => m.material_id === material.id
      );

      const manufacturer = manufacturerData?.manufacturer as RawManufacturer | undefined;
      const assignedBy = manufacturerData?.assigned_by_company as RawAssignedBy | undefined;

      return {
        id: String(material.id),
        name: String(material.name),
        percentage: Number(material.percentage),
        recyclable: Boolean(material.recyclable),
        description: material.description ? String(material.description) : undefined,
        manufacturer: manufacturer ? {
          id: String(manufacturer.id),
          name: String(manufacturer.name),
          companyType: String(manufacturer.companyType)
        } : null,
        assigned_by: assignedBy ? {
          id: String(assignedBy.id),
          name: String(assignedBy.name)
        } : null
      };
    });
  }

  /**
   * Bir şirketin üretici olarak atandığı tüm materyalleri getir
   */
  static async getManufacturerMaterials(
    manufacturerId: string
  ): Promise<MaterialWithManufacturer[]> {
    const { data, error } = await supabase
      .from("material_manufacturers")
      .select(`
        material_id,
        assigned_by,
        material:product_materials!material_id(*),
        assigned_by_company:companies!assigned_by(id, name)
      `)
      .eq("manufacturer_id", manufacturerId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item) => {
      const material = item.material as unknown as RawMaterial;
      const assignedBy = item.assigned_by_company as unknown as RawAssignedBy | undefined;

      return {
        id: String(material.id),
        name: String(material.name),
        percentage: Number(material.percentage),
        recyclable: Boolean(material.recyclable),
        description: material.description ? String(material.description) : undefined,
        assigned_by: assignedBy ? {
          id: String(assignedBy.id),
          name: String(assignedBy.name)
        } : null
      };
    });
  }

  /**
   * Bir şirketin atadığı tüm materyal üreticilerini getir
   */
  static async getAssignedMaterials(
    assignedBy: string
  ): Promise<MaterialWithManufacturer[]> {
    const { data, error } = await supabase
      .from("material_manufacturers")
      .select(`
        material_id,
        manufacturer_id,
        material:product_materials!material_id(*),
        manufacturer:companies!manufacturer_id(id, name, companyType)
      `)
      .eq("assigned_by", assignedBy);

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item) => {
      const material = item.material as unknown as RawMaterial;
      const manufacturer = item.manufacturer as unknown as RawManufacturer | undefined;

      return {
        id: String(material.id),
        name: String(material.name),
        percentage: Number(material.percentage),
        recyclable: Boolean(material.recyclable),
        description: material.description ? String(material.description) : undefined,
        manufacturer: manufacturer ? {
          id: String(manufacturer.id),
          name: String(manufacturer.name),
          companyType: String(manufacturer.companyType)
        } : null
      };
    });
  }

  /**
   * Tüm şirketleri materyal üreticisi olarak getir
   */
  static async getAvailableManufacturers(): Promise<{
    id: string;
    name: string;
    companyType: string;
  }[]> {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, companyType")
      .eq("companyType", "manufacturer")
      .order("name");

    if (error) throw error;

    return (data || []).map((manufacturer) => ({
      id: String(manufacturer.id),
      name: String(manufacturer.name),
      companyType: String(manufacturer.companyType)
    }));
  }
} 