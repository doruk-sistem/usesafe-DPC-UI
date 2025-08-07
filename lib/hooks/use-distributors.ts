import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createApiHooks } from "../create-api-hooks";
import { distributorService } from "../services/distributor";
import { DistributorFilters, DistributorAssignment } from "../types/distributor";

// Create API hooks using the service
export const distributorApiHooks = createApiHooks({
  ...distributorService,
  // Override getDistributors to handle filters properly
  getDistributors: async (filters?: DistributorFilters) => {
    return distributorService.getDistributors(filters);
  }
});

// Custom hook for distributors with filters
export const useDistributors = (filters?: DistributorFilters) => {
  const { data: distributors = [], isLoading, error } = distributorApiHooks.useGetDistributorsQuery(filters || {});
  
  return {
    distributors,
    isLoading,
    error
  };
};

// Custom hook for single distributor
export const useDistributor = (id: string) => {
  const { data: distributor, isLoading, error } = distributorApiHooks.useGetDistributorQuery({ id });
  
  return {
    distributor,
    isLoading,
    error
  };
};

// Custom hook for distributor stats
export const useDistributorStats = () => {
  const { data: stats, isLoading, error } = distributorApiHooks.useGetDistributorStatsQuery({});
  
  return {
    stats,
    isLoading,
    error
  };
};

// Custom hook for product distributors
export const useProductDistributors = (productId: string) => {
  const { data: productDistributors = [], isLoading, error } = distributorApiHooks.useGetProductDistributorsQuery({ productId });
  
  return {
    productDistributors,
    isLoading,
    error
  };
};

// Custom hook for distributor products
export const useDistributorProducts = (distributorId: string) => {
  const { data: distributorProducts = [], isLoading, error } = distributorApiHooks.useGetDistributorProductsQuery({ distributorId });
  
  return {
    distributorProducts,
    isLoading,
    error
  };
};

// Mutation hooks
export const useAssignDistributorToProduct = () => {
  const queryClient = useQueryClient();
  
  return distributorApiHooks.useAssignDistributorToProductMutation({
    onSuccess: (_, { productId, assignment }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['getProductDistributors', { productId }] });
      queryClient.invalidateQueries({ queryKey: ['getDistributorProducts', { distributorId: assignment.distributorId }] });
      queryClient.invalidateQueries({ queryKey: ['getDistributorStats'] });
      queryClient.invalidateQueries({ queryKey: ['getDistributors'] });
    }
  });
};

export const useRemoveDistributorFromProduct = () => {
  const queryClient = useQueryClient();
  
  return distributorApiHooks.useRemoveDistributorFromProductMutation({
    onSuccess: (_, { productId, distributorId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['getProductDistributors', { productId }] });
      queryClient.invalidateQueries({ queryKey: ['getDistributorProducts', { distributorId }] });
      queryClient.invalidateQueries({ queryKey: ['getDistributorStats'] });
      queryClient.invalidateQueries({ queryKey: ['getDistributors'] });
    }
  });
};

export const useUpdateDistributorStatus = () => {
  const queryClient = useQueryClient();
  
  return distributorApiHooks.useUpdateDistributorStatusMutation({
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['getDistributors'] });
      queryClient.invalidateQueries({ queryKey: ['getDistributorStats'] });
    }
  });
};

export const useDeleteDistributor = () => {
  const queryClient = useQueryClient();
  
  return distributorApiHooks.useDeleteDistributorMutation({
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['getDistributors'] });
      queryClient.invalidateQueries({ queryKey: ['getDistributorStats'] });
    }
  });
};

// Search hook
export const useSearchDistributors = (query: string) => {
  const { data: searchResults = [], isLoading, error } = distributorApiHooks.useSearchDistributorsQuery({ query });
  
  return {
    searchResults,
    isLoading,
    error
  };
};

// Export the hooks that are used in components
export const useDistributorList = (filters?: DistributorFilters) => {
  const { distributors, isLoading, error } = useDistributors(filters);
  const { stats } = useDistributorStats();
  
  return {
    distributors,
    stats,
    isLoading,
    error
  };
}; 