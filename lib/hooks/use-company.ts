import { createApiHooks } from "../create-api-hooks";
import { companyService } from "../services/company";

export const { useGetCompaniesQuery: useCompanies, ...companyApiHooks } = createApiHooks(companyService);

export function useCompany(companyId: string) {
  if (!companyId) {
    throw new Error("Company ID is required");
  }

  const {
    data: company,
    isLoading,
    error,
  } = companyApiHooks.useGetCompanyQuery(
    { id: companyId },
    { 
      enabled: !!companyId,
      retry: 1
    }
  );

  if (error) {
    console.error("Error in useCompany:", error);
  }

  return {
    company,
    isLoading,
    error,
  };
}
