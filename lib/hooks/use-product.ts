import { useQuery, useQueryClient } from "@tanstack/react-query";

import { productService } from "@/lib/services/product";
import { Document } from "@/lib/types/document";
import { BaseProduct, ProductStatus } from "@/lib/types/product";
import { supabase } from "@/lib/supabase/client";

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

  // Fetch documents for this product
  const {
    data: documents = [],
    isLoading: isLoadingDocuments,
    error: documentsError,
  } = useQuery({
    queryKey: ["product-documents", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data: documents, error } = await supabase
        .from("documents")
        .select("*")
        .contains("documentInfo", { productId: id });

      if (error) {
        console.error("Error fetching documents:", error);
        return [];
      }

      // Map documents to the expected format
      return (documents || []).map((doc: any) => ({
        id: doc.id,
        name: doc.documentInfo?.name || "Unnamed Document",
        type: doc.documentInfo?.type || "unknown",
        category: doc.documentInfo?.type || "unknown",
        url: doc.documentInfo?.url || "",
        status: (doc.status || "pending").toLowerCase(),
        productId: doc.documentInfo?.productId || "",
        manufacturer: doc.documentInfo?.manufacturer || "",
        manufacturerId: doc.companyId || "",
        fileSize: doc.documentInfo?.fileSize || "",
        version: doc.documentInfo?.version || "1.0",
        validUntil: doc.documentInfo?.validUntil || null,
        rejection_reason: doc.documentInfo?.rejection_reason || null,
        created_at: doc.createdAt || new Date().toISOString(),
        updated_at: doc.updatedAt || new Date().toISOString(),
        uploadedAt: doc.createdAt || new Date().toISOString(),
        size: doc.documentInfo?.size || 0,
        notes: doc.documentInfo?.notes || "",
        originalType: doc.documentInfo?.originalType || ""
      } as Document));
    },
    enabled: !!id && (!!company?.id || isAdmin),
  });

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
  const documentCount = documents.length;
  const allDocuments = documents;

  return {
    product: productData,
    error: error || product?.error || documentsError,
    isLoading: isLoading || isLoadingDocuments,
    determineProductStatus,
    updateProduct,
    documentCount,
    allDocuments
  };
}