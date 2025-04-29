import { supabase } from "@/lib/supabase/client";
import type {
  BaseProduct,
  NewProduct,
  ProductResponse,
  UpdateProduct,
} from "@/lib/types/product";
import { validateAndMapDocuments } from "@/lib/utils/document-mapper";

import { createService } from "../api-client";

// Define admin company ID constant
const ADMIN_COMPANY_ID = "admin";

export class ProductService {
  static async getProducts(companyId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Failed to fetch products");
    }

    return data || [];
  }

  static async getProduct(
    id: string,
    companyId: string
  ): Promise<ProductResponse> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const isAdmin = userData?.user?.user_metadata?.role === "admin";

      if (isAdmin) {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          return {
            error: {
              message: error.message || "Failed to fetch product",
              field: error.details,
            },
          };
        }

        return { data };
      } else {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .eq("company_id", companyId)
          .single();

        if (error) {
          return {
            error: {
              message: error.message || "Failed to fetch product",
              field: error.details,
            },
          };
        }

        return { data };
      }
    } catch (error) {
      return {
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    }
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
        return {
          error: {
            message: error.message || "Failed to create product",
            field: error.details,
          },
        };
      }

      return { data };
    } catch (error) {
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
        throw new Error("Failed to delete product");
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getPendingProducts(
    page = 0,
    pageSize = 10
  ): Promise<{
    items: BaseProduct[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
  }> {
    // Get the current user's session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error("Failed to get user session");
    }

    if (!session) {
      throw new Error("No active session found");
    }

    // Get the user's metadata from the session
    const userMetadata = session.user.user_metadata;
    const companyId = userMetadata?.company_id;

    if (!companyId) {
      return {
        items: [],
        totalPages: 0,
        currentPage: page,
        totalItems: 0,
      };
    }

    // Fetch products by manufacturer_id with status NEW only
    const { data, error, count } = await supabase
      .from("products")
      .select("*, manufacturer:manufacturer_id (name)", { count: "exact" })
      .eq("manufacturer_id", companyId)
      .eq("status", "NEW")  // Sadece NEW status'ündeki ürünleri getir
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Failed to fetch pending products");
    }

    return {
      items: data,
      totalPages: Math.ceil((count || 0) / pageSize),
      currentPage: page,
      totalItems: count || 0,
    };
  }

  static async approveProduct(productId: string, userId: string): Promise<void> {
    console.log('approveProduct başladı:', { productId, userId });

    // Ürünü getir
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError) {
      console.error('Ürün getirme hatası:', fetchError);
      throw fetchError;
    }

    console.log('Mevcut ürün:', product);

    // Yeni bir ürün oluştur (satıcının ürünü olarak)
    console.log('Yeni ürün oluşturuluyor...');
    
    const newProduct = {
      ...product,
      id: crypto.randomUUID(), // Yeni UUID oluştur
      company_id: product.manufacturer_id, // Satıcının ID'si
      status: "DRAFT",
      status_history: [
        {
          from: null,
          to: "DRAFT",
          timestamp: new Date().toISOString(),
          userId,
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: createdProduct, error: createError } = await supabase
      .from("products")
      .insert([newProduct])
      .select()
      .single();

    if (createError) {
      console.error('Yeni ürün oluşturma hatası:', createError);
      throw createError;
    }

    console.log('Yeni ürün oluşturuldu:', createdProduct);

    // Eski ürünün manufacturer_id'sini null yap
    console.log('Eski ürünün manufacturer_id\'si null yapılıyor...');
    
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({
        manufacturer_id: null,
        status_history: [
          ...(product.status_history || []),
          {
            from: product.status,
            to: product.status,
            timestamp: new Date().toISOString(),
            userId,
            reason: "Approved - manufacturer_id removed"
          },
        ],
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select();

    if (updateError) {
      console.error('Eski ürün güncelleme hatası:', updateError);
      throw updateError;
    }

    console.log('Eski ürün güncellendi:', updatedProduct);
  }

  static async rejectProduct(
    productId: string,
    userId: string,
    reason: string
  ): Promise<void> {
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError) throw fetchError;

    const { error: updateError } = await supabase
      .from("products")
      .update({
        status: "REJECTED",
        status_history: [
          ...(product.status_history || []),
          {
            from: product.status,
            to: "REJECTED",
            timestamp: new Date().toISOString(),
            userId,
            reason,
          },
        ],
      })
      .eq("id", productId);

    if (updateError) throw updateError;
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
    if (companyId === "admin") {
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
        return {
          error: {
            message: error.message || "Failed to create product",
            field: error.details,
          },
        };
      }

      return { data };
    } catch (error) {
      return {
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
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
      throw new Error("Failed to delete product");
    }

    return true;
  },
});
