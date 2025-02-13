import { productService } from "@/lib/services/product";

import { createApiHooks } from "../create-api-hooks";

import { useAuth } from "./use-auth";

export const productsApiHooks = createApiHooks(productService);

export function useProducts() {
  const { company } = useAuth();

  const {
    data: products,
    isLoading,
    error,
  } = productsApiHooks.useGetProductsQuery(
    {
      companyId: company?.id,
    },
    {
      enabled: !!company?.id,
    }
  );

  return {
    products,
    isLoading,
    error,
  };
}
