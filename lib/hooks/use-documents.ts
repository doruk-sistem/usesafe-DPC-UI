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
          const { data, error } = await supabase.from("documents").select("*");

          if (error) {
            console.error("Supabase error:", error);
            throw error;
          }

          if (!data) {
            return [];
          }

          // Map documents to the expected format
          return data.map((doc: any) => ({
            id: doc.id,
            name: doc.documentInfo?.name || "Unnamed Document",
            type: doc.documentInfo?.type || "unknown",
            category: doc.documentInfo?.type || "unknown",
            url: doc.documentInfo?.url || "",
            status: (doc.status || "pending").toLowerCase(),
            productId: doc.documentInfo?.productId || "",
            manufacturer: doc.documentInfo?.manufacturer || "",
            manufacturerId: doc.companyId || "",
            fileSize: doc.documentInfo?.fileSize || "",
            version: doc.documentInfo?.version || "1.0",
            validUntil: doc.documentInfo?.validUntil || null,
            rejection_reason: doc.documentInfo?.rejection_reason || null,
            created_at: doc.createdAt || new Date().toISOString(),
            updated_at: doc.updatedAt || new Date().toISOString(),
            uploadedAt: doc.createdAt || new Date().toISOString(),
            size: doc.documentInfo?.size || 0,
            notes: doc.documentInfo?.notes || "",
            originalType: doc.documentInfo?.originalType || ""
          } as Document));
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
        documentId,
      }: {
        documentId: string;
      }) => {
        // Delete document from documents table
        const { error } = await supabase
          .from("documents")
          .delete()
          .eq("id", documentId);

        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      },
    });
  },

  useUpdateDocumentStatus: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({
        documentId,
        status,
      }: {
        documentId: string;
        status: Document["status"];
      }) => {
        try {
          // Update document status in documents table
          const { error } = await supabase
            .from("documents")
            .update({ status })
            .eq("id", documentId);

          if (error) {
            throw new Error(`Failed to update document status: ${error.message}`);
          }
        } catch (error) {
          console.error("Error updating document status:", error);
          throw error;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      },
    });
  },

  useRejectDocument: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({
        documentId,
        reason,
      }: {
        documentId: string;
        reason: string;
      }) => {
        await DocumentService.rejectDocument(documentId, reason);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      },
    });
  },

  useApproveDocument: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({
        documentId,
      }: {
        documentId: string;
      }) => {
        await DocumentService.approveDocument(documentId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      },
    });
  },
};
