"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { DocumentService } from "@/lib/services/document";
import { supabase } from "@/lib/supabase/client";
import { Document, DocumentStatus, DocumentType } from "@/lib/types/document";

export const documentsApiHooks = {
  useGetDocuments: () => {
    return useQuery({
      queryKey: ["documents"],
      queryFn: async () => {
        try {
          const { data, error } = await supabase.from("products").select("*");

          if (error) {
            console.error("Supabase error:", error);
            throw error;
          }

          if (!data) {
            return [];
          }

          // Flatten all documents into a single array
          const allDocuments = data.flatMap((product: any) => {
            if (!product.documents) {
              return [];
            }

            const docs = Array.isArray(product.documents)
              ? product.documents
              : Object.entries(product.documents).flatMap(([type, docs]: [string, any]) => {
                  if (Array.isArray(docs)) {
                    return docs.map((doc: any) => ({
                      ...doc,
                      type,
                      category: doc.category || type,
                    }));
                  }
                  return [];
                });

            return docs.map((doc: any) => ({
              id: doc.id || `doc-${Date.now()}-${Math.random()}`,
              name: doc.name || "Unnamed Document",
              type: doc.type || "unknown",
              category: doc.category || doc.type || "unknown",
              url: doc.url || "",
              status: (doc.status || "pending").toLowerCase(),
              productId: product.id,
              manufacturer: product.manufacturer || "",
              manufacturerId: product.manufacturer_id || "",
              fileSize: doc.fileSize || "",
              version: doc.version || "1.0",
              validUntil: doc.validUntil || null,
              rejection_reason: doc.rejection_reason || null,
              created_at: doc.created_at || new Date().toISOString(),
              updated_at: doc.updated_at || new Date().toISOString(),
              uploadedAt: doc.uploadedAt || new Date().toISOString(),
              size: doc.size || 0
            } as Document));
          });

          return allDocuments;
        } catch (error) {
          console.error("Error in useGetDocuments:", error);
          throw error;
        }
      },
      retry: 1,
      refetchOnWindowFocus: false,
    });
  },
  useDeleteDocument: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({
        productId,
        documentId,
      }: {
        productId: string;
        documentId: string;
      }) => {
        // First, get the product to find the document
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("documents")
          .eq("id", productId)
          .single();

        if (fetchError) throw fetchError;

        // Filter out the document to delete
        const updatedDocuments = (product.documents || []).filter(
          (doc: any) => doc.id !== documentId
        );

        // Update the product with the filtered documents
        const { error: updateError } = await supabase
          .from("products")
          .update({ documents: updatedDocuments })
          .eq("id", productId);

        if (updateError) throw updateError;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["getDocuments"] });
      },
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
        try {
          // First, get the product to find the document
          const { data: products, error: fetchError } = await supabase
            .from("products")
            .select("*")
            .eq("manufacturer_id", productId);

          if (fetchError) {
            throw new Error(`Failed to fetch product: ${fetchError.message}`);
          }

          if (!products || products.length === 0) {
            throw new Error(
              `No products found with manufacturer ID ${productId}`
            );
          }

          // Use the first product that matches the manufacturer ID
          const product = products[0];

          // Create a deep copy of the documents to avoid reference issues
          let updatedDocuments;
          let documentUpdated = false;

          // Handle documents as an object with arrays
          if (
            product.documents &&
            typeof product.documents === "object" &&
            !Array.isArray(product.documents)
          ) {
            updatedDocuments = JSON.parse(JSON.stringify(product.documents));

            // Try to find the document in all document types
            for (const docTypeKey in updatedDocuments) {
              if (Array.isArray(updatedDocuments[docTypeKey])) {
                const documentIndex = updatedDocuments[docTypeKey].findIndex(
                  (doc: any) =>
                    (doc.id && doc.id === documentId) ||
                    (doc.name && documentId.includes(doc.name))
                );

                if (documentIndex !== -1) {
                  updatedDocuments[docTypeKey][documentIndex] = {
                    ...updatedDocuments[docTypeKey][documentIndex],
                    status,
                  };

                  documentUpdated = true;
                  break;
                }
              }
            }
          }
          // Handle documents as an array
          else if (Array.isArray(product.documents)) {
            updatedDocuments = JSON.parse(JSON.stringify(product.documents));

            // Find the document by ID - direct match without parsing
            const documentIndex = updatedDocuments.findIndex(
              (doc: any) =>
                (doc.id && doc.id === documentId) ||
                (doc.name && documentId.includes(doc.name))
            );

            if (documentIndex !== -1) {
              updatedDocuments[documentIndex] = {
                ...updatedDocuments[documentIndex],
                status,
              };

              documentUpdated = true;
            }
          } else {
            throw new Error("Invalid documents format");
          }

          if (!documentUpdated) {
            throw new Error(
              `Document with ID ${documentId} not found in product`
            );
          }

          // Update the product with the updated documents
          const { data: updatedProduct, error: updateError } = await supabase
            .from("products")
            .update({ documents: updatedDocuments })
            .eq("id", product.id)
            .select();

          if (updateError) {
            throw new Error(`Failed to update product: ${updateError.message}`);
          }

          return updatedProduct;
        } catch (error) {
          console.error("Error in document status update:", error);
          throw error;
        }
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["getDocuments"] });
        queryClient.invalidateQueries({ queryKey: ["getProducts"] });
      },
      onError: (error) => {
        console.error("Error in document status update:", error);
      },
    });
  },

  // Yeni fonksiyon: Belge durumunu doğrudan güncellemek için
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
                        status,
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
                  status,
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
                status,
                rejection_reason: reason,
              },
            ];
          }

          const { data: updatedProduct, error: updateError } = await supabase
            .from("products")
            .update({
              documents: updatedDocuments,
            })
            .eq("id", document.productId)
            .select();

          if (updateError) {
            throw new Error(
              `Failed to update product documents: ${updateError.message}`
            );
          }

          return updatedProduct;
        } catch (error) {
          console.error("Error in direct document status update:", error);
          throw error;
        }
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["getDocuments"] });
        queryClient.invalidateQueries({ queryKey: ["getProducts"] });
      },
      onError: (error) => {
        console.error("Error in direct document status update:", error);
      },
    });
  },

  useRejectDocument: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({
        document,
        reason,
      }: {
        document: Document;
        reason: string;
      }) => {
        await DocumentService.rejectDocument(document, reason);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      },
    });
  },
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
    console.error("Error updating document status:", error);
    throw error;
  }
};

export { updateDocumentStatus };
