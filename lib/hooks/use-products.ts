import { createApiHooks } from "../create-api-hooks";
import { productService } from "../services/product";
import { BaseProduct } from "../types/product";

import { useAuth } from "./use-auth";
import { documentsApiHooks } from "./use-documents";


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

  // Get documents to calculate document counts and status for products
  const { data: allDocuments = [], isLoading: isLoadingDocuments } = documentsApiHooks.useGetDocuments(targetCompanyId);

  // Process products to include document counts and status from documents table
  const processedProducts: BaseProduct[] = products.map((product) => {
    // Filter documents for this product
    const productDocuments = allDocuments.filter(doc => doc.productId === product.id);
    
    // Calculate document count
    const documentCount = productDocuments.length;
    
    // Calculate document status based on document statuses
    let documentStatus: BaseProduct["document_status"] = "No Documents";
    
    if (documentCount > 0) {
      const approvedDocs = productDocuments.filter(doc => doc.status === 'approved').length;
      const rejectedDocs = productDocuments.filter(doc => doc.status === 'rejected').length;
      const pendingDocs = productDocuments.filter(doc => doc.status === 'pending').length;
      
      if (rejectedDocs > 0) {
        documentStatus = "Has Rejected Documents";
      } else if (pendingDocs > 0) {
        documentStatus = "Pending Review";
      } else if (approvedDocs === documentCount) {
        documentStatus = "All Approved";
      } else {
        documentStatus = "Pending Review";
      }
    }

    return {
      ...product,
      documents: productDocuments, // Add documents array for the product
      document_status: documentStatus,
    };
  });

  const { mutateAsync: rejectProduct } = productsApiHooks.useRejectProductMutation();

  return { 
    products: processedProducts, 
    isLoading: isLoading || isLoadingDocuments, 
    error,
    companyId: targetCompanyId,
    rejectProduct
  };
}