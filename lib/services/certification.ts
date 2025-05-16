import { supabase } from "@/lib/supabase/client";
import { createService } from "../api-client";

export interface CreateCertificationInput {
  type: string;
  companyId: string;
  filePath: string;
}

export class CertificationService {
  static async createCertification(data: CreateCertificationInput) {
    const { data: certification, error } = await supabase
      .from("company_documents")
      .insert([
        {
          type: data.type,
          companyId: data.companyId,
          filePath: data.filePath,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating certification - Full error:", JSON.stringify(error, null, 2));
      console.error("Attempted data:", JSON.stringify({
        type: data.type,
        companyId: data.companyId,
        filePath: data.filePath,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, null, 2));
      throw error;
    }

    return certification;
  }
}

type CertificationServiceType = {
  createCertification: (data: CreateCertificationInput) => Promise<any>;
};

export const certificationService = createService<CertificationServiceType>({
  createCertification: async (data: CreateCertificationInput) => {
    return CertificationService.createCertification(data);
  }
});
