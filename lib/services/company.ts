import { supabase } from '@/lib/supabase';
import type { Company } from '@/lib/types/company';

export class CompanyService {
  static async getCompany(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, taxInfo, companyType')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching company:', error);
      return null;
    }

    return data;
  }

  static async getSuppliers(companyId: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from('company_suppliers')
      .select(`
        supplier:supplier_id (
          id,
          name,
          companyType,
          taxInfo
        )
      `)
      .eq('company_id', companyId);

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    // Extract supplier data from the nested structure
    return data.map(item => item.supplier);
  }

  static async createManufacturer(data: {
    name: string;
    taxInfo: {
      taxNumber: string;
    };
    companyType: string;
    contact: {
      name: string;
      email: string;
    };
  }): Promise<{ success: boolean; message?: string; companyId?: string }> {
    try {
      // Create company record
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: data.name,
          taxInfo: data.taxInfo,
          companyType: data.companyType,
        }])
        .select()
        .single();

      if (companyError) throw companyError;

      // Create user for contact person
      const { data: auth, error: authError } = await supabase.auth.signUp({
        email: data.contact.email,
        password: Math.random().toString(36).slice(-8), // Generate random password
        options: {
          data: {
            full_name: data.contact.name,
            company_id: company.id,
            role: 'manufacturer'
          }
        }
      });

      if (authError) throw authError;

      return {
        success: true,
        companyId: company.id
      };
    } catch (error) {
      console.error('Error creating manufacturer:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create manufacturer'
      };
    }
  }

  static async searchManufacturers(query: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, taxInfo')
      .or(`name.ilike.%${query}%, taxInfo->>'taxNumber'.ilike.%${query}%`)
      .in('companyType', ['manufacturer', 'factory'])
      .limit(10);

    if (error) {
      console.error('Error searching manufacturers:', error);
      throw error;
    }

    return data || [];
  }

  static async getManufacturer(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, taxInfo, companyType')
      .eq('id', id)
      .in('companyType', ['manufacturer', 'factory'])
      .single();

    if (error) {
      console.error('Error fetching manufacturer:', error);
      return null;
    }

    return data;
  }
}