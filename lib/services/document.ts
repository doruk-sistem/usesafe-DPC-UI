import { supabase } from "@/lib/supabase/client";
import { Document, DocumentStatus } from "@/lib/types/document";

interface StorageOptions {
  bucketName: string;
  companyId: string;
  productId?: string;
}

export class DocumentService {
  private static readonly DOCUMENTS_BUCKET =
    process.env.NEXT_PUBLIC_PRODUCT_DOCUMENTS_BUCKET || "product-documents";

  static async uploadDocument(
    file: File,
    options: StorageOptions
  ): Promise<string | null> {
    try {
      // Sanitize filename by removing special characters and spaces
      const sanitizedName = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^a-zA-Z0-9.-]/g, "_"); // Replace special chars with underscore

      // Create path with sanitized filename
      const path = options.productId
        ? `${options.companyId}/${
            options.productId
          }/${Date.now()}-${sanitizedName}`
        : `${options.companyId}/temp/${Date.now()}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from(this.DOCUMENTS_BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type, // Set proper content type
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(this.DOCUMENTS_BUCKET).getPublicUrl(path);

      return publicUrl;
    } catch (err) {
      console.error("Document upload error:", err);
      throw err; // Re-throw to handle in the component
    }
  }

  static async uploadMultipleDocuments(
    files: { file: File; type: string }[],
    options: StorageOptions
  ): Promise<{ [key: string]: string[] }> {
    const uploadedDocs: { [key: string]: string[] } = {};

    for (const { file, type } of files) {
      const url = await this.uploadDocument(file, {
        ...options,
        bucketName: this.DOCUMENTS_BUCKET,
      });

      if (url) {
        if (!uploadedDocs[type]) {
          uploadedDocs[type] = [];
        }
        uploadedDocs[type].push(url);
      }
    }

    return uploadedDocs;
  }

  static async deleteDocument(url: string): Promise<boolean> {
    try {
      const path = url.split("/").pop();
      if (!path) return false;

      const { error } = await supabase.storage
        .from(this.DOCUMENTS_BUCKET)
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Document deletion error:", err);
      return false;
    }
  }

  static async rejectDocument(document: Document, reason: string): Promise<void> {
    try {
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", document.productId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch product: ${fetchError.message}`);
      }

      if (!product) {
        throw new Error(`No product found with ID ${document.productId}`);
      }

      let updatedDocuments;

      if (
        product.documents &&
        typeof product.documents === "object" &&
        !Array.isArray(product.documents)
      ) {
        updatedDocuments = JSON.parse(JSON.stringify(product.documents));

        for (const docType in updatedDocuments) {
          if (Array.isArray(updatedDocuments[docType])) {
            updatedDocuments[docType] = updatedDocuments[docType].map(
              (doc: any) => {
                if (
                  doc.id === document.id ||
                  (doc.url && document.url && doc.url === document.url)
                ) {
                  return {
                    ...doc,
                    status: DocumentStatus.REJECTED,
                    rejection_reason: reason,
                  };
                }
                return doc;
              }
            );
          }
        }
      } else if (Array.isArray(product.documents)) {
        updatedDocuments = product.documents.map((doc: any) => {
          if (
            doc.id === document.id ||
            (doc.url && document.url && doc.url === document.url)
          ) {
            return {
              ...doc,
              status: DocumentStatus.REJECTED,
              rejection_reason: reason,
            };
          }
          return doc;
        });
      } else {
        updatedDocuments = [
          {
            id: document.id,
            name: document.name,
            type: document.type,
            status: DocumentStatus.REJECTED,
            rejection_reason: reason,
          },
        ];
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({
          documents: updatedDocuments,
        })
        .eq("id", document.productId);

      if (updateError) {
        throw new Error(
          `Failed to update product documents: ${updateError.message}`
        );
      }
    } catch (error) {
      console.error("Error in document rejection:", error);
      throw error;
    }
  }
}
