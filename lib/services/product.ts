import { supabase } from "@/lib/supabase/client";
import type {
  NewProduct,
  Product,
  ProductResponse,
  UpdateProduct,
} from "@/lib/types/product";
import { validateAndMapDocuments } from "@/lib/utils/document-mapper";

import { createService } from "../api-client";

import { ADMIN_COMPANY_ID } from "./company";

export class ProductService {
  static async getProducts(companyId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }

    return data || [];
  }

  static async getProduct(
    id: string,
    companyId: string
  ): Promise<ProductResponse> {
    // Admin şirketi için özel durum - tüm ürünleri göster
    if (companyId === ADMIN_COMPANY_ID) {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          manufacturer:manufacturer_id (
            id,
            name,
            taxInfo,
            companyType,
            status
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        return { error: { message: "Product not found" } };
      }

      return { data };
    }

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        manufacturer:manufacturer_id (
          id,
          name,
          taxInfo,
          companyType,
          status
        )
      `
      )
      .eq("id", id)
      .eq("company_id", companyId)
      .single();

    if (error) {
      return { error: { message: "Product not found" } };
    }

    return { data };
  }

  static async createProduct(product: NewProduct): Promise<ProductResponse> {
    try {
      // Extract documents if they exist, otherwise use empty object
      const { documents = {}, manufacturer_id, ...productData } = product;

      // Validate and map documents with type assertion to fix lint error
      const validatedDocuments = validateAndMapDocuments(
        documents as Record<string, any[]>
      );

      // Create the product with document URLs
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            ...productData,
            manufacturer_id: manufacturer_id || null, // Set to null if empty
            documents:
              Object.keys(validatedDocuments).length > 0
                ? validatedDocuments
                : null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Product creation error:", error);
        return {
          error: {
            message: error.message || "Failed to create product",
            field: error.details,
          },
        };
      }

      return { data };
    } catch (error) {
      console.error("Error in createProduct:", error);
      return {
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    }
  }

  static async updateProduct(
    id: string,
    product: UpdateProduct
  ): Promise<ProductResponse> {
    const { data, error } = await supabase
      .from("products")
      .update(product)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        error: {
          message: "Failed to update product",
          field: error.details,
        },
      };
    }

    return { data };
  }

  static async deleteProduct(id: string): Promise<boolean> {
    try {
      // First, get the product to access its images
      const { data: product, error: getError } = await supabase
        .from("products")
        .select("images")
        .eq("id", id)
        .single();

      if (getError) {
        console.error("Error fetching product for deletion:", getError);
        throw new Error("Failed to fetch product for deletion");
      }

      // Delete associated images if they exist
      if (
        product?.images &&
        Array.isArray(product.images) &&
        product.images.length > 0
      ) {
        const { StorageService } = await import("./storage");

        // Delete each product image from storage
        for (const image of product.images) {
          if (image?.url) {
            await StorageService.deleteProductImage(image.url);
          }
        }
      }

      // Now delete the product from the database
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        console.error("Error deleting product:", error);
        throw new Error("Failed to delete product");
      }

      return true;
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      throw error;
    }
  }

  static async getPendingProducts(
    email: string,
    page = 0,
    pageSize = 10
  ): Promise<{
    items: {
      id: string;
      name: string;
      sku: string;
      status: string;
      createdAt: string;
      manufacturer: string;
    }[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
  }> {
    console.log("Fetching pending products with email:", email);

    // Get the current user's session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error getting session:", sessionError);
      throw new Error("Failed to get user session");
    }

    if (!session) {
      console.error("No active session found");
      throw new Error("No active session found");
    }

    // Get the user's metadata from the session
    const userMetadata = session.user.user_metadata;
    const companyId = userMetadata?.company_id;

    if (!companyId) {
      console.error("No company ID found in user metadata");
      return {
        items: [],
        totalPages: 0,
        currentPage: page,
        totalItems: 0,
      };
    }

    console.log("Found company ID:", companyId);

    // Fetch products by manufacturer_id with status DRAFT or NEW
    const { data, error, count } = await supabase
      .from("products")
      .select("*, manufacturer:manufacturer_id (name)", { count: "exact" })
      .eq("manufacturer_id", companyId)
      .in("status", ["DRAFT", "NEW"])
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending products:", error);
      throw new Error("Failed to fetch pending products");
    }

    return {
      items:
        data?.map((product) => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          status: product.status,
          createdAt: product.created_at,
          manufacturer: product.manufacturer?.name || "Unknown",
        })) || [],
      totalPages: Math.ceil((count || 0) / pageSize),
      currentPage: page,
      totalItems: count || 0,
    };
  }
}

export const productService = createService({
  getProducts: async ({ companyId }: { companyId: string }) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
    return data || [];
  },
  getProduct: async ({
    id,
    companyId,
  }: {
    id: string;
    companyId: string;
  }): Promise<ProductResponse> => {
    // Admin şirketi için özel durum - tüm ürünleri göster
    if (companyId === ADMIN_COMPANY_ID) {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          manufacturer:manufacturer_id (
            id,
            name,
            taxInfo,
            companyType,
            status
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        return { error: { message: "Product not found" } };
      }

      return { data };
    }

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        manufacturer:manufacturer_id (
          id,
          name,
          taxInfo,
          companyType,
          status
        )
      `
      )
      .eq("id", id)
      .eq("company_id", companyId)
      .single();

    if (error) {
      return { error: { message: "Product not found" } };
    }

    return { data };
  },
  createProduct: async (product: NewProduct) => {
    try {
      // Extract documents if they exist, otherwise use empty object
      const { documents = {}, manufacturer_id, ...productData } = product;

      // Validate and map documents with type assertion to fix lint error
      const validatedDocuments = validateAndMapDocuments(
        documents as Record<string, any[]>
      );

      // Create the product with document URLs
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            ...productData,
            manufacturer_id: manufacturer_id || null, // Set to null if empty
            documents:
              Object.keys(validatedDocuments).length > 0
                ? validatedDocuments
                : null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Product creation error:", error);
        return {
          error: {
            message: error.message || "Failed to create product",
            field: error.details,
            code: error.code,
          },
        };
      }

      return { data };
    } catch (error) {
      console.error("Error in createProduct:", error);

      return {
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error instanceof Error ? error.stack : undefined,
        },
      };
    }
  },
  updateProduct: async ({
    id,
    product,
  }: {
    id: string;
    product: UpdateProduct;
  }): Promise<ProductResponse> => {
    const { data, error } = await supabase
      .from("products")
      .update(product)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        error: {
          message: "Failed to update product",
          field: error.details,
        },
      };
    }

    return { data };
  },
  deleteProduct: async ({ id }: { id: string }): Promise<boolean> => {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      throw new Error("Failed to delete product");
    }

    return true;
  },
  getPendingProducts: async ({
    email,
    page = 0,
    pageSize = 10,
  }: {
    email: string;
    page?: number;
    pageSize?: number;
  }) => {
    // Get the current user's session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error getting session:", sessionError);
      throw new Error("Failed to get user session");
    }

    if (!session) {
      console.error("No active session found");
      throw new Error("No active session found");
    }

    // Get the user's metadata from the session
    const userMetadata = session.user.user_metadata;
    const companyId = userMetadata?.company_id;

    if (!companyId) {
      console.error("No company ID found in user metadata");
      return {
        items: [],
        totalPages: 0,
        currentPage: page,
        totalItems: 0,
      };
    }

    // Fetch products by manufacturer_id with status DRAFT or NEW
    const { data, error, count } = await supabase
      .from("products")
      .select("*, manufacturer:manufacturer_id (name)", { count: "exact" })
      .eq("manufacturer_id", companyId)
      .in("status", ["DRAFT", "NEW"])
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending products:", error);
      throw new Error("Failed to fetch pending products");
    }

    return {
      items:
        data?.map((product) => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          status: product.status,
          createdAt: product.created_at,
          manufacturer: product.manufacturer?.name || "Unknown",
        })) || [],
      totalPages: Math.ceil((count || 0) / pageSize),
      currentPage: page,
      totalItems: count || 0,
    };
  },
});
