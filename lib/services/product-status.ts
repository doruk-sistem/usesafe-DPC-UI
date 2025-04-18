import { supabase } from "@/lib/supabase/client";
import type {
  Product,
  ProductStatus,
  StatusTransition,
} from "@/lib/types/product";

export class ProductStatusService {
  static isValidTransition(from: ProductStatus, to: ProductStatus): boolean {
    console.log("isValidTransition çağrıldı:", { from, to });
    
    const allowedTransitions: Record<string, ProductStatus[]> = {
      DRAFT: ["NEW", "DELETED"],
      NEW: ["ARCHIVED", "DELETED", "approved", "rejected"],
      DELETED: ["NEW"],
      ARCHIVED: [],
      approved: [],
      rejected: [],
      pending: ["approved", "rejected"],
      expired: [],
    };

    const result = allowedTransitions[from as string]?.includes(to) || false;
    console.log("Geçiş geçerli mi:", result);
    
    return result;
  }

  static async updateStatus(
    productId: string,
    newStatus: ProductStatus,
    userId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("updateStatus çağrıldı:", {
        productId,
        newStatus,
        userId,
        reason
      });

      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("status, status_history")
        .eq("id", productId)
        .single();

      if (fetchError) {
        console.error("Ürün getirme hatası:", fetchError);
        throw new Error("Failed to fetch product");
      }

      console.log("Mevcut ürün durumu:", {
        productId,
        currentStatus: product.status,
        targetStatus: newStatus
      });

      if (!this.isValidTransition(product.status, newStatus)) {
        console.error("Geçersiz durum geçişi:", {
          from: product.status,
          to: newStatus,
          allowedTransitions: this.getAllowedTransitions(product.status)
        });
        return {
          success: false,
          error: `Invalid status transition from ${product.status} to ${newStatus}`,
        };
      }

      const transition: StatusTransition = {
        from: product.status,
        to: newStatus,
        timestamp: new Date().toISOString(),
        userId,
        reason,
      };

      console.log("Durum geçişi oluşturuldu:", transition);

      const { error: updateError } = await supabase
        .from("products")
        .update({
          status: newStatus,
          status_history: [...(product.status_history || []), transition],
        })
        .eq("id", productId);

      if (updateError) {
        console.error("Ürün güncelleme hatası:", updateError);
        throw updateError;
      }

      console.log("Ürün durumu başarıyla güncellendi:", {
        productId,
        newStatus
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating product status:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update status",
      };
    }
  }

  static getAllowedTransitions(from: ProductStatus): ProductStatus[] {
    const allowedTransitions: Record<string, ProductStatus[]> = {
      DRAFT: ["NEW", "DELETED"],
      NEW: ["ARCHIVED", "DELETED", "approved", "rejected"],
      DELETED: ["NEW"],
      ARCHIVED: [],
      approved: [],
      rejected: [],
      pending: ["approved", "rejected"],
      expired: [],
    };
    
    return allowedTransitions[from as string] || [];
  }

  static async getStatusHistory(
    productId: string
  ): Promise<StatusTransition[]> {
    const { data, error } = await supabase
      .from("products")
      .select("status_history")
      .eq("id", productId)
      .single();

    if (error) throw error;
    return data.status_history || [];
  }

  static validateStatus(product: Product): boolean {
    if (!product.status) return false;

    // Ensure product has required fields before allowing NEW status
    if (product.status === "NEW") {
      return !!(
        product.name &&
        product.description &&
        product.images &&
        product.images.length > 0 &&
        product.key_features &&
        product.key_features.length > 0
      );
    }

    return true;
  }
}
