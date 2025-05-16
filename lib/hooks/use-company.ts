import { supabase } from "@/lib/supabase/client";
import { CompanyDocument } from "@/lib/types/company";

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
    
    console.log("Veritabanından gelen tüm belgeler:", data);
    
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
    
    console.log("Filtrelenmiş belgeler (sadece opsiyonel sertifikalar):", filteredData);
    
    return filteredData as CompanyDocument[];
  }
});