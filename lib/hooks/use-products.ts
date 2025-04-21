import { useAuth } from "./use-auth";
import { createApiHooks } from "../create-api-hooks";
import { productService } from "../services/product";

export const productsApiHooks = createApiHooks(productService);

export function useProducts(companyId?: string) {
  const { user } = useAuth();
  const defaultCompanyId = user?.user_metadata?.company_id;
  const targetCompanyId = companyId || defaultCompanyId;
  
  if (!targetCompanyId) {
    throw new Error('Company ID is required to fetch products');
  }

  const { data: products = [], isLoading, error } = productsApiHooks.useGetProductsQuery(
    { companyId: targetCompanyId },
    { enabled: !!targetCompanyId }
  );

  return { products, isLoading, error };
}