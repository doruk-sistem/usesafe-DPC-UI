import type { BaseProduct, ProductImage, KeyFeature } from "@/lib/types/product";

import { useAuth } from "./use-auth";
import { productsApiHooks } from "./use-products";

export function useProduct(productId: string) {
  const { user } = useAuth();
  const companyId = user?.user_metadata?.company_id;

  if (!companyId) {
    throw new Error('Company ID is required to fetch product');
  }

  const {
    data: product,
    isLoading,
    error,
  } = productsApiHooks.useGetProductQuery(
    {
      companyId,
      id: productId,
    },
    {
      enabled: !!companyId && !!productId,
    }
  );

  const { mutate: _updateProduct } = productsApiHooks.useUpdateProductMutation();

  const updateProduct = async (updates: Partial<BaseProduct>) => {
    if (!product?.data) return;

    const updateData = {
      ...updates,
      company_id: companyId,
      images: (updates.images as ProductImage[])?.map((img) => ({
        url: img.url,
        alt: img.alt,
        is_primary: img.is_primary,
      })),
      key_features: (updates.key_features as KeyFeature[])?.map((feature) => ({
        name: feature.name,
        value: feature.value,
        unit: feature.unit,
      })),
    };

    _updateProduct({
      id: product.data.id,
      product: updateData,
    });
  };

  return {
    product,
    isLoading,
    error,
    updateProduct,
  };
}
