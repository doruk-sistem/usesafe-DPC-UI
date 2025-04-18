"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { Document, DocumentStatus, DocumentType } from "@/lib/types/document";

interface ProductDocument {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  validUntil?: string;
  rejection_reason?: string;
  created_at: string;
  url: string;
  manufacturer: string;
  version?: string;
  fileSize?: string;
}

interface ProductWithDocuments {
  id: string;
  manufacturer_id: string;
  documents: ProductDocument[] | Record<string, ProductDocument[]>;
}

export const documentsApiHooks = {
  useGetProducts: () => {
    return useQuery({
      queryKey: ["getProducts"],
      queryFn: async () => {
        try {
          const { data: products, error } = await supabase
            .from("products")
            .select(`
              id,
              name,
              description,
              manufacturer_id,
              product_type,
              product_subcategory,
              model,
              status,
              status_history,
              images,
              key_features,
              created_at,
              updated_at,
              documents,
              manufacturer:companies!products_manufacturer_id_fkey (
                id,
                name,
                taxInfo,
                companyType,
                status
              )
            `)
            .order("created_at", { ascending: false });

          if (error) {
            throw error;
          }

          // Transform manufacturer from array to object
          const transformedProducts = products?.map(product => ({
            ...product,
            manufacturer: Array.isArray(product.manufacturer) ? product.manufacturer[0] : product.manufacturer
          })) || [];

          return transformedProducts;
        } catch (error) {
          console.error("Error fetching products:", error);
          throw error;
        }
      },
    });
  },

  useGetDocuments: () => {
    return useQuery({
      queryKey: ["documents"],
      queryFn: async () => {
        try {
          // Basit sorgu ile başlayalım
          const { data, error } = await supabase.from("products").select("*");

          if (error) {
            console.error("Supabase error:", error);
            throw error;
          }

          if (!data) {
            return [];
          }

          // Belgeleri düzleştir
          const allDocuments = data.flatMap((product: any) => {
            if (!product.documents) {
              return [];
            }

            const docs = Array.isArray(product.documents)
              ? product.documents
              : Object.values(product.documents).flat();

            return docs.map((doc: any) => ({
              id: doc.id || `doc-${Date.now()}-${Math.random()}`,
              name: doc.name || "Unnamed Document",
              type: doc.type || "unknown",
              url: doc.url || "",
              status: doc.status || "pending",
              productId: product.id,
              manufacturerId: product.manufacturer_id,
              manufacturer: product.manufacturer || "",
              uploadedAt: doc.created_at || new Date().toISOString(),
              fileSize: doc.fileSize || "",
              version: doc.version || "1.0",
              validUntil: doc.validUntil || null,
              rejection_reason: doc.rejection_reason || null,
            }));
          });

          return allDocuments;
        } catch (error) {
          console.error("Error in useGetDocuments:", error);
          throw error;
        }
      },
      retry: 1, // Hata durumunda sadece bir kez yeniden dene
      refetchOnWindowFocus: false, // Pencere odağı değiştiğinde yeniden sorgu yapma
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
        status: Document["status"];
        reason?: string;
      }) => {
        try {
          // Belge durumunu güncelle
          const updatedDocument = {
            ...document,
            status,
            ...(status === "rejected" && reason
              ? { rejection_reason: reason }
              : {}),
          };

          // Belgeyi içeren ürünü bul
          const { data: products, error: fetchError } = await supabase
            .from("products")
            .select("*")
            .eq("id", document.productId);

          if (fetchError) {
            throw new Error(`Failed to fetch product: ${fetchError.message}`);
          }

          if (!products || products.length === 0) {
            throw new Error(`No product found with ID ${document.productId}`);
          }

          const product = products[0];

          // Belgeyi güncelle
          let updatedDocuments;

          // Belgeleri nesne olarak işle
          if (
            product.documents &&
            typeof product.documents === "object" &&
            !Array.isArray(product.documents)
          ) {
            updatedDocuments = JSON.parse(JSON.stringify(product.documents));

            // Belge tipini bul
            const docType = document.type;

            if (
              updatedDocuments[docType] &&
              Array.isArray(updatedDocuments[docType])
            ) {
              // Belgeyi bul ve güncelle
              const documentIndex = updatedDocuments[docType].findIndex(
                (doc: any) =>
                  doc.id === document.id || doc.name === document.name
              );

              if (documentIndex !== -1) {
                updatedDocuments[docType][documentIndex] = {
                  ...updatedDocuments[docType][documentIndex],
                  status,
                  ...(status === "rejected" && reason
                    ? { rejection_reason: reason }
                    : {}),
                };
              } else {
                // Belge bulunamadı, yeni ekle
                if (!updatedDocuments[docType]) {
                  updatedDocuments[docType] = [];
                }

                updatedDocuments[docType].push({
                  id: document.id,
                  name: document.name,
                  type: document.type as DocumentType,
                  status,
                  url: document.url,
                  fileSize: document.fileSize,
                  version: document.version,
                  validUntil: document.validUntil,
                  uploadedAt: document.uploadedAt,
                  manufacturer: product.manufacturer || "",
                  manufacturerId: product.manufacturer_id || "",
                  ...(status === "rejected" && reason
                    ? { rejection_reason: reason }
                    : {}),
                });
              }
            } else {
              // Belge tipi yok, yeni oluştur
              updatedDocuments[docType] = [
                {
                  id: document.id,
                  name: document.name,
                  type: document.type as DocumentType,
                  status,
                  url: document.url,
                  fileSize: document.fileSize,
                  version: document.version,
                  validUntil: document.validUntil,
                  uploadedAt: document.uploadedAt,
                  manufacturer: product.manufacturer || "",
                  manufacturerId: product.manufacturer_id || "",
                  ...(status === "rejected" && reason
                    ? { rejection_reason: reason }
                    : {}),
                },
              ];
            }
          }
          // Belgeleri dizi olarak işle
          else if (Array.isArray(product.documents)) {
            updatedDocuments = JSON.parse(JSON.stringify(product.documents));

            // Belgeyi bul ve güncelle
            const documentIndex = updatedDocuments.findIndex(
              (doc: any) => doc.id === document.id || doc.name === document.name
            );

            if (documentIndex !== -1) {
              updatedDocuments[documentIndex] = {
                ...updatedDocuments[documentIndex],
                status,
                ...(status === "rejected" && reason
                  ? { rejection_reason: reason }
                  : {}),
              };
            } else {
              // Belge bulunamadı, yeni ekle
              updatedDocuments.push({
                id: document.id,
                name: document.name,
                type: document.type as DocumentType,
                status,
                url: document.url,
                fileSize: document.fileSize,
                version: document.version,
                validUntil: document.validUntil,
                uploadedAt: document.uploadedAt,
                manufacturer: product.manufacturer || "",
                manufacturerId: product.manufacturer_id || "",
                ...(status === "rejected" && reason
                  ? { rejection_reason: reason }
                  : {}),
              });
            }
          } else {
            // Belgeler yok, yeni oluştur
            updatedDocuments = [
              {
                id: document.id,
                name: document.name,
                type: document.type as DocumentType,
                status,
                url: document.url,
                fileSize: document.fileSize,
                version: document.version,
                validUntil: document.validUntil,
                uploadedAt: document.uploadedAt,
                manufacturer: product.manufacturer || "",
                manufacturerId: product.manufacturer_id || "",
                ...(status === "rejected" && reason
                  ? { rejection_reason: reason }
                  : {}),
              },
            ];
          }

          // Ürünü güncelle
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

  // Ürün reddetme işlevi
  useRejectProduct: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({
        productId,
        reason,
      }: {
        productId: string;
        reason: string;
      }) => {
        try {
          // Ürünü bul
          const { data: products, error: fetchError } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId);

          if (fetchError) {
            throw new Error(`Failed to fetch product: ${fetchError.message}`);
          }

          if (!products || products.length === 0) {
            throw new Error(`No product found with ID ${productId}`);
          }

          const product = products[0];

          // Ürün durumunu değiştirmek yerine, ürünün belgelerini güncelle
          // Bu, ürün durumunu değiştirmeden ürünü reddetmemizi sağlar

          // Belgeleri güncelle
          let updatedDocuments;

          // Belgeleri nesne olarak işle
          if (
            product.documents &&
            typeof product.documents === "object" &&
            !Array.isArray(product.documents)
          ) {
            updatedDocuments = JSON.parse(JSON.stringify(product.documents));

            // Tüm belge tiplerini kontrol et
            for (const docType in updatedDocuments) {
              if (Array.isArray(updatedDocuments[docType])) {
                // Tüm belgeleri reddedilmiş olarak işaretle
                updatedDocuments[docType] = updatedDocuments[docType].map(
                  (doc: any) => ({
                    ...doc,
                    status: "rejected",
                    rejection_reason: reason,
                  })
                );
              }
            }
          }
          // Belgeleri dizi olarak işle
          else if (Array.isArray(product.documents)) {
            updatedDocuments = JSON.parse(JSON.stringify(product.documents));

            // Tüm belgeleri reddedilmiş olarak işaretle
            updatedDocuments = updatedDocuments.map((doc: any) => ({
              ...doc,
              status: "rejected",
              rejection_reason: reason,
            }));
          } else {
            // Belgeler yok, yeni oluştur
            // Burada documents değişkenini bir dizi olarak kullanmıyoruz
            // Bunun yerine, doğrudan bir dizi oluşturuyoruz
            updatedDocuments = [
              {
                id: `rejected-${product.id}-${Date.now()}`, // Benzersiz ID oluştur
                name: "Product Rejection",
                type: "rejection",
                status: "rejected",
                rejection_reason: reason,
              },
            ];
          }

          // Ürünü güncelle - sadece belgeleri güncelle, ürün durumunu değiştirme
          const { data: updatedProduct, error: updateError } = await supabase
            .from("products")
            .update({
              documents: updatedDocuments,
            })
            .eq("id", product.id)
            .select();

          if (updateError) {
            throw new Error(
              `Failed to update product documents: ${updateError.message}`
            );
          }

          return updatedProduct;
        } catch (error) {
          console.error("Error in product rejection:", error);
          throw error;
        }
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["getDocuments"] });
        queryClient.invalidateQueries({ queryKey: ["getProducts"] });
      },
      onError: (error) => {
        console.error("Error in product rejection:", error);
      },
    });
  },
};

const fetchAllProducts = async () => {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

const fetchDocumentsFromProducts = async () => {
  try {
    const products = await fetchAllProducts();
    const allDocuments: Document[] = [];

    for (const product of products) {
      if (product.documents) {
        const productDocuments = extractDocumentsFromProduct(product);
        allDocuments.push(...productDocuments);
      }
    }

    return allDocuments;
  } catch (error) {
    console.error("Error fetching documents from products:", error);
    return [];
  }
};

const extractDocumentsFromProduct = (product: any): Document[] => {
  const documents: Document[] = [];
  if (!product.documents) {
    return documents;
  }

  // Handle array of documents
  if (Array.isArray(product.documents)) {
    product.documents.forEach((doc: any) => {
      if (doc && doc.id) {
        const document = {
          id: doc.id,
          name: doc.name || "Unnamed Document",
          type: (doc.type || "unknown") as DocumentType,
          url: doc.url,
          status: (doc.status || "pending").toLowerCase() as DocumentStatus,
          productId: product.id,
          manufacturer: product.manufacturer || "",
          manufacturerId: product.manufacturer_id || "",
          fileSize: doc.fileSize || "",
          version: doc.version || "1.0",
          validUntil: doc.validUntil || null,
          rejection_reason: doc.rejection_reason || null,
        };
        documents.push(document);
      }
    });
    return documents;
  }

  // Handle object of document arrays
  Object.entries(product.documents).forEach(
    ([docType, docList]: [string, any]) => {
      if (Array.isArray(docList)) {
        docList.forEach((doc: any) => {
          if (doc && doc.id) {
            const document = {
              id: doc.id,
              name: doc.name || "Unnamed Document",
              type: docType as DocumentType,
              url: doc.url,
              status: (doc.status || "pending").toLowerCase() as DocumentStatus,
              productId: product.id,
              manufacturer: product.manufacturer || "",
              manufacturerId: product.manufacturer_id || "",
              fileSize: doc.fileSize || "",
              version: doc.version || "1.0",
              validUntil: doc.validUntil || null,
              rejection_reason: doc.rejection_reason || null,
            };
            documents.push(document);
          } else if (doc && doc.name) {
            // Handle documents without id but with name
            const document = {
              id: `${docType}-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              name: doc.name,
              type: docType as DocumentType,
              url: doc.url,
              status: (doc.status || "pending").toLowerCase() as DocumentStatus,
              productId: product.id,
              manufacturer: product.manufacturer || "",
              manufacturerId: product.manufacturer_id || "",
              fileSize: doc.fileSize || "",
              version: doc.version || "1.0",
              validUntil: doc.validUntil || null,
              rejection_reason: doc.rejection_reason || null,
            };
            documents.push(document);
          }
        });
      } else if (
        docList &&
        typeof docList === "object" &&
        !Array.isArray(docList)
      ) {
        // Handle single document object
        const doc = docList;
        if (doc && (doc.id || doc.name)) {
          const document = {
            id:
              doc.id ||
              `${docType}-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            name: doc.name || "Unnamed Document",
            type: docType as DocumentType,
            url: doc.url,
            status: (doc.status || "pending").toLowerCase() as DocumentStatus,
            productId: product.id,
            manufacturer: product.manufacturer || "",
            manufacturerId: product.manufacturer_id || "",
            fileSize: doc.fileSize || "",
            version: doc.version || "1.0",
            validUntil: doc.validUntil || null,
            rejection_reason: doc.rejection_reason || null,
          };
          documents.push(document);
        }
      }
    }
  );

  return documents;
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

    if (
      typeof updatedDocuments === "object" &&
      !Array.isArray(updatedDocuments)
    ) {
      for (const docTypeKey in updatedDocuments) {
        if (Array.isArray(updatedDocuments[docTypeKey])) {
          const documentIndex = updatedDocuments[docTypeKey].findIndex(
            (doc: any) => doc.id === documentId
          );

          if (documentIndex !== -1) {
            updatedDocuments[docTypeKey][documentIndex] = {
              ...updatedDocuments[docTypeKey][documentIndex],
              status,
              updatedAt: new Date().toISOString(),
            };
            documentFound = true;
            break;
          }
        }
      }
    } else if (Array.isArray(updatedDocuments)) {
      const documentIndex = updatedDocuments.findIndex(
        (doc: any) => doc.id === documentId
      );

      if (documentIndex !== -1) {
        updatedDocuments[documentIndex] = {
          ...updatedDocuments[documentIndex],
          status,
          updatedAt: new Date().toISOString(),
        };
        documentFound = true;
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

const updateDocumentStatusDirectly = async (
  document: Document,
  status: DocumentStatus,
  reason?: string
) => {
  try {
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", document.productId)
      .single();

    if (fetchError) throw fetchError;
    if (!product) throw new Error("Product not found");

    let updatedDocuments = { ...product.documents };
    let documentFound = false;

    if (
      typeof updatedDocuments === "object" &&
      !Array.isArray(updatedDocuments)
    ) {
      for (const docTypeKey in updatedDocuments) {
        if (Array.isArray(updatedDocuments[docTypeKey])) {
          const documentIndex = updatedDocuments[docTypeKey].findIndex(
            (doc: any) => doc.id === document.id
          );

          if (documentIndex !== -1) {
            updatedDocuments[docTypeKey][documentIndex] = {
              ...updatedDocuments[docTypeKey][documentIndex],
              status,
              reason,
              updatedAt: new Date().toISOString(),
            };
            documentFound = true;
            break;
          }
        }
      }
    } else if (Array.isArray(updatedDocuments)) {
      const documentIndex = updatedDocuments.findIndex(
        (doc: any) => doc.id === document.id
      );

      if (documentIndex !== -1) {
        updatedDocuments[documentIndex] = {
          ...updatedDocuments[documentIndex],
          status,
          reason,
          updatedAt: new Date().toISOString(),
        };
        documentFound = true;
      }
    }

    if (!documentFound) {
      throw new Error(`Document with ID ${document.id} not found in product`);
    }

    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({ documents: updatedDocuments })
      .eq("id", document.productId)
      .select()
      .single();

    if (updateError) throw updateError;

    return updatedProduct;
  } catch (error) {
    console.error("Error updating document status directly:", error);
    throw error;
  }
};

const rejectProduct = async (productId: string, reason: string) => {
  try {
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError) throw fetchError;
    if (!product) throw new Error("Product not found");

    let updatedDocuments = { ...product.documents };
    let documentsUpdated = false;

    if (
      typeof updatedDocuments === "object" &&
      !Array.isArray(updatedDocuments)
    ) {
      for (const docTypeKey in updatedDocuments) {
        if (Array.isArray(updatedDocuments[docTypeKey])) {
          updatedDocuments[docTypeKey] = updatedDocuments[docTypeKey].map(
            (doc: any) => ({
              ...doc,
              status: "rejected",
              reason,
              updatedAt: new Date().toISOString(),
            })
          );
          documentsUpdated = true;
        }
      }
    } else if (Array.isArray(updatedDocuments)) {
      updatedDocuments = updatedDocuments.map((doc: any) => ({
        ...doc,
        status: "rejected",
        reason,
        updatedAt: new Date().toISOString(),
      }));
      documentsUpdated = true;
    }

    if (!documentsUpdated) {
      throw new Error("No documents found to update");
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
    console.error("Error rejecting product:", error);
    throw error;
  }
};
