import { useQuery, useQueryClient } from "@tanstack/react-query";

import { productService } from "@/lib/services/product";
import { Document } from "@/lib/types/document";
import { BaseProduct, ProductStatus } from "@/lib/types/product";

import { useAuth } from "./use-auth";
import { productsApiHooks } from "./use-products";

export function useProduct(id: string) {
  const { user, company } = useAuth();
  const isAdmin = user?.user_metadata?.role === "admin";
  const queryClient = useQueryClient();

  const {
    data: product,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => {
      return productService.getProduct({
        id,
        companyId: isAdmin ? "admin" : company?.id || "",
      });
    },
    enabled: !!id && (!!company?.id || isAdmin),
  });

  // Process documents from documents table
  const processDocuments = (productData: any) => {
    let documentCount = 0;
    const allDocuments: Document[] = [];

    // For now, return empty documents since they're in separate table
    // TODO: Implement proper document fetching from documents table
    // This would require a separate query or restructuring the hook

    return {
      documentCount,
      allDocuments
    };
  };

  const determineProductStatus = (
    product: BaseProduct | null
  ): ProductStatus => {
    if (!product) return null;

    // Önce ürünün kendi statüsünü kontrol et (sadece özel durumlar için)
    if (product.status === "DELETED") return "DELETED";

    // Belge durumuna göre ürün durumunu belirle
    if (product.document_status === "All Approved") return "APPROVED";
    if (product.document_status === "Has Rejected Documents") return "REJECTED";
    if (product.document_status === "Pending Review") return "PENDING";
    if (product.document_status === "No Documents") return "PENDING";

    // Documents are now in separate table, so we can't check them here
    // TODO: Implement document status checking from documents table

    // Varsayılan durum - ürünün kendi statüsünü kullan
    if (product.status === "ARCHIVED") return "PENDING";
    return product.status as ProductStatus || "PENDING";
  };

  const { mutate: _updateProduct } =
    productsApiHooks.useUpdateProductMutation();

  const updateProduct = async (updates: Partial<BaseProduct>) => {
    if (!product) return;

    // Remove documents from updates since they're now in separate table
    const { documents, ...updatesWithoutDocs } = updates;

    const updateData = {
      ...updatesWithoutDocs,
      company_id: company?.id,
      images: updates.images?.map((img) => ({
        url: img.url,
        alt: img.alt,
        is_primary: img.is_primary,
      })),
      key_features: updates.key_features?.map((feature) => ({
        name: feature.name,
        value: feature.value,
        unit: feature.unit,
      })),
    };

    _updateProduct({
      id: product.data?.id || '',
      product: updateData as any,
    });

    // Invalidate the query after updating
    queryClient.invalidateQueries({ queryKey: ["product", id] });
  };

  const productData = product?.data || null;
  const { documentCount, allDocuments } = processDocuments(productData);

  return {
    product: productData,
    error: error || product?.error,
    isLoading,
    determineProductStatus,
    updateProduct,
    documentCount,
    allDocuments
  };
}