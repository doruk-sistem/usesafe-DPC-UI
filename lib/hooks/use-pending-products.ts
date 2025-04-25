import { useQuery } from "@tanstack/react-query";
import { ProductService } from "@/lib/services/product";
import { useAuth } from "./use-auth";

export function usePendingProducts(pageIndex: number, pageSize: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pending-products", pageIndex, pageSize, user?.email],
    queryFn: () => {
      if (!user?.email) {
        return Promise.reject(new Error("User email is not available"));
      }

      return ProductService.getPendingProducts(pageIndex, pageSize);
    },
    enabled: !!user?.email,
  });
} 