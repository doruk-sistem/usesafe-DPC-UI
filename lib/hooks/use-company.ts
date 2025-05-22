import { supabase } from "@/lib/supabase/client";
import { Company, CompanyDocument } from "@/lib/types/company";

import { createApiHooks } from "../create-api-hooks";
import { companyService } from "../services/company";

export const companyApiHooks = createApiHooks({
  ...companyService,
  getCompanyDocuments: async ({ companyId }: { companyId: string }) => {
    const { data, error } = await supabase
      .from("company_documents")
      .select("*")
      .eq("companyId", companyId)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    
    // Kayıt belgeleri ve opsiyonel sertifikaları belge türüne göre ayırt ediyoruz
    const filteredData = data?.filter(doc => {
      // Kayıt belgeleri (bunları göstermeyeceğiz)
      const registrationDocTypes = [
        "signature_circular",
        "trade_registry_gazette",
        "tax_plate",
        "activity_certificate"
      ];
      
      // Opsiyonel sertifikalar (bunları göstereceğiz)
      const optionalCertTypes = [
        "iso_certificate",
        "quality_certificate",
        "export_certificate",
        "production_permit"
      ];
      
      // Belge türü opsiyonel sertifika ise göster
      return optionalCertTypes.includes(doc.type);
    });
    
    return filteredData as CompanyDocument[];
  }
});

// Export the hooks that are used in components
export const useCompany = (companyId: string) => {
  const { data: company, isLoading, error } = companyApiHooks.useGetCompanyQuery({ id: companyId });
  
  return {
    company,
    isLoading,
    error
  };
};

export const useCompanies = () => {
  const { data: companies = [], isLoading, error } = companyApiHooks.useGetCompaniesQuery({});
  
  return {
    companies,
    isLoading,
    error
  };
};