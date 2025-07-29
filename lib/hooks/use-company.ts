import { supabase } from "@/lib/supabase/client";
import { Company, CompanyDocument } from "@/lib/types/company";

import { createApiHooks } from "../create-api-hooks";
import { companyService } from "../services/company";

import { useQueryClient, useMutation } from "@tanstack/react-query";

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
  },
  deleteCompanyDocument: async ({ documentId }: { documentId: string }) => {
    const { error } = await supabase
      .from("company_documents")
      .delete()
      .eq("id", documentId);

    if (error) throw error;
    return { success: true };
  }
});

// Manuel olarak delete mutation hook'u oluşturalım
export const useDeleteCompanyDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId }: { documentId: string }) => {
      const { error } = await supabase
        .from("company_documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      // Tüm company documents cache'lerini invalidate et
      queryClient.invalidateQueries({ queryKey: ['getCompanyDocuments'] });
    },
  });
};

// Belge silme hook'u (hem sertifikalar hem de belgeler için)
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId }: { documentId: string }) => {
      const { error } = await supabase
        .from("company_documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      // Hem company documents hem de documents cache'lerini invalidate et
      queryClient.invalidateQueries({ queryKey: ['getCompanyDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['companyDocuments'] });
    },
  });
};

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