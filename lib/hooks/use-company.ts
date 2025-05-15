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
    return data as CompanyDocument[];
  }
});