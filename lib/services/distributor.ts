import { 
  Distributor, 
  ProductDistributor, 
  DistributorStats, 
  DistributorFilters,
  DistributorAssignment 
} from "@/lib/types/distributor";
import { supabase } from "@/lib/supabase/client";

import { createService } from "../api-client";

// Static class for distributor operations
export class DistributorService {
  // Get all distributors
  static async getDistributors(filters?: DistributorFilters): Promise<Distributor[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        let query = supabase
          .from("distributors")
          .select("*");

        // Apply search filter
        if (filters?.search) {
          query = query.or(`name.ilike.%${filters.search}%,tax_info->>'taxNumber'.ilike.%${filters.search}%`);
        }

        // Apply sorting
        if (filters?.sortBy) {
          const sortColumn = filters.sortBy === 'assignedProducts' ? 'assigned_products_count' : filters.sortBy;
          query = query.order(sortColumn, { ascending: filters.sortOrder === 'asc' });
        } else {
          query = query.order('name', { ascending: true });
        }

        const { data: distributors, error } = await query;

        if (!error && distributors) {
          // Transform database format to our interface format
          return distributors.map(dbDistributor => ({
            id: dbDistributor.id,
            name: dbDistributor.name,
            companyType: dbDistributor.company_type,
            taxInfo: dbDistributor.tax_info,
            email: dbDistributor.email,
            phone: dbDistributor.phone,
            website: dbDistributor.website,
            address: dbDistributor.address,
            assignedProducts: dbDistributor.assigned_products_count,
            createdAt: dbDistributor.created_at,
            updatedAt: dbDistributor.updated_at,
          }));
        }
      }
    } catch (error) {
      console.warn("Failed to fetch from real API:", error);
    }

    // Return empty array if no data
    return [];
  }

  // Get distributor by ID
  static async getDistributor(id: string): Promise<Distributor | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: distributor, error } = await supabase
          .from("distributors")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && distributor) {
          return {
            id: distributor.id,
            name: distributor.name,
            companyType: distributor.company_type,
            taxInfo: distributor.tax_info,
            email: distributor.email,
            phone: distributor.phone,
            website: distributor.website,
            address: distributor.address,
            assignedProducts: distributor.assigned_products_count,
            createdAt: distributor.created_at,
            updatedAt: distributor.updated_at,
          };
        }
      }
    } catch (error) {
      console.warn("Failed to fetch distributor by ID:", error);
    }

    return null;
  }

  // Get distributor stats
  static async getDistributorStats(): Promise<DistributorStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: distributors, error } = await supabase
          .from("distributors")
          .select("assigned_products_count");

        if (!error && distributors) {
          const total = distributors.length;
          const withProducts = distributors.filter(d => d.assigned_products_count > 0).length;
          const withoutProducts = total - withProducts;
          const totalProducts = distributors.reduce((sum, d) => sum + (d.assigned_products_count || 0), 0);

          return {
            total,
            withProducts,
            withoutProducts,
            totalProducts,
          };
        }
      }
    } catch (error) {
      console.warn("Failed to fetch stats from real API:", error);
    }

    // Return default stats
    return {
      total: 0,
      withProducts: 0,
      withoutProducts: 0,
      totalProducts: 0,
    };
  }

  // Get product distributors
  static async getProductDistributors(productId: string): Promise<ProductDistributor[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: productDistributors, error } = await supabase
          .from("product_distributors")
          .select(`
            *,
            distributor:distributor_id (
              id,
              name,
              company_type,
              tax_info,
              email,
              phone,
              website,
              address,
              assigned_products_count
            )
          `)
          .eq("product_id", productId);

        if (!error && productDistributors) {
          return productDistributors.map(pd => ({
            id: pd.id,
            productId: pd.product_id,
            distributorId: pd.distributor_id,
            assignedBy: pd.assigned_by,
            assignedAt: pd.assigned_at,
            status: pd.status as 'active' | 'inactive' | 'pending',
            territory: pd.territory,
            commissionRate: pd.commission_rate,
            notes: pd.notes,
            distributor: pd.distributor ? {
              id: pd.distributor.id,
              name: pd.distributor.name,
              companyType: pd.distributor.company_type,
              taxInfo: pd.distributor.tax_info,
              email: pd.distributor.email,
              phone: pd.distributor.phone,
              website: pd.distributor.website,
              address: pd.distributor.address,
              assignedProducts: pd.distributor.assigned_products_count,
            } : undefined,
          }));
        }
      }
    } catch (error) {
      console.warn("Failed to fetch product distributors from real API:", error);
    }

    return [];
  }

  // Get distributor products
  static async getDistributorProducts(distributorId: string): Promise<ProductDistributor[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: productDistributors, error } = await supabase
          .from("product_distributors")
          .select(`
            *,
            product:product_id (
              id,
              name,
              model,
              product_type
            )
          `)
          .eq("distributor_id", distributorId);

        if (!error && productDistributors) {
          return productDistributors.map(pd => ({
            id: pd.id,
            productId: pd.product_id,
            distributorId: pd.distributor_id,
            assignedBy: pd.assigned_by,
            assignedAt: pd.assigned_at,
            status: pd.status as 'active' | 'inactive' | 'pending',
            territory: pd.territory,
            commissionRate: pd.commission_rate,
            notes: pd.notes,
            product: pd.product ? {
              id: pd.product.id,
              name: pd.product.name,
              model: pd.product.model || '',
              productType: pd.product.product_type || '',
            } : undefined,
          }));
        }
      }
    } catch (error) {
      console.warn("Failed to fetch distributor products from real API:", error);
    }

    return [];
  }

  // Assign distributor to product
  static async assignDistributorToProduct(
    productId: string,
    assignment: DistributorAssignment,
    assignedBy: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from("product_distributors")
          .insert([{
            product_id: productId,
            distributor_id: assignment.distributorId,
            assigned_by: assignedBy,
            status: 'active',
            territory: assignment.territory,
            commission_rate: assignment.commissionRate,
            notes: assignment.notes,
          }]);

        if (!error) {
          console.log('Successfully assigned distributor to product in database');
          return;
        }
      }
    } catch (error) {
      console.warn("Failed to assign distributor in database:", error);
      throw error;
    }
  }

  // Remove distributor from product
  static async removeDistributorFromProduct(
    productId: string,
    distributorId: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from("product_distributors")
          .delete()
          .eq("product_id", productId)
          .eq("distributor_id", distributorId);

        if (!error) {
          console.log('Successfully removed distributor from product');
          return;
        }
      }
    } catch (error) {
      console.warn("Failed to remove distributor from product:", error);
      throw error;
    }
  }

  // Update distributor status
  static async updateDistributorStatus(
    distributorId: string,
    status: 'active' | 'inactive' | 'pending'
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from("distributors")
          .update({ status })
          .eq("id", distributorId);

        if (!error) {
          console.log('Successfully updated distributor status');
          return;
        }
      }
    } catch (error) {
      console.warn("Failed to update distributor status:", error);
      throw error;
    }
  }

  // Search distributors
  static async searchDistributors(query: string): Promise<Distributor[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: distributors, error } = await supabase
          .from("distributors")
          .select("*")
          .or(`name.ilike.%${query}%,tax_info->>'taxNumber'.ilike.%${query}%`);

        if (!error && distributors) {
          return distributors.map(dbDistributor => ({
            id: dbDistributor.id,
            name: dbDistributor.name,
            companyType: dbDistributor.company_type,
            taxInfo: dbDistributor.tax_info,
            email: dbDistributor.email,
            phone: dbDistributor.phone,
            website: dbDistributor.website,
            address: dbDistributor.address,
            assignedProducts: dbDistributor.assigned_products_count,
            createdAt: dbDistributor.created_at,
            updatedAt: dbDistributor.updated_at,
          }));
        }
      }
    } catch (error) {
      console.warn("Failed to search distributors:", error);
    }

    return [];
  }
}

// API client service object
export const distributorService = createService({
  // Get all distributors
  getDistributors: async (filters?: DistributorFilters): Promise<Distributor[]> => {
    return DistributorService.getDistributors(filters);
  },

  // Get distributor by ID
  getDistributor: async ({ id }: { id: string }): Promise<Distributor | null> => {
    return DistributorService.getDistributor(id);
  },

  // Get distributor stats
  getDistributorStats: async ({}: {}): Promise<DistributorStats> => {
    return DistributorService.getDistributorStats();
  },

  // Get product distributors
  getProductDistributors: async ({ productId }: { productId: string }): Promise<ProductDistributor[]> => {
    return DistributorService.getProductDistributors(productId);
  },

  // Get distributor products
  getDistributorProducts: async ({ distributorId }: { distributorId: string }): Promise<ProductDistributor[]> => {
    return DistributorService.getDistributorProducts(distributorId);
  },

  // Assign distributor to product
  assignDistributorToProduct: async ({ 
    productId, 
    assignment, 
    assignedBy 
  }: { 
    productId: string; 
    assignment: DistributorAssignment; 
    assignedBy: string; 
  }): Promise<void> => {
    return DistributorService.assignDistributorToProduct(productId, assignment, assignedBy);
  },

  // Remove distributor from product
  removeDistributorFromProduct: async ({ 
    productId, 
    distributorId 
  }: { 
    productId: string; 
    distributorId: string; 
  }): Promise<void> => {
    return DistributorService.removeDistributorFromProduct(productId, distributorId);
  },

  // Update distributor status
  updateDistributorStatus: async ({ 
    distributorId, 
    status 
  }: { 
    distributorId: string; 
    status: 'active' | 'inactive' | 'pending'; 
  }): Promise<void> => {
    return DistributorService.updateDistributorStatus(distributorId, status);
  },

  // Search distributors
  searchDistributors: async ({ query }: { query: string }): Promise<Distributor[]> => {
    return DistributorService.searchDistributors(query);
  }
}); 