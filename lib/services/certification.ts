import { supabase } from "@/lib/supabase/client";

import { createService } from "../api-client";

export interface CreateCertificationInput {
  type: string;
  companyId: string;
  filePath: string;
}

export interface CertificationDetails {
  id: string;
  type: string;
  status: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
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
      throw error;
    }

    return certification;
  }

  static async getCertificationDetails(id: string): Promise<CertificationDetails | null> {
    const { data: certification, error } = await supabase
      .from("company_documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !certification) {
      return null;
    }

    return certification;
  }

  static async getCertificationPublicUrl(filePath: string): Promise<string> {
    const { data: { publicUrl } } = supabase.storage
      .from("company-documents")
      .getPublicUrl(filePath);

    return publicUrl;
  }
}

type CertificationServiceType = {
  createCertification: (data: CreateCertificationInput) => Promise<any>;
  getCertificationDetails: (id: string) => Promise<CertificationDetails | null>;
  getCertificationPublicUrl: (filePath: string) => Promise<string>;
};

export const certificationService = createService<CertificationServiceType>({
  createCertification: async (data: CreateCertificationInput) => {
    return CertificationService.createCertification(data);
  },
  getCertificationDetails: async (id: string) => {
    return CertificationService.getCertificationDetails(id);
  },
  getCertificationPublicUrl: async (filePath: string) => {
    return CertificationService.getCertificationPublicUrl(filePath);
  }
});
