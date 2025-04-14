import { supabase } from "@/lib/supabase/client";
import type { Company, CompanyStats } from "@/lib/types/company";
import { createService } from "../api-client";

interface SupplierResponse {
  supplier: {
    id: string;
    name: string;
    companyType: string;
    taxInfo: {
      taxNumber: string;
      tradeRegistryNo?: string;
      mersisNo?: string;
    };
    status: string;
  };
}

// Static metodlar için class
export class CompanyService {
  static async getCompany(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, taxInfo, companyType, status")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching company:", error);
      return null;
    }

    return data;
  }

  static async getSuppliers(companyId: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from("company_suppliers")
      .select(
        `
        supplier:supplier_id (
          id,
          name,
          companyType,
          taxInfo,
          status
        )
      `
      )
      .eq("company_id", companyId);

    if (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }

    const suppliers = (data as unknown as { supplier: Company }[]).map(item => item.supplier);
    return suppliers;
  }

  static async createManufacturer(
    data: {
      name: string;
      taxInfo: {
        taxNumber: string;
      };
      companyType: string;
      contact: {
        name: string;
        email: string;
      };
    },
    mainCompany: Company
  ): Promise<{ success: boolean; message?: string; companyId?: string }> {
    try {
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert([
          {
            name: data.name,
            taxInfo: data.taxInfo,
            companyType: data.companyType,
          },
        ])
        .select()
        .single();

      if (companyError) throw companyError;

      try {
        const response = await fetch('/api/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: data.contact.email, 
            company_name: mainCompany?.name,
            full_name: data.contact.name,
            company_id: company.id,
          }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error);
        }
      } catch (error) {
        throw error;
      }

      return {
        success: true,
        companyId: company.id,
      };
    } catch (error) {
      console.error("Error creating manufacturer:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create manufacturer",
      };
    }
  }

  static async searchManufacturers(query: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, taxInfo, companyType, status")
      .or(`name.ilike.%${query}%, taxInfo->>'taxNumber'.ilike.%${query}%`)
      .in("companyType", ["manufacturer", "factory"])
      .limit(10);

    if (error) {
      console.error("Error searching manufacturers:", error);
      throw error;
    }

    return data || [];
  }

  static async getManufacturer(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, taxInfo, companyType, status")
      .eq("id", id)
      .in("companyType", ["manufacturer", "factory"])
      .single();

    if (error) {
      console.error("Error fetching manufacturer:", error);
      return null;
    }

    return data;
  }

  static async getProductStats(companyId: string): Promise<CompanyStats | null> {
    const { data, error } = await supabase
      .from("productStats")
      .select("total, active, pending, categories")
      .eq("company_id", companyId)
      .single();

    if (error) {
      console.error("Error fetching product stats:", error);
      return null;
    }

    return data;
  }

  static async getProducts(companyId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", companyId);

    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }

    return data;
  }
}

// API client için service object
export const companyService = createService({
  // Tüm şirketleri getir
  getCompanies: async (_: {}): Promise<Company[]> => {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, taxInfo, companyType, status")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Error fetching companies:", error.message, error.details, error.hint);
      throw error;
    }

    return data || [];
  },

  // Tek bir şirketi getir
  getCompany: async ({ id }: { id: string }): Promise<Company | null> => {
    try {
      if (!id) {
        throw new Error("Company ID is required");
      }

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!data) {
        console.warn(`No company found with id: ${id}`);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        companyType: data.companyType,
        taxInfo: data.taxInfo,
        status: data.status,
        email: data.email,
        phone: data.phone
      };
    } catch (error) {
      console.error("Error in getCompany:", error);
      throw error;
    }
  },

  // Tedarikçileri getir
  getSuppliers: async ({ companyId }: { companyId: string }): Promise<Company[]> => {
    const { data, error } = await supabase
      .from("company_suppliers")
      .select(
        `
        supplier:supplier_id (
          id,
          name,
          companyType,
          taxInfo,
          status
        )
      `
      )
      .eq("company_id", companyId);

    if (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }

    const suppliers = (data as unknown as { supplier: Company }[]).map(item => item.supplier);
    return suppliers;
  },

  // Üretici oluştur
  createManufacturer: async (data: {
    name: string;
    taxInfo: {
      taxNumber: string;
    };
    companyType: string;
    contact: {
      name: string;
      email: string;
    };
  }): Promise<{ success: boolean; message?: string; companyId?: string }> => {
    try {
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert([
          {
            name: data.name,
            taxInfo: data.taxInfo,
            companyType: data.companyType,
          },
        ])
        .select()
        .single();

      if (companyError) throw companyError;

      const { data: auth, error: authError } = await supabase.auth.signUp({
        email: data.contact.email,
        password: Math.random().toString(36).slice(-8),
        options: {
          data: {
            full_name: data.contact.name,
            company_id: company.id,
            role: "manufacturer",
          },
        },
      });

      if (authError) throw authError;

      return {
        success: true,
        companyId: company.id,
      };
    } catch (error) {
      console.error("Error creating manufacturer:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create manufacturer",
      };
    }
  },

  // Üreticileri ara
  searchManufacturers: async (query: string): Promise<Company[]> => {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, taxInfo, companyType, status")
      .or(`name.ilike.%${query}%, taxInfo->>'taxNumber'.ilike.%${query}%`)
      .in("companyType", ["manufacturer", "factory"])
      .limit(10);

    if (error) {
      console.error("Error searching manufacturers:", error);
      throw error;
    }

    return data || [];
  },

  // Üretici getir
  getManufacturer: async (id: string): Promise<Company | null> => {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, taxInfo, companyType, status")
      .eq("id", id)
      .in("companyType", ["manufacturer", "factory"])
      .single();

    if (error) {
      console.error("Error fetching manufacturer:", error);
      return null;
    }

    return data;
  },
});