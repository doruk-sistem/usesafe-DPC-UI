"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Document, DocumentStatus } from "@/lib/types/document";

export const documentsApiHooks = {

  useGetDocuments: () => {
    return useQuery({
      queryKey: ["documents"],
      queryFn: async () => {
        const { data, error } = await supabase.from("products").select("*");
        if (error) throw error;
        if (!data) return [];

        const allDocuments = data.flatMap((product: any) => {
          if (!product.documents) return [];

          const docs = Array.isArray(product.documents)
            ? product.documents
            : Object.values(product.documents).flat();

          return docs.map((doc: any) => ({
            id: doc.id || `doc-${Date.now()}-${Math.random()}`,
            name: doc.name || "Unnamed Document",
            type: doc.type || "unknown",
            url: doc.url || "",
            status: (doc.status || "pending").toLowerCase() as DocumentStatus,
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
            size: doc.size || 0,
          } as Document));
        });

        return allDocuments;
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
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("documents")
          .eq("id", productId)
          .single();

        if (fetchError) throw fetchError;
        if (!product || !product.documents) throw new Error("Product documents not found");

        const updatedDocuments = (Array.isArray(product.documents)
          ? product.documents
          : Object.values(product.documents).flat()
        ).filter((doc: any) => doc.id !== documentId);

        const { error: updateError } = await supabase
          .from("products")
          .update({ documents: updatedDocuments })
          .eq("id", productId);

        if (updateError) throw updateError;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      },
    });
  },
};
