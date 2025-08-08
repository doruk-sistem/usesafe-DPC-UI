import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Document } from "@/lib/types/document";
import { BaseProduct } from "@/lib/types/product";

const supabase = createClientComponentClient();

export async function getDocuments(productId: string): Promise<{ documents: Document[], product: BaseProduct }> {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) throw error;
    if (!product) throw new Error("Product not found");

    // Fetch materials for this product with sustainability metrics
    const { data: materials, error: materialsError } = await supabase
      .from("product_materials")
      .select(`
        id, 
        name, 
        percentage, 
        recyclable, 
        description,
        sustainability_score,
        carbon_footprint,
        water_usage,
        energy_consumption,
        chemical_usage,
        co2_emissions,
        recycled_content_percentage,
        biodegradability_percentage,
        minimum_durability_years,
        water_consumption_per_unit,
        greenhouse_gas_emissions,
        chemical_consumption_per_unit,
        recycled_materials_percentage
      `)
      .eq("product_id", productId);

    if (!materialsError && materials) {
      product.materials = materials;
    }

    // Sadece documents tablosundan çek
    const { data: documents, error: docsError } = await supabase
      .from("documents")
      .select("*")
      .contains("documentInfo", { productId })
      .order("createdAt", { ascending: false });

    if (docsError) {
      console.error("Error fetching documents from documents table:", docsError);
      return { documents: [], product: product as BaseProduct };
    }

    // Map documents to the expected format
    const allDocuments: Document[] = (documents || []).map((doc: any) => ({
      id: doc.id,
      name: doc.documentInfo?.name || 'Unnamed Document',
      url: doc.documentInfo?.url || '',
      type: doc.documentInfo?.type || 'unknown',
      status: doc.status || 'pending',
      validUntil: doc.documentInfo?.validUntil,
      version: doc.documentInfo?.version || '1.0',
      uploadedAt: doc.createdAt || new Date().toISOString(),
      fileSize: doc.documentInfo?.fileSize || 'N/A',
      rejection_reason: doc.documentInfo?.rejection_reason,
      notes: doc.documentInfo?.notes,
      originalType: doc.documentInfo?.originalType
    }));

    return { documents: allDocuments, product: product as BaseProduct };
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
}

export async function getDocumentById(productId: string, documentId: string): Promise<Document> {
  try {
    // Get document directly from documents table
    const { data: document, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .contains("documentInfo", { productId })
      .single();

    if (error) throw error;
    if (!document) throw new Error("Document not found");

    // Map to Document format
    const foundDocument: Document = {
      id: document.id,
      name: document.documentInfo?.name || 'Unnamed Document',
      url: document.documentInfo?.url || '',
      type: document.documentInfo?.type || 'unknown',
      status: document.status || 'pending',
      validUntil: document.documentInfo?.validUntil,
      version: document.documentInfo?.version || '1.0',
      uploadedAt: document.createdAt || new Date().toISOString(),
      fileSize: document.documentInfo?.fileSize || 'N/A',
      rejection_reason: document.documentInfo?.rejection_reason,
      notes: document.documentInfo?.notes,
      originalType: document.documentInfo?.originalType
    };

    return foundDocument;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
}

export async function approveDocument(productId: string, documentId: string): Promise<void> {
  try {
    // Use DocumentService to approve document
    const { DocumentService } = await import("./document");
    await DocumentService.approveDocument(documentId);
  } catch (error) {
    console.error("Error approving document:", error);
    throw error;
  }
}

export async function rejectDocument(productId: string, documentId: string, reason: string): Promise<void> {
  try {
    // Use DocumentService to reject document
    const { DocumentService } = await import("./document");
    await DocumentService.rejectDocument(documentId, reason);
  } catch (error) {
    console.error("Error rejecting document:", error);
    throw error;
  }
}

export async function uploadDocument(
  productId: string,
  file: File,
  documentType: string,
  metadata: {
    version?: string;
    validUntil?: string;
    notes?: string;
  }
): Promise<void> {
  try {
    // 1. Get the product to get company_id
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("company_id")
      .eq("id", productId)
      .single();

    if (productError) throw productError;
    if (!product) throw new Error("Product not found");

    // 2. Use DocumentService to upload document
    const { DocumentService } = await import("./document");
    
    await DocumentService.uploadDocument(file, {
      companyId: product.company_id,
      bucketName: process.env.NEXT_PUBLIC_PRODUCT_DOCUMENTS_BUCKET || "product-documents",
      productId: productId
    }, {
      name: file.name,
      type: documentType,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      version: metadata.version || "1.0",
      validUntil: metadata.validUntil,
      notes: metadata.notes,
      productId: productId
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

export async function updateDocument(
  productId: string,
  documentId: string,
  updates: {
    status?: string;
    rejection_reason?: string;
    notes?: string;
  }
): Promise<void> {
  try {
    // Get the document from documents table
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("documentInfo")
      .eq("id", documentId)
      .contains("documentInfo", { productId })
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch document: ${fetchError.message}`);
    }

    if (!document) {
      throw new Error("Document not found");
    }

    // Update documentInfo with new values
    const updatedDocumentInfo = {
      ...document.documentInfo,
      ...updates
    };

    // Update the document
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        documentInfo: updatedDocumentInfo,
        ...(updates.status && { status: updates.status })
      })
      .eq("id", documentId);

    if (updateError) {
      throw new Error(`Failed to update document: ${updateError.message}`);
    }
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
} 