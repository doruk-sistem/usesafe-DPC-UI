import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MaterialManufacturerService, MaterialWithManufacturer } from "@/lib/services/material-manufacturer";

/**
 * Bir ürünün materyallerini üreticileri ile birlikte getir
 */
export function useProductMaterialsWithManufacturers(productId: string) {
  return useQuery({
    queryKey: ["product-materials-with-manufacturers", productId],
    queryFn: () => MaterialManufacturerService.getProductMaterialsWithManufacturers(productId),
    enabled: !!productId,
  });
}

/**
 * Mevcut üreticileri getir
 */
export function useAvailableManufacturers() {
  return useQuery({
    queryKey: ["available-manufacturers"],
    queryFn: () => MaterialManufacturerService.getAvailableManufacturers(),
  });
}

/**
 * Materyal üreticisi ata
 */
export function useAssignMaterialManufacturer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      materialId: string;
      manufacturerId: string;
      assignedBy: string;
      productId: string; // Cache invalidation için
    }) => MaterialManufacturerService.assignManufacturer({
      materialId: data.materialId,
      manufacturerId: data.manufacturerId,
      assignedBy: data.assignedBy,
    }),
    onSuccess: (_, variables) => {
      // Cache'i güncelle
      queryClient.invalidateQueries({
        queryKey: ["manufactured-products"],
      });
      
      toast.success("Materyal üreticisi başarıyla atandı");
    },
    onError: (error) => {
      console.error("Error assigning material manufacturer:", error);
      toast.error("Materyal üreticisi atanırken bir hata oluştu");
    },
  });
}

/**
 * Materyal üreticisi atamasını kaldır
 */
export function useRemoveMaterialManufacturer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { materialId: string; productId: string }) =>
      MaterialManufacturerService.removeAssignment(data.materialId),
    onSuccess: (_, variables) => {
      // Cache'i güncelle
      queryClient.invalidateQueries({
        queryKey: ["manufactured-products"],
      });
      
      toast.success("Materyal üreticisi ataması kaldırıldı");
    },
    onError: (error) => {
      console.error("Error removing material manufacturer:", error);
      toast.error("Materyal üreticisi kaldırılırken bir hata oluştu");
    },
  });
}

/**
 * Bir şirketin üretici olarak atandığı materyalleri getir
 */
export function useManufacturerMaterials(manufacturerId: string) {
  return useQuery({
    queryKey: ["manufacturer-materials", manufacturerId],
    queryFn: () => MaterialManufacturerService.getManufacturerMaterials(manufacturerId),
    enabled: !!manufacturerId,
  });
}

/**
 * Bir şirketin atadığı materyal üreticilerini getir
 */
export function useAssignedMaterials(assignedBy: string) {
  return useQuery({
    queryKey: ["assigned-materials", assignedBy],
    queryFn: () => MaterialManufacturerService.getAssignedMaterials(assignedBy),
    enabled: !!assignedBy,
  });
} 