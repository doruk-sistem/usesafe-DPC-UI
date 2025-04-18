import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { productService } from "@/lib/services/product";
import { Product, ProductStatus } from "@/lib/types/product";

export function useProduct(id: string) {
  const { company, isAdminValue } = useAuth();

  console.log("useProduct", { id, companyId: company?.id, isAdmin: isAdminValue });

  const determineProductStatus = (product: Product): ProductStatus => {
    if (!product) return null;
    
    // Belge durumuna göre ürün durumunu belirle
    if (product.document_status === "All Approved") return "approved";
    if (product.document_status === "Has Rejected Documents") return "rejected";
    if (product.document_status === "Pending Review") return "pending";
    if (product.document_status === "No Documents") return "pending";
    
    // Belge durumu yoksa, belgeleri kontrol et
    if (product.documents) {
      // Belgeleri düzleştir
      const flattenedDocs = Array.isArray(product.documents)
        ? product.documents
        : Object.values(product.documents).flat();
      
      if (flattenedDocs.length > 0) {
        // Belgelerde reddedilmiş olan var mı kontrol et
        const hasRejectedDocuments = flattenedDocs.some(
          (doc: any) => doc.status === "rejected"
        );
        
        if (hasRejectedDocuments) return "rejected";
        
        // Tüm belgeler onaylanmış mı kontrol et
        const allApproved = flattenedDocs.every(
          (doc: any) => doc.status === "approved"
        );
        
        if (allApproved) return "approved";
        
        // Diğer durumlar için pending
        return "pending";
      }
    }
    
    // Varsayılan durum
    return "pending";
  };

  return {
    ...useQuery({
      queryKey: ["product", id],
      queryFn: () =>
        productService.getProduct({
          id,
          companyId: isAdminValue ? "" : company?.id || "",
        }),
      enabled: !!id && (!!company?.id || isAdminValue),
    }),
    determineProductStatus,
  };
}
