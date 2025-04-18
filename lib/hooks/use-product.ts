import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { productService } from "@/lib/services/product";
import { Product } from "@/lib/types/product";

export function useProduct(id: string) {
  const { company, isAdminValue } = useAuth();

  console.log("useProduct", { id, companyId: company?.id, isAdmin: isAdminValue });

  const determineProductStatus = (product: Product) => {
    if (!product) return "unknown";
    
    if (product.status === "active") return "active";
    if (product.status === "inactive") return "inactive";
    if (product.status === "pending") return "pending";
    
    return "unknown";
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
