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

  return {
    product,
    isLoading,
    error,
    updateProduct,
  };
}
