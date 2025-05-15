"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { DocumentService } from "@/lib/services/document";
import { supabase } from "@/lib/supabase/client";
import { Document, DocumentStatus, DocumentType } from "@/lib/types/document";
import { getDocuments, getDocumentById, approveDocument, rejectDocument, uploadDocument, updateDocument, getDocumentByCompanyId, deleteDocument } from "@/lib/services/documents";

export const documentsApiHooks = {
  useGetDocuments: (productId: string | undefined) => {
    return useQuery({
      queryKey: ["documents", productId],
      queryFn: () => getDocuments(productId!),
      enabled: !!productId
    });
  },

  useGetDocumentById: (productId: string | undefined, documentId: string | undefined) => {
    return useQuery({
      queryKey: ["document", productId, documentId],
      queryFn: () => getDocumentById(productId!, documentId!),
      enabled: !!productId && !!documentId
    });
  },

  useGetDocumentByCompanyId: (companyId: string | undefined, documentId: string | undefined) => {
    return useQuery({
      queryKey: ["document", companyId, documentId],
      queryFn: () => getDocumentByCompanyId(companyId!, documentId!),
      enabled: !!companyId && !!documentId
    });
  },

  useApproveDocument: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ productId, documentId }: { productId: string; documentId: string }) =>
        approveDocument(productId, documentId),
      onSuccess: (_, { productId }) => {
        queryClient.invalidateQueries({ queryKey: ["documents", productId] });
      }
    });
  },

  useRejectDocument: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ productId, documentId, reason }: { productId: string; documentId: string; reason: string }) =>
        rejectDocument(productId, documentId, reason),
      onSuccess: (_, { productId }) => {
        queryClient.invalidateQueries({ queryKey: ["documents", productId] });
      }
    });
  },

  useUploadDocument: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        productId,
        file,
        documentType,
        metadata
      }: {
        productId: string;
        file: File;
        documentType: string;
        metadata: {
          version?: string;
          validUntil?: string;
          notes?: string;
        };
      }) => uploadDocument(productId, file, documentType, metadata),
      onSuccess: (_, { productId }) => {
        queryClient.invalidateQueries({ queryKey: ["documents", productId] });
      }
    });
  },

  useUpdateDocument: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        productId,
        documentId,
        updates
      }: {
        productId: string;
        documentId: string;
        updates: {
          status?: string;
          rejection_reason?: string;
          notes?: string;
        };
      }) => updateDocument(productId, documentId, updates),
      onSuccess: (_, { productId }) => {
        queryClient.invalidateQueries({ queryKey: ["documents", productId] });
      }
    });
  },

  useDeleteDocument: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ productId, documentId }: { productId: string; documentId: string }) =>
        deleteDocument(productId, documentId),
      onSuccess: (_, { productId }) => {
        queryClient.invalidateQueries({ queryKey: ["documents", productId] });
      }
    });
  },

  useUpdateDocumentStatus: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({
        productId,
        documentId,
        status,
      }: {
        productId: string;
        documentId: string;
        status: Document["status"];
      }) => {
        return updateDocument(productId, documentId, { status });
      },
      onSuccess: (_, { productId }) => {
        queryClient.invalidateQueries({ queryKey: ["documents", productId] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    });
  },

  useUpdateDocumentStatusDirect: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({
        document,
        status,
        reason,
      }: {
        document: Document;
        status: DocumentStatus;
        reason?: string;
      }) => {
        return updateDocument(document.productId!, document.id!, { 
          status, 
          rejection_reason: reason 
        });
      },
      onSuccess: (_, { document }) => {
        queryClient.invalidateQueries({ queryKey: ["documents", document.productId] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    });
  }
};

const updateDocumentStatus = async (
  productId: string,
  documentId: string,
  status: DocumentStatus
) => {
  try {
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError) throw fetchError;
    if (!product) throw new Error("Product not found");

    let updatedDocuments = { ...product.documents };
    let documentFound = false;
    let documentLocation: string | null = null;

    // Extract document name from documentId if it's a generated ID
    let documentName = "";
    if (documentId.startsWith("doc-")) {
      // Try to find the document in the UI state to get its name
      const documentElement = document.querySelector(
        `[data-document-id="${documentId}"]`
      );
      if (documentElement) {
        documentName = documentElement.getAttribute("data-document-name") || "";
      }
    }

    if (
      typeof updatedDocuments === "object" &&
      !Array.isArray(updatedDocuments)
    ) {
      // Handle documents as an object with arrays
      for (const docTypeKey in updatedDocuments) {
        if (Array.isArray(updatedDocuments[docTypeKey])) {
          // Try to find the document by name or URL
          const documentIndex = updatedDocuments[docTypeKey].findIndex(
            (doc: any) => {
              // Match by name if available, otherwise try to match by URL
              return (
                (documentName && doc.name === documentName) ||
                (doc.url && documentId.includes(doc.url))
              );
            }
          );

          if (documentIndex !== -1) {
            updatedDocuments[docTypeKey][documentIndex] = {
              ...updatedDocuments[docTypeKey][documentIndex],
              status,
              updatedAt: new Date().toISOString(),
            };
            documentFound = true;
            documentLocation = `${docTypeKey}[${documentIndex}]`;
            break;
          }
        }
      }
    } else if (Array.isArray(updatedDocuments)) {
      // Try to find the document by name or URL
      const documentIndex = updatedDocuments.findIndex((doc: any) => {
        // Match by name if available, otherwise try to match by URL
        return (
          (documentName && doc.name === documentName) ||
          (doc.url && documentId.includes(doc.url))
        );
      });

      if (documentIndex !== -1) {
        updatedDocuments[documentIndex] = {
          ...updatedDocuments[documentIndex],
          status,
          updatedAt: new Date().toISOString(),
        };
        documentFound = true;
        documentLocation = `[${documentIndex}]`;
      }
    }

    if (!documentFound) {
      throw new Error(`Document with ID ${documentId} not found in product`);
    }

    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({ documents: updatedDocuments })
      .eq("id", productId)
      .select()
      .single();

    if (updateError) throw updateError;

    return updatedProduct;
  } catch (error) {
    throw error;
  }
};

export { updateDocumentStatus };
