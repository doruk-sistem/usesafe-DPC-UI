import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/ui/use-toast";
import { productService } from "@/lib/services/product";

import { useAuth } from "./use-auth";

export function usePendingProducts(pageIndex: number, pageSize: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["pending-products", pageIndex, pageSize, user?.email],
    queryFn: () => {
      if (!user?.email) {
        return Promise.reject(new Error("User email is not available"));
      }

      return productService.getPendingProducts({ pageIndex, pageSize });
    },
    enabled: !!user?.email,
  });

  const approveMutation = useMutation({
    mutationFn: async (productId: string) => {
      return productService.approveProduct({ productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-products"] });
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla onaylandı ve taslak olarak kopyalandı.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Ürün onaylanırken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ productId, reason }: { productId: string; reason: string }) => {
      return productService.rejectProduct({ productId, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-products"] });
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla reddedildi",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Ürün reddedilirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  return {
    data,
    isLoading,
    error,
    approveProduct: approveMutation.mutate,
    rejectProduct: rejectMutation.mutate,
  };
} 