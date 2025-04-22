import { createApiHooks } from "../create-api-hooks";
import { companyService } from "../services/company";

export const companyApiHooks = createApiHooks(companyService);

export function useCompanies(params: any = {}) {
  const { data = [], isLoading, error } = companyApiHooks.useGetCompaniesQuery(params, {
    retry: false
  });

  return {
    companies: data,
    isLoading,
    error
  };
}