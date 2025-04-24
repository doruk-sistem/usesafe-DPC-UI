import { createApiHooks } from "../create-api-hooks";
import { companyService } from "../services/company";

export const companyApiHooks = createApiHooks(companyService);

export const useCompanies = () => {
  const { data: companies, isLoading, error } = companyApiHooks.useGetCompaniesQuery({});
  
  return {
    companies,
    isLoading,
    error
  };
};