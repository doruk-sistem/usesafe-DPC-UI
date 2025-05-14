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

  // Process products to include document counts and status
  const processedProducts: BaseProduct[] = products.map((product) => {
    const documentCount = product.documents
      ? Object.values(product.documents).flat().length
      : 0;

    let documentStatus: BaseProduct["document_status"] = "No Documents";
    if (documentCount > 0) {
      const allDocs = Object.values(product.documents).flat() as {
        status: "approved" | "rejected" | "pending";
      }[];
      const hasRejected = allDocs.some((doc) => doc.status === "rejected");
      const allApproved = allDocs.every((doc) => doc.status === "approved");

      if (hasRejected) {
        documentStatus = "Has Rejected Documents";
      } else if (allApproved) {
        documentStatus = "All Approved";
      } else {
        documentStatus = "Pending Review";
      }
    }

    return {
      ...product,
      document_status: documentStatus,
    };
  });

  return { 
    products: processedProducts, 
    isLoading, 
    error,
    companyId: targetCompanyId 
  };
}