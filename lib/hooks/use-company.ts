import { createApiHooks } from "../create-api-hooks";
import { companyService } from "../services/company";

export const companyApiHooks = createApiHooks(companyService);

export function useCompany(id: string) {
  const { data, isLoading, error } = companyApiHooks.useGetCompanyQuery(
    { id },
    { 
      enabled: !!id,
      retry: false
    }
  );

  return { 
    data, 
    isLoading, 
    error
  };
}