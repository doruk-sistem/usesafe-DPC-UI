import { supabase } from "@/lib/supabase/client";
import type { Company, CompanyStats } from "@/lib/types/company";

import { createService } from "../api-client";

// Static metodlar için class
export class CompanyService {
  static async getCompany(id: string): Promise<Company> {
    if (!id) throw new Error("Company ID is required");

    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new Error(`Company not found with id: ${id}`);

    return data;
  }

  static async getCompanies(options: { status?: string; type?: string } = {}): Promise<Company[]> {
    let query = supabase.from("companies").select("*");

    if (options.status) {
      query = query.eq("status", options.status);
    }

    if (options.type) {
      query = query.eq("companyType", options.type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching companies:", error);
      throw error;
    }

    return data || [];
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

    // Extract supplier data from the nested structure and ensure it matches Company type
    return (data || []).map((item) => {
      const supplier = item.supplier as unknown as Company;
      return {
        id: supplier.id,
        name: supplier.name,
        companyType: supplier.companyType,
        taxInfo: supplier.taxInfo,
        status: supplier.status
      };
    });
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
            status: true
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
      .from("productstats")
      .select("total, active, pending, categories")
      .eq("company_id", companyId)
      .single();

    if (error) {
      console.error("Error fetching product stats:", error);
      return null;
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

      // Şirket bilgilerini getir
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single();

      if (companyError) {
        console.error("Supabase error:", {
          message: companyError.message,
          details: companyError.details,
          hint: companyError.hint,
          code: companyError.code
        });
        throw companyError;
      }

      if (!companyData) {
        console.warn(`No company found with id: ${id}`);
        return null;
      }

      // Şirket adreslerini getir
      const { data: addressData, error: addressError } = await supabase
        .from("company_addresses")
        .select("*")
        .eq("companyId", id);

      if (addressError) {
        console.error("Error fetching addresses:", addressError);
        throw addressError;
      }

      // Mevcut kullanıcı bilgilerini getir
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        throw userError;
      }

      // Adresleri tiplerine göre grupla
      const addresses = {
        headquarters: addressData?.find(addr => addr.type === "headquarters")?.street || "",
        factory: addressData?.find(addr => addr.type === "factory")?.street || "",
        branches: addressData?.filter(addr => addr.type === "branch").map(addr => addr.street).join("\n") || ""
      };

      // Yetkili kişi bilgilerini kullanıcı bilgilerinden al
      const authorizedPerson = {
        name: user?.user_metadata?.full_name || "",
        title: "Yetkili Kişi", // Varsayılan değer
        department: "Yönetim", // Varsayılan değer
        email: user?.email || "",
        phone: user?.phone || ""
      };

      return {
        id: companyData.id,
        name: companyData.name,
        companyType: companyData.companyType,
        taxInfo: companyData.taxInfo,
        status: companyData.status,
        email: companyData.email,
        phone: companyData.phone,
        fax: companyData.fax,
        website: companyData.website,
        address: addresses,
        authorizedPerson: authorizedPerson,
        notifications: companyData.notifications,
        createdAt: companyData.createdAt,
        updatedAt: companyData.updatedAt
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

    // Extract supplier data from the nested structure and ensure it matches Company type
    return (data || []).map((item) => {
      const supplier = item.supplier as unknown as Company;
      return {
        id: supplier.id,
        name: supplier.name,
        companyType: supplier.companyType,
        taxInfo: supplier.taxInfo,
        status: supplier.status
      };
    });
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
            status: true
          },
        ])
        .select()
        .single();

      if (companyError) throw companyError;

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