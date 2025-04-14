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
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { error: { message: "Product not found" } };
      }

      return { data };
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
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
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { error: { message: "Product not found" } };
      }

      return { data };
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
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
});
