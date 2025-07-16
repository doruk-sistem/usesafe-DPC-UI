import { supabase } from "@/lib/supabase/client";
import { Document, DocumentStatus } from "@/lib/types/document";

interface StorageOptions {
  bucketName: string;
  companyId: string;
  productId?: string;
}

interface DocumentInfo {
  name: string;
  url: string;
  type: string;
  fileSize?: string;
  version?: string;
  validUntil?: string;
  notes?: string;
  originalType?: string;
  [key: string]: any;
}

export class DocumentService {
  private static readonly DOCUMENTS_BUCKET =
    process.env.NEXT_PUBLIC_PRODUCT_DOCUMENTS_BUCKET || "product-documents";

  static async uploadDocument(
    file: File,
    options: StorageOptions,
    documentInfo: Omit<DocumentInfo, 'url'> = {}
  ): Promise<{ url: string; documentId: string } | null> {
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

      // Save document info to documents table
      const documentData = {
        companyId: options.companyId,
        documentInfo: {
          name: documentInfo.name || file.name,
          url: publicUrl,
          type: documentInfo.type || 'technical_docs',
          fileSize: documentInfo.fileSize || `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          version: documentInfo.version || '1.0',
          validUntil: documentInfo.validUntil,
          notes: documentInfo.notes,
          originalType: documentInfo.originalType,
          ...documentInfo
        },
        status: 'pending' as const
      };

      const { data: savedDocument, error: saveError } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (saveError) {
        console.error("Error saving document to database:", saveError);
        // Still return the URL even if database save fails
        return { url: publicUrl, documentId: '' };
      }

      return { url: publicUrl, documentId: savedDocument.id };
    } catch (err) {
      console.error("Document upload error:", err);
      throw err; // Re-throw to handle in the component
    }
  }

  static async uploadMultipleDocuments(
    files: { file: File; type: string; documentInfo?: Partial<DocumentInfo> }[],
    options: StorageOptions
  ): Promise<{ [key: string]: { url: string; documentId: string }[] }> {
    const uploadedDocs: { [key: string]: { url: string; documentId: string }[] } = {};

    for (const { file, type, documentInfo } of files) {
      const result = await this.uploadDocument(file, {
        ...options,
        bucketName: this.DOCUMENTS_BUCKET,
      }, {
        ...documentInfo,
        type
      });

      if (result) {
        if (!uploadedDocs[type]) {
          uploadedDocs[type] = [];
        }
        uploadedDocs[type].push(result);
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

  static async rejectDocument(documentId: string, reason: string): Promise<void> {
    try {
      // Önce mevcut documentInfo'yu al
      const { data: existingDoc, error: fetchError } = await supabase
        .from("documents")
        .select("documentInfo")
        .eq("id", documentId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch document: ${fetchError.message}`);
      }

      // Yeni rejection_reason'ı ekle
      const updatedDocumentInfo = {
        ...existingDoc?.documentInfo,
        rejection_reason: reason
      };

      const { error: updateError } = await supabase
        .from("documents")
        .update({
          status: 'rejected',
          documentInfo: updatedDocumentInfo
        })
        .eq("id", documentId);

      if (updateError) {
        throw new Error(
          `Failed to update document status: ${updateError.message}`
        );
      }
    } catch (error) {
      console.error("Error in document rejection:", error);
      throw error;
    }
  }

  static async approveDocument(documentId: string): Promise<void> {
    try {
      const { error: updateError } = await supabase
        .from("documents")
        .update({
          status: 'approved'
        })
        .eq("id", documentId);

      if (updateError) {
        throw new Error(
          `Failed to update document status: ${updateError.message}`
        );
      }
    } catch (error) {
      console.error("Error in document approval:", error);
      throw error;
    }
  }

  static async getDocumentsByManufacturer(manufacturerId: string) {
    try {
      const { data: documents, error } = await supabase
        .from("documents")
        .select("*")
        .eq("companyId", manufacturerId);

      if (error) throw error;

      // Map documents to the expected format
      return (documents || []).map((doc: any) => ({
        id: doc.id,
        name: doc.documentInfo?.name || 'Unnamed Document',
        url: doc.documentInfo?.url || '',
        type: doc.documentInfo?.type || 'unknown',
        status: doc.status,
        fileSize: doc.documentInfo?.fileSize || '',
        version: doc.documentInfo?.version || '1.0',
        validUntil: doc.documentInfo?.validUntil,
        notes: doc.documentInfo?.notes,
        rejection_reason: doc.documentInfo?.rejection_reason,
        created_at: doc.createdAt,
        updated_at: doc.updatedAt,
        uploadedAt: doc.createdAt,
        originalType: doc.documentInfo?.originalType
      }));
    } catch (err) {
      console.error("getDocumentsByManufacturer error:", err);
      throw err;
    }
  }

  static async getDocumentsByCompany(companyId: string) {
    try {
      const { data: documents, error } = await supabase
        .from("documents")
        .select("*")
        .eq("companyId", companyId)
        .order("createdAt", { ascending: false });

      if (error) throw error;

      // Map documents to the expected format
      return (documents || []).map((doc: any) => ({
        id: doc.id,
        name: doc.documentInfo?.name || 'Unnamed Document',
        url: doc.documentInfo?.url || '',
        type: doc.documentInfo?.type || 'unknown',
        status: doc.status,
        fileSize: doc.documentInfo?.fileSize || '',
        version: doc.documentInfo?.version || '1.0',
        validUntil: doc.documentInfo?.validUntil,
        notes: doc.documentInfo?.notes,
        rejection_reason: doc.documentInfo?.rejection_reason,
        created_at: doc.createdAt,
        updated_at: doc.updatedAt,
        uploadedAt: doc.createdAt,
        originalType: doc.documentInfo?.originalType
      }));
    } catch (err) {
      console.error("getDocumentsByCompany error:", err);
      throw err;
    }
  }

  static async updateDocumentProductId(documentId: string, productId: string): Promise<void> {
    try {
      // Önce mevcut documentInfo'yu al
      const { data: existingDoc, error: fetchError } = await supabase
        .from("documents")
        .select("documentInfo")
        .eq("id", documentId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch document: ${fetchError.message}`);
      }

      if (!existingDoc) {
        throw new Error(`Document with ID ${documentId} not found`);
      }

      // Yeni productId'yi ekle
      const updatedDocumentInfo = {
        ...existingDoc.documentInfo,
        productId
      };

      const { error: updateError } = await supabase
        .from("documents")
        .update({
          documentInfo: updatedDocumentInfo
        })
        .eq("id", documentId);

      if (updateError) {
        throw new Error(`Failed to update document: ${updateError.message}`);
      }
    } catch (error) {
      console.error("Error updating document productId:", error);
      throw error;
    }
  }

  static async getDocumentsByProduct(productId: string) {
    try {
      const { data: documents, error } = await supabase
        .from("documents")
        .select("*")
        .eq("documentInfo->productId", productId)
        .order("createdAt", { ascending: false });

      if (error) throw error;

      // Map documents to the expected format
      return (documents || []).map((doc: any) => ({
        id: doc.id,
        name: doc.documentInfo?.name || 'Unnamed Document',
        url: doc.documentInfo?.url || '',
        type: doc.documentInfo?.type || 'unknown',
        status: doc.status,
        fileSize: doc.documentInfo?.fileSize || '',
        version: doc.documentInfo?.version || '1.0',
        validUntil: doc.documentInfo?.validUntil,
        notes: doc.documentInfo?.notes,
        rejection_reason: doc.documentInfo?.rejection_reason,
        created_at: doc.createdAt,
        updated_at: doc.updatedAt,
        uploadedAt: doc.createdAt,
        originalType: doc.documentInfo?.originalType
      }));
    } catch (err) {
      console.error("getDocumentsByProduct error:", err);
      throw err;
    }
  }
}
