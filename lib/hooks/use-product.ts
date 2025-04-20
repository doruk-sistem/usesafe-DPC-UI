import { useQuery } from "@tanstack/react-query";

import { productService } from "@/lib/services/product";
import { BaseProduct, ProductStatus } from "@/lib/types/product";

import { useAuth } from "./use-auth";
import { productsApiHooks } from "./use-products";

export function useProduct(id: string) {
  const { user, company } = useAuth();
  const isAdminValue = user?.user_metadata?.role === "admin";

  const {
    data: product,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () =>
      productService.getProduct({
        id,
        companyId: isAdminValue ? "" : company?.id || "",
      }),
    enabled: !!id && (!!company?.id || isAdminValue),
  });

  const determineProductStatus = (
    product: BaseProduct | null
  ): ProductStatus => {
    if (!product) return null;

    // Belge durumuna göre ürün durumunu belirle
    if (product.document_status === "All Approved") return "APPROVED";
    if (product.document_status === "Has Rejected Documents") return "REJECTED";
    if (product.document_status === "Pending Review") return "PENDING";
    if (product.document_status === "No Documents") return "PENDING";

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

        if (hasRejectedDocuments) return "REJECTED";

        // Tüm belgeler onaylanmış mı kontrol et
        const allApproved = flattenedDocs.every(
          (doc: any) => doc.status === "approved"
        );

        if (allApproved) return "APPROVED";

        // Diğer durumlar için pending
        return "PENDING";
      }
    }

    // Varsayılan durum
    return "PENDING";
  };

  const { mutate: _updateProduct } =
    productsApiHooks.useUpdateProductMutation();

  const updateProduct = async (updates: Partial<BaseProduct>) => {
    if (!product) return;

    const updateData = {
      ...updates,
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
  };

  return {
    product: product?.data || null,
    error: error || product?.error,
    isLoading,
    determineProductStatus,
    updateProduct,
  };
}
