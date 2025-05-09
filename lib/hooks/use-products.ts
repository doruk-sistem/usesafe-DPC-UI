import { createApiHooks } from "../create-api-hooks";
import { productService } from "../services/product";

import { useAuth } from "./use-auth";

export const productsApiHooks = createApiHooks(productService);

export function useProducts(companyId?: string) {
  const { user, company } = useAuth();
  // Öncelikle company.id'yi kullan, yoksa userMetadata.company_id'yi kullan
  const defaultCompanyId = company?.id || user?.user_metadata?.company_id;
  // Eğer company_id "default" ise veya geçersizse, admin olarak işlem yap
  const targetCompanyId = (!defaultCompanyId || defaultCompanyId === "default") 
    ? "admin" 
    : (companyId || defaultCompanyId);
  
  const { data: products = [], isLoading, error } = productsApiHooks.useGetProductsQuery(
    { companyId: targetCompanyId },
    { 
      enabled: true,  // Always enable the query
      retry: false
    }
  );

  return { 
    products, 
    isLoading, 
    error,
    companyId: targetCompanyId 
  };
}