import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Document } from "@/lib/types/document";

export const documentsApiHooks = {
  useGetProducts: () => {
    return useQuery({
      queryKey: ["getProducts"],
      queryFn: async () => {
        console.log("Fetching all products...");
        try {
          const { data: products, error } = await supabase
            .from("products")
            .select("id, name, manufacturer_id, created_at")
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Supabase error:", error);
            throw error;
          }

          console.log("Products returned from Supabase:", products);
          return products || [];
        } catch (error) {
          console.error("Error fetching products:", error);
          throw error;
        }
      },
    });
  },

  useGetDocuments: () => {
    return useQuery({
      queryKey: ["getDocuments"],
      queryFn: async () => {
        console.log("Fetching documents from products...");
        try {
          // Fetch all products without filtering by company_id
          const { data: products, error } = await supabase
            .from("products")
            .select("id, name, documents, manufacturer_id, created_at")
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Supabase error:", error);
            throw error;
          }

          console.log("Products returned from Supabase:", products);
          console.log("Number of products:", products.length);

          // Extract documents from products
          const allDocuments: Document[] = [];
          products.forEach(product => {
            console.log(`Product ${product.id} documents:`, product.documents);
            
            // Check if documents is an object with arrays
            if (product.documents && typeof product.documents === 'object' && !Array.isArray(product.documents)) {
              // Handle documents as an object with arrays
              Object.entries(product.documents).forEach(([docType, docs]) => {
                if (Array.isArray(docs)) {
                  docs.forEach((doc: any, index: number) => {
                    // Generate a consistent document ID
                    // First try to use the existing ID if it exists
                    // Otherwise generate a new one with the format: productId-documentName-documentType-index
                    const documentId = doc.id || `${product.id}-${doc.name}-${docType}-${index}`;
                    console.log("Generated document ID:", documentId);
                    
                    allDocuments.push({
                      id: documentId,
                      name: doc.name,
                      type: doc.type || docType,
                      manufacturer: product.name,
                      manufacturerId: product.manufacturer_id,
                      productId: product.id,
                      status: doc.status || "pending",
                      validUntil: doc.validUntil || "",
                      uploadedAt: doc.uploadedAt || product.created_at,
                      fileSize: doc.fileSize || "0 KB",
                      version: doc.version || "1.0",
                      url: doc.url || "",
                      rejection_reason: doc.rejection_reason || "",
                      rejection_date: doc.rejection_date || "",
                    });
                  });
                }
              });
            }
            // Check if documents is an array
            else if (product.documents && Array.isArray(product.documents)) {
              product.documents.forEach((doc: any, index: number) => {
                // Generate a consistent document ID
                // First try to use the existing ID if it exists
                // Otherwise generate a new one with the format: productId-documentName-documentType-index
                const documentId = doc.id || `${product.id}-${doc.name}-${doc.type || 'technical_docs'}-${index}`;
                console.log("Generated document ID:", documentId);
                
                allDocuments.push({
                  id: documentId,
                  name: doc.name,
                  type: doc.type || "technical_docs",
                  manufacturer: product.name,
                  manufacturerId: product.manufacturer_id,
                  productId: product.id,
                  status: doc.status || "pending",
                  validUntil: doc.validUntil || "",
                  uploadedAt: doc.uploadedAt || product.created_at,
                  fileSize: doc.fileSize || "0 KB",
                  version: doc.version || "1.0",
                  url: doc.url || "",
                  rejection_reason: doc.rejection_reason || "",
                  rejection_date: doc.rejection_date || "",
                });
              });
            }
          });

          console.log("Extracted documents:", allDocuments);
          return allDocuments;
        } catch (error) {
          console.error("Error fetching documents:", error);
          throw error;
        }
      },
    });
  },

  useDeleteDocument: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ productId, documentId }: { productId: string; documentId: string }) => {
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
      mutationFn: async ({ productId, documentId, status }: { productId: string; documentId: string; status: Document["status"] }) => {
        console.log("Updating document status:", { productId, documentId, status });
        
        try {
          // First, get the product to find the document
          const { data: products, error: fetchError } = await supabase
            .from("products")
            .select("*")
            .eq("manufacturer_id", productId);

          if (fetchError) {
            console.error("Error fetching product:", fetchError);
            throw new Error(`Failed to fetch product: ${fetchError.message}`);
          }

          if (!products || products.length === 0) {
            throw new Error(`No products found with manufacturer ID ${productId}`);
          }

          // Use the first product that matches the manufacturer ID
          const product = products[0];
          console.log("Product before update:", product);
          console.log("Product documents before update:", product.documents);
          console.log("Document ID we're looking for:", documentId);

          // Create a deep copy of the documents to avoid reference issues
          let updatedDocuments;
          let documentUpdated = false;
          
          // Handle documents as an object with arrays
          if (product.documents && typeof product.documents === 'object' && !Array.isArray(product.documents)) {
            updatedDocuments = JSON.parse(JSON.stringify(product.documents));
            console.log("Documents is an object with arrays");
            
            // Try to find the document in all document types
            for (const docTypeKey in updatedDocuments) {
              if (Array.isArray(updatedDocuments[docTypeKey])) {
                console.log(`Checking document type: ${docTypeKey}`);
                
                // Find the document by ID - direct match without parsing
                const documentIndex = updatedDocuments[docTypeKey].findIndex((doc: any) => 
                  (doc.id && doc.id === documentId) || (doc.name && documentId.includes(doc.name))
                );
                
                if (documentIndex !== -1) {
                  console.log(`Found document at index ${documentIndex} in type ${docTypeKey}:`, updatedDocuments[docTypeKey][documentIndex]);
                  
                  // Update the document status
                  updatedDocuments[docTypeKey][documentIndex] = {
                    ...updatedDocuments[docTypeKey][documentIndex],
                    status
                  };
                  
                  documentUpdated = true;
                  break;
                }
              }
            }
          }
          // Handle documents as an array
          else if (Array.isArray(product.documents)) {
            console.log("Documents is an array");
            updatedDocuments = JSON.parse(JSON.stringify(product.documents));
            console.log(`Array has ${updatedDocuments.length} documents`);
            
            // Find the document by ID - direct match without parsing
            const documentIndex = updatedDocuments.findIndex((doc: any) => 
              (doc.id && doc.id === documentId) || (doc.name && documentId.includes(doc.name))
            );
            
            if (documentIndex !== -1) {
              console.log(`Found document at index ${documentIndex}:`, updatedDocuments[documentIndex]);
              
              // Update the document status
              updatedDocuments[documentIndex] = {
                ...updatedDocuments[documentIndex],
                status
              };
              
              documentUpdated = true;
            }
          } else {
            console.error("Invalid documents format");
            throw new Error("Invalid documents format in product");
          }

          if (!documentUpdated) {
            console.error("Document not found in the product");
            console.log("Document ID we were looking for:", documentId);
            console.log("Available documents:", JSON.stringify(product.documents, null, 2));
            
            // Don't throw an error, just log it and continue
            console.log("Document not found, but continuing with the update process");
          }

          console.log("Updated documents to save:", updatedDocuments);

          // Update the product with the updated documents
          const { data: updatedProduct, error: updateError } = await supabase
            .from("products")
            .update({ documents: updatedDocuments })
            .eq("id", product.id)
            .select();

          if (updateError) {
            console.error("Error updating product:", updateError);
            throw new Error(`Failed to update product: ${updateError.message}`);
          }

          console.log("Product after update:", updatedProduct);
          
          return updatedProduct;
        } catch (error) {
          console.error("Error in document status update:", error);
          throw error;
        }
      },
      onSuccess: (data) => {
        console.log("Document status update successful:", data);
        queryClient.invalidateQueries({ queryKey: ["getDocuments"] });
        queryClient.invalidateQueries({ queryKey: ["getProducts"] });
      },
      onError: (error) => {
        console.error("Error in document status update:", error);
      }
    });
  },

  // Yeni fonksiyon: Belge durumunu doğrudan güncellemek için
  useUpdateDocumentStatusDirect: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ document, status }: { document: Document; status: Document["status"] }) => {
        console.log("Updating document status directly:", { document, status });
        
        try {
          // Belge durumunu güncelle
          const updatedDocument = {
            ...document,
            status
          };
          
          // Belgeyi içeren ürünü bul
          const { data: products, error: fetchError } = await supabase
            .from("products")
            .select("*")
            .eq("id", document.productId);
          
          if (fetchError) {
            console.error("Error fetching product:", fetchError);
            throw new Error(`Failed to fetch product: ${fetchError.message}`);
          }
          
          if (!products || products.length === 0) {
            throw new Error(`No product found with ID ${document.productId}`);
          }
          
          const product = products[0];
          console.log("Product before update:", product);
          
          // Belgeyi güncelle
          let updatedDocuments;
          
          // Belgeleri nesne olarak işle
          if (product.documents && typeof product.documents === 'object' && !Array.isArray(product.documents)) {
            updatedDocuments = JSON.parse(JSON.stringify(product.documents));
            
            // Belge tipini bul
            const docType = document.type;
            
            if (updatedDocuments[docType] && Array.isArray(updatedDocuments[docType])) {
              // Belgeyi bul ve güncelle
              const documentIndex = updatedDocuments[docType].findIndex((doc: any) => 
                doc.id === document.id || doc.name === document.name
              );
              
              if (documentIndex !== -1) {
                updatedDocuments[docType][documentIndex] = {
                  ...updatedDocuments[docType][documentIndex],
                  status,
                  rejection_reason: document.rejection_reason,
                  rejection_date: document.rejection_date
                };
              } else {
                // Belge bulunamadı, yeni ekle
                if (!updatedDocuments[docType]) {
                  updatedDocuments[docType] = [];
                }
                
                updatedDocuments[docType].push({
                  id: document.id,
                  name: document.name,
                  type: document.type,
                  status,
                  url: document.url,
                  fileSize: document.fileSize,
                  version: document.version,
                  validUntil: document.validUntil,
                  uploadedAt: document.uploadedAt,
                  rejection_reason: document.rejection_reason,
                  rejection_date: document.rejection_date
                });
              }
            } else {
              // Belge tipi yok, yeni oluştur
              updatedDocuments[docType] = [{
                id: document.id,
                name: document.name,
                type: document.type,
                status,
                url: document.url,
                fileSize: document.fileSize,
                version: document.version,
                validUntil: document.validUntil,
                uploadedAt: document.uploadedAt,
                rejection_reason: document.rejection_reason,
                rejection_date: document.rejection_date
              }];
            }
          }
          // Belgeleri dizi olarak işle
          else if (Array.isArray(product.documents)) {
            updatedDocuments = JSON.parse(JSON.stringify(product.documents));
            
            // Belgeyi bul ve güncelle
            const documentIndex = updatedDocuments.findIndex((doc: any) => 
              doc.id === document.id || doc.name === document.name
            );
            
            if (documentIndex !== -1) {
              updatedDocuments[documentIndex] = {
                ...updatedDocuments[documentIndex],
                status,
                rejection_reason: document.rejection_reason,
                rejection_date: document.rejection_date
              };
            } else {
              // Belge bulunamadı, yeni ekle
              updatedDocuments.push({
                id: document.id,
                name: document.name,
                type: document.type,
                status,
                url: document.url,
                fileSize: document.fileSize,
                version: document.version,
                validUntil: document.validUntil,
                uploadedAt: document.uploadedAt,
                rejection_reason: document.rejection_reason,
                rejection_date: document.rejection_date
              });
            }
          } else {
            // Belgeler yok, yeni oluştur
            updatedDocuments = [{
              id: document.id,
              name: document.name,
              type: document.type,
              status,
              url: document.url,
              fileSize: document.fileSize,
              version: document.version,
              validUntil: document.validUntil,
              uploadedAt: document.uploadedAt,
              rejection_reason: document.rejection_reason,
              rejection_date: document.rejection_date
            }];
          }
          
          // Ürünü güncelle
          const { data: updatedProduct, error: updateError } = await supabase
            .from("products")
            .update({ documents: updatedDocuments })
            .eq("id", product.id)
            .select();
          
          if (updateError) {
            console.error("Error updating product:", updateError);
            throw new Error(`Failed to update product: ${updateError.message}`);
          }
          
          console.log("Product after update:", updatedProduct);
          
          return updatedProduct;
        } catch (error) {
          console.error("Error in direct document status update:", error);
          throw error;
        }
      },
      onSuccess: (data) => {
        console.log("Direct document status update successful:", data);
        queryClient.invalidateQueries({ queryKey: ["getDocuments"] });
        queryClient.invalidateQueries({ queryKey: ["getProducts"] });
      },
      onError: (error) => {
        console.error("Error in direct document status update:", error);
      }
    });
  },

  // Ürün reddetme işlevi
  useRejectProduct: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ productId, reason }: { productId: string; reason: string }) => {
        console.log("Rejecting product:", { productId, reason });
        
        try {
          // Ürünü bul
          const { data: products, error: fetchError } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId);
          
          if (fetchError) {
            console.error("Error fetching product:", fetchError);
            throw new Error(`Failed to fetch product: ${fetchError.message}`);
          }
          
          if (!products || products.length === 0) {
            throw new Error(`No product found with ID ${productId}`);
          }
          
          const product = products[0];
          console.log("Product before rejection:", product);
          
          // Ürün durumunu değiştirmek yerine, ürünün belgelerini güncelle
          // Bu, ürün durumunu değiştirmeden ürünü reddetmemizi sağlar
          
          // Belgeleri güncelle
          let updatedDocuments;
          
          // Belgeleri nesne olarak işle
          if (product.documents && typeof product.documents === 'object' && !Array.isArray(product.documents)) {
            updatedDocuments = JSON.parse(JSON.stringify(product.documents));
            
            // Tüm belge tiplerini kontrol et
            for (const docType in updatedDocuments) {
              if (Array.isArray(updatedDocuments[docType])) {
                // Tüm belgeleri reddedilmiş olarak işaretle
                updatedDocuments[docType] = updatedDocuments[docType].map((doc: any) => ({
                  ...doc,
                  status: "rejected",
                  rejection_reason: reason,
                  rejection_date: new Date().toISOString()
                }));
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
              rejection_date: new Date().toISOString()
            }));
          } else {
            // Belgeler yok, yeni oluştur
            // Burada documents değişkenini bir dizi olarak kullanmıyoruz
            // Bunun yerine, doğrudan bir dizi oluşturuyoruz
            updatedDocuments = [{
              id: `rejected-${product.id}-${Date.now()}`, // Benzersiz ID oluştur
              name: "Product Rejection",
              type: "rejection",
              status: "rejected",
              rejection_reason: reason,
              rejection_date: new Date().toISOString()
            }];
          }
          
          // Ürünü güncelle
          const { data: updatedProduct, error: updateError } = await supabase
            .from("products")
            .update({ 
              documents: updatedDocuments,
              status: "rejected", // Ürün durumunu rejected olarak ayarla
              rejection_reason: reason, // Reddetme nedenini ekle
              rejection_date: new Date().toISOString() // Reddetme tarihini ekle
            })
            .eq("id", product.id)
            .select();
          
          if (updateError) {
            console.error("Error updating product documents:", updateError);
            throw new Error(`Failed to update product documents: ${updateError.message}`);
          }
          
          console.log("Product after rejection:", updatedProduct);
          
          return updatedProduct;
        } catch (error) {
          console.error("Error in product rejection:", error);
          throw error;
        }
      },
      onSuccess: (data) => {
        console.log("Product rejection successful:", data);
        queryClient.invalidateQueries({ queryKey: ["getDocuments"] });
        queryClient.invalidateQueries({ queryKey: ["getProducts"] });
      },
      onError: (error) => {
        console.error("Error in product rejection:", error);
      }
    });
  },
}; 