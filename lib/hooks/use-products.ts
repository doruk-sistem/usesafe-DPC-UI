import { createApiHooks } from "../create-api-hooks";
import { productService } from "../services/product";

import { useAuth } from "./use-auth";

export const productsApiHooks = createApiHooks(productService);

export function useProducts(companyId?: string) {
  const { user, company } = useAuth();
  const isAdmin = user?.user_metadata?.role === "admin";
  const defaultCompanyId = isAdmin ? undefined : (user?.user_metadata?.company_id || company?.id);
  const targetCompanyId = companyId || defaultCompanyId;
  
  const { data: products = [], isLoading, error } = productsApiHooks.useGetProductsQuery(
    { companyId: targetCompanyId },
    { 
      enabled: isAdmin || !!targetCompanyId,
      retry: false
    }
  );

  const { mutate: rejectProduct } = productsApiHooks.useRejectProductMutation();

  return { 
    products, 
    isLoading, 
    error,
    companyId: targetCompanyId,
    rejectProduct
  };
}