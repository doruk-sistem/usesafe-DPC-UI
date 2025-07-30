import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface RawManufacturer {
  id: string;
  name: string;
  companyType: string;
}

interface RawMaterialManufacturer {
  material_id: string;
  manufacturer: RawManufacturer;
}

export interface ManufacturedProduct {
  id: string;
  name: string;
  description?: string;
  model: string;
  status: string;
  company_id: string;
  manufacturer_id: string;
  created_at: string;
  updated_at: string;
  // Relations
  brand_owner?: {
    id: string;
    name: string;
    companyType: string;
  };
  materials?: {
    id: string;
    name: string;
    percentage: number;
    recyclable: boolean;
    description?: string;
    assignedManufacturer?: {
      id: string;
      name: string;
      companyType: string;
    } | null;
  }[];
}

/**
 * Bir şirketin üretici olarak atandığı ürünleri getir
 */
export function useManufacturedProducts(manufacturerId?: string) {
  return useQuery({
    queryKey: ["manufactured-products", manufacturerId],
    queryFn: async (): Promise<ManufacturedProduct[]> => {
      if (!manufacturerId) {
        return [];
      }

      // Önce ürünleri ve materyalleri çekelim
      const { data: products, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          model,
          status,
          company_id,
          manufacturer_id,
          created_at,
          updated_at,
          brand_owner:companies!products_company_id_fkey(id, name, companyType),
          materials:product_materials(
            id, 
            name, 
            percentage, 
            recyclable, 
            description
          )
        `)
        .eq("manufacturer_id", manufacturerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching manufactured products:", error);
        throw error;
      }

      // Eğer ürün yoksa boş array dön
      if (!products || products.length === 0) {
        return [];
      }

      // Tüm materyal ID'lerini toplayalım
      const materialIds = products
        .flatMap(p => p.materials || [])
        .map(m => m.id);

      // Materyal üreticilerini ayrı bir sorgu ile çekelim
      const { data: materialManufacturers, error: manufacturersError } = await supabase
        .from('material_manufacturers')
        .select(`
          material_id,
          manufacturer:companies!material_manufacturers_manufacturer_id_fkey(
            id,
            name,
            companyType
          )
        `)
        .in('material_id', materialIds);

      if (manufacturersError) {
        console.error("Error fetching material manufacturers:", manufacturersError);
        throw manufacturersError;
      }

      // Ürünleri ve materyal üreticilerini birleştirelim
      const transformedProducts: ManufacturedProduct[] = products.map(product => {
        // brand_owner'ı düzelt
        const brandOwner = Array.isArray(product.brand_owner) 
          ? product.brand_owner[0] 
          : product.brand_owner;

        // Materyalleri dönüştür
        const materials = product.materials?.map(material => {
          const manufacturerData = materialManufacturers
            ?.find(mm => mm.material_id === material.id) as RawMaterialManufacturer | undefined;

          // Üretici bilgisini düzelt
          const assignedManufacturer = manufacturerData?.manufacturer ? {
            id: String(manufacturerData.manufacturer.id),
            name: String(manufacturerData.manufacturer.name),
            companyType: String(manufacturerData.manufacturer.companyType)
          } : null;

          return {
            id: String(material.id),
            name: String(material.name),
            percentage: Number(material.percentage),
            recyclable: Boolean(material.recyclable),
            description: material.description ? String(material.description) : undefined,
            assignedManufacturer
          };
        });

        return {
          id: String(product.id),
          name: String(product.name),
          description: product.description ? String(product.description) : undefined,
          model: String(product.model),
          status: String(product.status),
          company_id: String(product.company_id),
          manufacturer_id: String(product.manufacturer_id),
          created_at: String(product.created_at),
          updated_at: String(product.updated_at),
          brand_owner: brandOwner ? {
            id: String(brandOwner.id),
            name: String(brandOwner.name),
            companyType: String(brandOwner.companyType)
          } : undefined,
          materials
        };
      });

      return transformedProducts;
    },
    enabled: !!manufacturerId,
  });
}

/**
 * Bir şirketin üretici olarak atandığı ürünlerin sayısını getir
 */
export function useManufacturedProductsCount(manufacturerId: string) {
  return useQuery({
    queryKey: ["manufactured-products-count", manufacturerId],
    queryFn: async (): Promise<number> => {
      if (!manufacturerId) {
        return 0;
      }

      const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("manufacturer_id", manufacturerId);

      if (error) {
        console.error("Error fetching manufactured products count:", error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!manufacturerId,
  });
} 