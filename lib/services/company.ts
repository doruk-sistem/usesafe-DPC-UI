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