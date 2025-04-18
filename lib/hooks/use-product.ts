import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { productService } from "@/lib/services/product";

export function useProduct(id: string) {
  const { company, isAdminValue } = useAuth();

  console.log("useProduct", { id, companyId: company?.id, isAdmin: isAdminValue });

  return useQuery({
    queryKey: ["product", id],
    queryFn: () =>
      productService.getProduct({
        id,
        companyId: isAdminValue ? "" : company?.id || "",
      }),
    enabled: !!id && (!!company?.id || isAdminValue),
  });
}
