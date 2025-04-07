import type { Product } from "@/lib/types/product";

import { useAuth } from "./use-auth";
import { productsApiHooks } from "./use-products";

export function useProduct(productId: string) {
  const { company } = useAuth();

  const {
    data: product,
    isLoading,
    error,
  } = productsApiHooks.useGetProductQuery(
    {
      companyId: company?.id,
      id: productId,
    },
    {
      enabled: !!company?.id && !!productId,
    }
  );
  const { mutate: _updateProduct } =
    productsApiHooks.useUpdateProductMutation();

  const updateProduct = async (updates: Partial<Product>) => {
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
      id: product.data?.id,
      product: updateData as any,
    });
  };

  const determineProductStatus = (documents: any[]): string => {
    if (!documents || documents.length === 0) {
      return "PENDING";
    }

    const hasRejected = documents.some(doc => doc.status === "rejected");
    if (hasRejected) {
      return "REJECTED";
    }

    const allApproved = documents.every(doc => doc.status === "approved");
    if (allApproved) {
      return "APPROVED";
    }

    return "PENDING";
  };

  return {
    product,
    isLoading,
    error,
    updateProduct,
    determineProductStatus,
  };
}
