import { productService } from "@/lib/services/product";
import { createApiHooks } from "../create-api-hooks";

export const productsApiHooks = createApiHooks(productService);

export function useProducts(companyId: string) {
  const {
    data: products = [],
    isLoading,
    error,
  } = productsApiHooks.useGetProductsQuery(
    {
      companyId: companyId, // Parametre olarak gelen companyId'yi kullanıyoruz
    },
    {
      enabled: !!companyId, // companyId varsa sorguyu etkinleştiriyoruz
    }
  );

  return {
    products,
    isLoading,
    error,
  };
}