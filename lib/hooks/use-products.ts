import { createApiHooks } from "../create-api-hooks";
import { productService } from "../services/product";
import { BaseProduct } from "../types/product";

import { useAuth } from "./use-auth";

export const productsApiHooks = createApiHooks(productService);

export function useProducts(companyId?: string, fetchAll: boolean = false) {
  const { company, isAdmin } = useAuth();
  const targetCompanyId = isAdmin() || fetchAll ? undefined : companyId || company?.id;

  const { data: products = [], isLoading, error } = productsApiHooks.useGetProductsQuery(
    { companyId: targetCompanyId },
    { 
      enabled: true,
      retry: false
    }
  );

  // Process products to include document counts and status from documents table
  const processedProducts: BaseProduct[] = products.map((product) => {
    // For now, set default values since documents are in separate table
    // TODO: Implement document fetching from documents table if needed
    // This would require async operations which are complex in this context
    const documentCount = 0; // Will be fetched separately if needed
    const documentStatus: BaseProduct["document_status"] = "No Documents"; // Will be calculated separately if needed

    return {
      ...product,
      document_status: documentStatus,
    };
  });

  const { mutateAsync: rejectProduct } = productsApiHooks.useRejectProductMutation();

  return { 
    products: processedProducts, 
    isLoading, 
    error,
    companyId: targetCompanyId,
    rejectProduct
  };
}