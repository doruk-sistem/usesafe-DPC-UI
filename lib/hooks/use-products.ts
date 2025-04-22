import { useAuth } from "./use-auth";
import { createApiHooks } from "../create-api-hooks";
import { productService } from "../services/product";

export const productsApiHooks = createApiHooks(productService);

export function useProducts(companyId?: string) {
  const { user, company } = useAuth();
  const defaultCompanyId = user?.user_metadata?.company_id || company?.id;
  const targetCompanyId = companyId || defaultCompanyId;
  
  const { data: products = [], isLoading, error } = productsApiHooks.useGetProductsQuery(
    { companyId: targetCompanyId },
    { 
      enabled: !!targetCompanyId,
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