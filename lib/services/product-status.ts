import { supabase } from '@/lib/supabase';
import type { Product, ProductStatus, StatusTransition } from '@/lib/types/product';

export class ProductStatusService {
  static isValidTransition(from: ProductStatus, to: ProductStatus): boolean {
    const allowedTransitions: Record<ProductStatus, ProductStatus[]> = {
      'DRAFT': ['NEW', 'DELETED'],
      'NEW': ['ARCHIVED', 'DELETED'],
      'DELETED': ['NEW'],
      'ARCHIVED': []
    };

    return allowedTransitions[from]?.includes(to) || false;
  }

  static async updateStatus(
    productId: string, 
    newStatus: ProductStatus, 
    userId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('status, status_history')
        .eq('id', productId)
        .single();

      if (fetchError) throw new Error('Failed to fetch product');

      if (!this.isValidTransition(product.status, newStatus)) {
        return {
          success: false,
          error: `Invalid status transition from ${product.status} to ${newStatus}`
        };
      }

      const transition: StatusTransition = {
        from: product.status,
        to: newStatus,
        timestamp: new Date().toISOString(),
        userId,
        reason
      };

      const { error: updateError } = await supabase
        .from('products')
        .update({
          status: newStatus,
          status_history: [...(product.status_history || []), transition]
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      console.error('Error updating product status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update status'
      };
    }
  }

  static async getStatusHistory(productId: string): Promise<StatusTransition[]> {
    const { data, error } = await supabase
      .from('products')
      .select('status_history')
      .eq('id', productId)
      .single();

    if (error) throw error;
    return data.status_history || [];
  }

  static validateStatus(product: Product): boolean {
    if (!product.status) return false;
    
    // Ensure product has required fields before allowing NEW status
    if (product.status === 'NEW') {
      return !!(
        product.name &&
        product.description &&
        product.images?.length > 0 &&
        product.key_features?.length > 0
      );
    }

    return true;
  }
}