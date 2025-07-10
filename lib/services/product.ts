import { supabase } from "@/lib/supabase/client";
import type {
  NewProduct,
  ProductResponse,
  UpdateProduct,
} from "@/lib/types/product";

import { createService } from "../api-client";

export const productService = createService({
  getProductCategories: async ({}: {}) => {
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  },
  getProducts: async ({ companyId, manufacturerId }: { companyId?: string; manufacturerId?: string }) => {
    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          manufacturer:manufacturer_id (
            id,
            name
          ),
          key_features:product_key_features (
            id,
            name,
            value,
            unit,
            created_at,
            updated_at
          )
        `);

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      if (manufacturerId) {
        query = query.eq("manufacturer_id", manufacturerId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  },
  getProduct: async ({
    id,
    companyId,
  }: {
    id: string;
    companyId: string;
  }): Promise<ProductResponse> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const isAdmin = userData?.user?.user_metadata?.role === "admin";
      if (!id) {
        return {
          error: {
            message: "Product ID is required",
          },
        };
      }

      if (!companyId && !isAdmin) {
        return {
          error: {
            message: "Company ID is required for non-admin users",
          },
        };
      }

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(`
          *,
          manufacturer:manufacturer_id (
            id,
            name,
            taxInfo,
            companyType,
            status
          ),
          key_features:product_key_features (
            id,
            name,
            value,
            unit,
            created_at,
            updated_at
          )
        `)
        .eq("id", id)
        .single();

      if (productError) {
        return {
          error: {
            message: productError.message || "Failed to fetch product",
            field: productError.details,
          },
        };
      }

      if (!productData) {
        return {
          error: {
            message: "Product not found",
          },
        };
      }

      if (!productData.manufacturer && productData.manufacturer_id) {
        const { data: manufacturerData, error: manufacturerError } = await supabase
          .from("manufacturer")
          .select("*")
          .eq("id", productData.manufacturer_id)
          .single();

        if (!manufacturerError && manufacturerData) {
          productData.manufacturer = manufacturerData;
        }
      }

      return { data: productData };
    } catch (error) {
      return {
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    }
  },
  createProduct: async (product: NewProduct): Promise<ProductResponse> => {
    try {
      // Extract documents and key_features if they exist, otherwise use empty object
      const { documents = {}, manufacturer_id, key_features = [], ...productData } = product;

      // Create the product WITHOUT documents in JSONB - documents are now stored in separate table
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            ...productData,
            manufacturer_id: manufacturer_id || null // Set to null if empty
          },
        ])
        .select(`*,
          manufacturer:manufacturer_id (
            id,
            name
          )`
        )
        .single();

      if (error) {
        return {
          error: {
            message: error.message || "Failed to create product",
            field: error.details,
          },
        };
      }

      // Create key features if they exist
      if (data && key_features.length > 0) {
        try {
          const { productKeyFeaturesService } = await import("./product-key-features");
          await productKeyFeaturesService.create(data.id, key_features);
        } catch (keyFeaturesError) {
          console.error("Error creating key features:", keyFeaturesError);
          // Key features oluşturulamazsa ürünü sil
          await supabase.from("products").delete().eq("id", data.id);
          return {
            error: {
              message: "Failed to create product key features",
              field: "key_features",
            },
          };
        }
      }

      // Get the complete product with key features
      const completeProduct = await productService.getProduct({
        id: data.id,
        companyId: data.company_id,
      });

      return completeProduct;
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
    const { manufacturer_id, key_features, ...productData } = product;
    
    // Önce mevcut ürünü al
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("status, status_history, manufacturer_id, company_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      return {
        error: {
          message: "Failed to fetch existing product",
          field: fetchError.details,
        },
      };
    }

    // Eğer ürün DELETED statüsündeyse, NEW'e çevir
    let updatedStatus = productData.status;
    let updatedStatusHistory = existingProduct?.status_history || [];

    if (existingProduct?.status === "DELETED") {
      updatedStatus = "NEW";
      updatedStatusHistory = [
        ...updatedStatusHistory,
        {
          from: "DELETED",
          to: "NEW",
          timestamp: new Date().toISOString(),
          userId: (await supabase.auth.getUser()).data.user?.id,
          reason: "Product updated after rejection",
        },
      ];
    } else {
      // Eğer statü belirtilmemişse, mevcut statüyü koru
      updatedStatus = updatedStatus || existingProduct?.status;
      
      // Belgelerde rejected statüsü varsa, ürün statüsünü PENDING'e çevir
      // Artık documents tablosundan kontrol ediyoruz
      const { data: documents, error: docsError } = await supabase
        .from("documents")
        .select("*")
        .eq("companyId", existingProduct?.company_id || "")
        .eq("documentInfo->productId", id);

      if (!docsError && documents) {
        const hasRejectedDocuments = documents.some(
          (doc: any) => doc.status === "rejected"
        );
        
        if (hasRejectedDocuments && existingProduct?.status !== "PENDING") {
          updatedStatus = "PENDING";
          updatedStatusHistory = [
            ...updatedStatusHistory,
            {
              from: existingProduct?.status,
              to: "PENDING",
              timestamp: new Date().toISOString(),
              userId: (await supabase.auth.getUser()).data.user?.id,
              reason: "Product has rejected documents",
            },
          ];
        }
      }
    }
    
    // Sadece gerekli alanları güncelle, documents alanını kaldır
    const { documents, ...productDataWithoutDocs } = productData;
    
    const updateData = {
      ...productDataWithoutDocs,
      manufacturer_id: manufacturer_id || existingProduct?.manufacturer_id,
      updated_at: new Date().toISOString(),
    };

    // Eğer statü değişiyorsa güncelle, değişmiyorsa sadece diğer alanları güncelle
    const finalUpdateData = updatedStatus !== existingProduct?.status 
      ? {
          ...updateData,
          status: updatedStatus,
          status_history: updatedStatusHistory,
        }
      : updateData;

    // Status'u ayrı bir update ile güncelle
    const { data, error } = await supabase
      .from("products")
      .update(finalUpdateData)
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

    // Update key features if they exist
    if (data && key_features) {
      try {
        const { productKeyFeaturesService } = await import("./product-key-features");
        await productKeyFeaturesService.update(id, key_features);
      } catch (keyFeaturesError) {
        console.error("Error updating key features:", keyFeaturesError);
        return {
          error: {
            message: "Failed to update product key features",
            field: "key_features",
          },
        };
      }
    }

    // Get the complete product with key features
    const completeProduct = await productService.getProduct({
      id: data.id,
      companyId: data.company_id,
    });

    return completeProduct;
  },
  deleteProduct: async ({ id }: { id: string }): Promise<boolean> => {
    try {
      // Fetch the product to access its images
      const { data: product, error: getError } = await supabase
        .from("products")
        .select("images")
        .eq("id", id)
        .single();

      if (getError) {
        throw new Error("Failed to fetch product for deletion");
      }

      // Dynamically import StorageService only if needed
      if (
        product?.images &&
        Array.isArray(product.images) &&
        product.images.length > 0
      ) {
        const { StorageService } = await import("./storage");
        for (const image of product.images) {
          if (image?.url) {
            await StorageService.deleteProductImage(image.url);
          }
        }
      }

      // Delete key features first (CASCADE will handle this automatically, but explicit for clarity)
      try {
        const { productKeyFeaturesService } = await import("./product-key-features");
        await productKeyFeaturesService.delete(id);
      } catch (keyFeaturesError) {
        console.error("Error deleting key features:", keyFeaturesError);
        // Continue with product deletion even if key features deletion fails
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
  },
  rejectProduct: async ({
    productId,
    reason,
  }: {
    productId: string;
    reason: string;
  }) => {
    try {
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch product: ${fetchError.message}`);
      }

      if (!product) {
        throw new Error(`No product found with ID ${productId}`);
      }

      // Update documents in the documents table instead of JSONB
      const { DocumentService } = await import("./document");
      
      // Get all documents for this product
      const { data: documents, error: docsError } = await supabase
        .from("documents")
        .select("*")
        .eq("companyId", product.company_id);

      if (!docsError && documents) {
        // Update each document's status to rejected
        await Promise.all(
          documents
            .filter((doc: any) => doc.documentInfo?.productId === productId)
            .map(async (doc: any) => {
              try {
                await DocumentService.rejectDocument(doc.id, reason);
              } catch (error) {
                console.error(`Error rejecting document ${doc.id}:`, error);
              }
            })
        );
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({
          status: "DELETED",
          status_history: [
            ...(product.status_history || []),
            {
              from: product.status,
              to: "DELETED",
              timestamp: new Date().toISOString(),
              userId: (await supabase.auth.getUser()).data.user?.id,
              reason: `Rejected: ${reason}`,
            },
          ],
        })
        .eq("id", productId);

      if (updateError) {
        throw new Error(
          `Failed to update product status: ${updateError.message}`
        );
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  },
  getPendingProducts: async ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
    try {
      // Get current user's session to access company_id
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
      const userMetadata = session.user.user_metadata;
      const companyId = userMetadata?.company_id;
      if (!companyId) {
        return {
          items: [],
          totalPages: 0,
          currentPage: pageIndex,
          totalItems: 0,
        };
      }

      // Fetch products by manufacturer_id with status NEW, DRAFT, or DELETED
      const { data, error, count } = await supabase
        .from("products")
        .select("*, manufacturer:manufacturer_id (name)", { count: "exact" })
        .eq("manufacturer_id", companyId)
        .in("status", ["NEW", "DRAFT", "DELETED"])
        .range(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error("Failed to fetch pending products");
      }

      // Filter out NEW products if they have a DRAFT version, but always show DELETED products
      const filteredData = data?.filter((product) => {
        if (product.status === "DRAFT" || product.status === "DELETED") {
          return true; // Always show DRAFT and DELETED products
        }
        
        // For NEW products, check if there's a DRAFT version with the same name and model
        if (product.status === "NEW") {
          const hasDraftVersion = data?.some((otherProduct) => 
            otherProduct.status === "DRAFT" && 
            otherProduct.name === product.name && 
            otherProduct.model === product.model
          );
          return !hasDraftVersion; // Only show NEW if no DRAFT version exists
        }
        
        return false;
      }) || [];

      return {
        items: filteredData,
        totalPages: Math.ceil((filteredData.length) / pageSize),
        currentPage: pageIndex,
        totalItems: filteredData.length,
      };
    } catch (error) {
      console.error("Error in getPendingProducts:", error);
      throw error;
    }
  },
  approveProduct: async ({ productId }: { productId: string }) => {
    try {
      // 1. Get the product
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch product: ${fetchError.message}`);
      }

      if (!product) {
        throw new Error(`No product found with ID ${productId}`);
      }

      // 2. Update the original product status to ARCHIVED
      const { error: updateError } = await supabase
        .from("products")
        .update({
          status: "ARCHIVED",
          status_history: [
            ...(product.status_history || []),
            {
              from: product.status,
              to: "ARCHIVED",
              timestamp: new Date().toISOString(),
              userId: (await supabase.auth.getUser()).data.user?.id,
              reason: "Approved and moved to draft",
            },
          ],
        })
        .eq("id", productId);

      if (updateError) {
        throw new Error(`Failed to update original product: ${updateError.message}`);
      }

      // 3. Create a new product for the manufacturer
      const newProduct = {
        ...product,
        id: crypto.randomUUID(),
        company_id: product.manufacturer_id,
        status: "DRAFT",
        status_history: [
          {
            from: null,
            to: "DRAFT",
            timestamp: new Date().toISOString(),
            userId: (await supabase.auth.getUser()).data.user?.id,
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 4. Insert the new product
      const { error: createError } = await supabase
        .from("products")
        .insert([newProduct])
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create new product: ${createError.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error("Error in product approval:", error);
      throw error;
    }
  },
});
