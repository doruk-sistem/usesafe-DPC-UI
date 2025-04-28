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

   
    const allDocuments: Document[] = [];
    if (product.documents) {
      Object.entries(product.documents).forEach(([type, docs]) => {
        if (Array.isArray(docs)) {
          docs.forEach((doc) => {
            allDocuments.push({
              id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: doc.name,
              url: doc.url,
              type: type,
              status: doc.status || "pending",
              validUntil: doc.validUntil,
              version: doc.version || "1.0",
              uploadedAt: doc.uploadedAt || new Date().toISOString(),
              fileSize: doc.fileSize || "N/A",
              rejection_reason: doc.rejection_reason,
              notes: doc.notes,
            });
          });
        }
      });
    }

    return { documents: allDocuments, product: product as BaseProduct };
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
}

export async function getDocumentById(productId: string, documentId: string): Promise<Document> {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select("documents")
      .eq("id", productId)
      .single();

    if (error) throw error;
    if (!product) throw new Error("Product not found");

    let foundDocument: Document | null = null;

    Object.entries(product.documents || {}).forEach(([type, docs]) => {
      if (Array.isArray(docs)) {
        const doc = docs.find(d => d.id === documentId);
        if (doc) {
          foundDocument = {
            id: doc.id,
            name: doc.name,
            url: doc.url,
            type: type,
            status: doc.status || "pending",
            validUntil: doc.validUntil,
            version: doc.version || "1.0",
            uploadedAt: doc.uploadedAt || new Date().toISOString(),
            fileSize: doc.fileSize || "N/A",
            rejection_reason: doc.rejection_reason,
            notes: doc.notes,
          };
        }
      }
    });

    if (!foundDocument) {
      throw new Error("Document not found");
    }

    return foundDocument;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
}

export async function approveDocument(productId: string, documentId: string): Promise<void> {
  try {
   
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("documents")
      .eq("id", productId)
      .single();

    if (productError) throw productError;
    if (!product) throw new Error("Product not found");


    const updatedDocuments = { ...product.documents };
    let documentFound = false;

    Object.keys(updatedDocuments).forEach((type) => {
      const documents = updatedDocuments[type];
      if (Array.isArray(documents)) {
        const updatedTypeDocuments = documents.map((doc) => {
          if (doc.id === documentId) {
            documentFound = true;
            return {
              ...doc,
              status: "approved"
            };
          }
          return doc;
        });
        updatedDocuments[type] = updatedTypeDocuments;
      }
    });

    if (!documentFound) {
      throw new Error("Document not found");
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        documents: updatedDocuments
      })
      .eq("id", productId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error("Error approving document:", error);
    throw error;
  }
}

export async function rejectDocument(productId: string, documentId: string, reason: string): Promise<void> {
  try {
   
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("documents")
      .eq("id", productId)
      .single();

    if (productError) throw productError;
    if (!product) throw new Error("Product not found");


    const updatedDocuments = { ...product.documents };
    let documentFound = false;

    Object.keys(updatedDocuments).forEach((type) => {
      const documents = updatedDocuments[type];
      if (Array.isArray(documents)) {
        const updatedTypeDocuments = documents.map((doc) => {
          if (doc.id === documentId) {
            documentFound = true;
            return {
              ...doc,
              status: "rejected",
              rejection_reason: reason
            };
          }
          return doc;
        });
        updatedDocuments[type] = updatedTypeDocuments;
      }
    });

    if (!documentFound) {
      throw new Error("Document not found");
    }


    const { error: updateError } = await supabase
      .from("products")
      .update({
        documents: updatedDocuments
      })
      .eq("id", productId);

    if (updateError) throw updateError;
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

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("documents")
      .eq("id", productId)
      .single();

    if (productError) throw productError;
    if (!product) throw new Error("Product not found");

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${productId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-documents')
      .getPublicUrl(filePath);

    const newDocument = {
      id: fileName,
      name: file.name,
      url: publicUrl,
      type: documentType,
      status: "pending",
      version: metadata.version || "1.0",
      uploadedAt: new Date().toISOString(),
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      validUntil: metadata.validUntil,
      notes: metadata.notes,
    };


    const currentDocuments = product.documents || {};
    const currentTypeDocuments = currentDocuments[documentType] || [];
    
    const updatedDocuments = {
      ...currentDocuments,
      [documentType]: [...currentTypeDocuments, newDocument],
    };


    const { error: updateError } = await supabase
      .from('products')
      .update({
        documents: updatedDocuments,
      })
      .eq('id', productId);

    if (updateError) throw updateError;
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

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("documents")
      .eq("id", productId)
      .single();

    if (productError) throw productError;
    if (!product) throw new Error("Product not found");

    const updatedDocuments = { ...product.documents };
    let documentFound = false;

    Object.keys(updatedDocuments).forEach((type) => {
      const documents = updatedDocuments[type];
      if (Array.isArray(documents)) {
        const updatedTypeDocuments = documents.map((doc) => {
          if (doc.id === documentId) {
            documentFound = true;
            return {
              ...doc,
              ...updates,
            };
          }
          return doc;
        });
        updatedDocuments[type] = updatedTypeDocuments;
      }
    });

    if (!documentFound) {
      throw new Error("Document not found");
    }


    const { error: updateError } = await supabase
      .from("products")
      .update({
        documents: updatedDocuments,
      })
      .eq("id", productId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
} 