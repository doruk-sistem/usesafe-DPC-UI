import { 
  Distributor, 
  ProductDistributor, 
  DistributorStats, 
  DistributorFilters,
  DistributorAssignment 
} from "@/lib/types/distributor";
import { 
  mockDistributors, 
  mockProductDistributors, 
  mockDistributorStats,
  getDistributorById,
  getDistributorsByStatus,
  getProductDistributors,
  getDistributorProducts,
  searchDistributors
} from "@/lib/data/mock-distributors";

import { createService } from "../api-client";

// Static class for distributor operations
export class DistributorService {
  // Get all distributors
  static async getDistributors(filters?: DistributorFilters): Promise<Distributor[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredDistributors = [...mockDistributors];

    // Apply filters
    if (filters?.search) {
      filteredDistributors = searchDistributors(filters.search);
    }

    // Apply sorting
    if (filters?.sortBy) {
      filteredDistributors.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filters.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'assignedProducts':
            aValue = a.assignedProducts || 0;
            bValue = b.assignedProducts || 0;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt || '').getTime();
            bValue = new Date(b.createdAt || '').getTime();
            break;
          default:
            aValue = a.name;
            bValue = b.name;
        }

        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    return filteredDistributors;
  }

  // Get distributor by ID
  static async getDistributor(id: string): Promise<Distributor | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return getDistributorById(id) || null;
  }

  // Get distributor stats
  static async getDistributorStats(): Promise<DistributorStats> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return mockDistributorStats;
  }

  // Get product distributors
  static async getProductDistributors(productId: string): Promise<ProductDistributor[]> {
    await new Promise(resolve => setTimeout(resolve, 250));
    return getProductDistributors(productId);
  }

  // Get distributor products
  static async getDistributorProducts(distributorId: string): Promise<ProductDistributor[]> {
    await new Promise(resolve => setTimeout(resolve, 250));
    return getDistributorProducts(distributorId);
  }

  // Assign distributor to product
  static async assignDistributorToProduct(
    productId: string,
    assignment: DistributorAssignment,
    assignedBy: string
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate assignment - in real implementation this would save to database
    console.log('Assigning distributor to product:', {
      productId,
      assignment,
      assignedBy
    });

    // For mock data, we would add to the mockProductDistributors array
    // In real implementation, this would be a database insert
  }

  // Remove distributor from product
  static async removeDistributorFromProduct(
    productId: string,
    distributorId: string
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log('Removing distributor from product:', {
      productId,
      distributorId
    });

    // In real implementation, this would be a database delete
  }

  // Update distributor status
  static async updateDistributorStatus(
    distributorId: string,
    status: 'active' | 'inactive' | 'pending'
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Updating distributor status:', {
      distributorId,
      status
    });

    // In real implementation, this would be a database update
  }

  // Search distributors
  static async searchDistributors(query: string): Promise<Distributor[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return searchDistributors(query);
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