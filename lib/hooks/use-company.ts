import { createApiHooks } from "../create-api-hooks";
import { companyService } from "../services/company";

export const companyApiHooks = createApiHooks(companyService);

export function useCompany(companyId?: string) {
  const { data: company, isLoading, error } = companyApiHooks.useGetCompanyQuery(
    { id: companyId },
    {
      enabled: !!companyId,
      retry: false
    }
  );

  return {
    company,
    isLoading,
    error
  };
}

export function useCompanies() {
  const { data: companies = [], isLoading, error } = companyApiHooks.useGetCompaniesQuery(
    {},
    {
      retry: false
    }
  );

  return {
    companies,
    isLoading,
    error
  };
}