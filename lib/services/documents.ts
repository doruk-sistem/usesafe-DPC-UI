import { Document } from '@/lib/types/document';
import { Product } from '@/lib/types/product';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export async function getDocuments(productId?: string): Promise<{ documents: Document[], product?: Product }> {
  try {
    if (!productId) {
      // Use absolute path with window.location.origin
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const url = `${baseUrl}/api/documents`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch documents: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { documents: data || [] };
    }

    // If productId is provided, fetch from Supabase
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, status, documents, manufacturer_id")
      .eq("id", productId)
      .single();

    if (productError) throw productError;
    if (!product) throw new Error("Product not found");

    // Flatten all document arrays into a single array
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

    return { documents: allDocuments, product };
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

export async function getDocumentById(id: string): Promise<Document> {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/api/documents/${id}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch document: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}

export async function approveDocument(documentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("documents")
      .update({ status: "approved" })
      .eq("id", documentId);

    if (error) throw error;
  } catch (error) {
    console.error("Error approving document:", error);
    throw error;
  }
}

export async function rejectDocument(documentId: string, reason: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("documents")
      .update({ 
        status: "rejected",
        rejection_reason: reason
      })
      .eq("id", documentId);

    if (error) throw error;
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

    const { error: updateError } = await supabase
      .from('products')
      .update({
        documents: {
          [documentType]: [newDocument],
        },
      })
      .eq('id', productId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
} 