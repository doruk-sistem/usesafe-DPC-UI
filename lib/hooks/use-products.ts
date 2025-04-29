import { createApiHooks } from "../create-api-hooks";
import { productService } from "../services/product";

import { useAuth } from "./use-auth";

export const productsApiHooks = createApiHooks(productService);

export function useProducts(companyId?: string) {
  const { user, company } = useAuth();
  const defaultCompanyId = user?.user_metadata?.company_id || company?.id;
  const targetCompanyId = companyId || defaultCompanyId || "admin";
  const isAdmin = user?.user_metadata?.role === "admin";
  
  console.log("useProducts - user:", user);
  console.log("useProducts - company:", company);
  console.log("useProducts - isAdmin:", isAdmin);
  console.log("useProducts - targetCompanyId:", targetCompanyId);
  
  const { data: products = [], isLoading, error } = productsApiHooks.useGetProductsQuery(
    { companyId: isAdmin ? "admin" : targetCompanyId },
    { 
      enabled: !!targetCompanyId || isAdmin,
      retry: false
    }
  );

  console.log("useProducts - products:", products);
  console.log("useProducts - isLoading:", isLoading);
  console.log("useProducts - error:", error);

  return { products, isLoading, error, companyId: targetCompanyId };
}