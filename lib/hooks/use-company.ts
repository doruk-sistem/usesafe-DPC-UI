import { useQuery } from "@tanstack/react-query";
import { CompanyService } from "@/lib/services/company";
import type { Company } from "@/lib/types/company";

interface UseCompaniesOptions {
  status?: string;
  type?: string;
}

export function useCompanies(options: UseCompaniesOptions = {}) {
  return useQuery<Company[], Error>({
    queryKey: ["companies", options],
    queryFn: () => CompanyService.getCompanies(options)
  });
}

export function useCompany(companyId: string) {
  return useQuery<Company, Error>({
    queryKey: ["company", companyId],
    queryFn: () => CompanyService.getCompany(companyId),
    enabled: !!companyId
  });
}
