import type { BaseProduct } from "@/lib/types/product";

import { ADMIN_COMPANY_ID } from "../services/company";

import { useAuth } from "./use-auth";
import { productsApiHooks } from "./use-products";

export function useProduct(productId: string) {
  const { company, user } = useAuth();
  const {
    data: productResponse,
    isLoading,
    error,
  } = productsApiHooks.useGetProductQuery(
    {
      companyId: company?.id || (user?.user_metadata?.role === "admin" ? ADMIN_COMPANY_ID : "") as string, 
      id: productId,
    },
    {
      enabled: !!productId && (!!company?.id || user?.user_metadata?.role === "admin"),
      retry: 1, // Limit retries to avoid excessive API calls
      retryDelay: 1000, // Wait 1 second between retries
    }
  );
  
  // Extract the product data from the response
  const product = productResponse?.data ? { data: productResponse.data } : null;
  
  // Create a more detailed error object
  const detailedError = error 
    ? { message: error.message || "An error occurred while fetching the product" } 
    : productResponse?.error 
      ? { message: productResponse.error.message || "Product not found" } 
      : null;
  
  const { mutate: _updateProduct } =
    productsApiHooks.useUpdateProductMutation();

  const updateProduct = async (updates: Partial<BaseProduct>) => {
    if (!product?.data) return;

    const updateData = {
      ...updates,
      company_id: company?.id,
      images: updates.images?.map((img) => ({
        url: img.url,
        alt: img.alt,
        is_primary: img.is_primary,
      })),
      key_features: updates.key_features?.map((feature) => ({
        name: feature.name,
        value: feature.value,
        unit: feature.unit,
      })),
    };

    _updateProduct({
      id: product.data.id || "",
      product: updateData as any,
    });
  };

  const determineProductStatus = (documents: any[]): string => {
    if (!documents || documents.length === 0) {
      return "PENDING";
    }

    const hasRejected = documents.some(doc => doc.status === "rejected");
    if (hasRejected) {
      return "REJECTED";
    }

    const allApproved = documents.every(doc => doc.status === "approved");
    if (allApproved) {
      return "APPROVED";
    }

    return "PENDING";
  };

  return {
    product,
    isLoading,
    error: detailedError,
    updateProduct,
    determineProductStatus,
  };
}
