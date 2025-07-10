"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { DocumentService } from "@/lib/services/document";
import { Document } from "@/lib/types/document";

import { useAuth } from "./use-auth";

export const useCompanyDocuments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const companyId = user?.user_metadata?.data?.company_id;

  const useGetCompanyDocuments = () => {
    return useQuery({
      queryKey: ["companyDocuments", companyId],
      queryFn: async () => {
        if (!user) {
          throw new Error("Kullanıcı girişi yapılmamış");
        }

        if (!companyId) {
          throw new Error("Şirket bilgisi bulunamadı");
        }

        try {
          const documents = await DocumentService.getDocumentsByCompany(companyId);
          return documents;
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(`Dökümanlar getirilirken hata oluştu: ${error.message}`);
          }
          throw new Error("Dökümanlar getirilirken beklenmeyen bir hata oluştu");
        }
      },
      enabled: !!companyId,
    });
  };

  const useUpdateDocumentStatus = () => {
    return useMutation({
      mutationFn: async ({
        documentId,
        status,
        reason,
      }: {
        documentId: string;
        status: 'approved' | 'rejected';
        reason?: string;
      }) => {
        if (!companyId) {
          throw new Error("Şirket bilgisi bulunamadı");
        }
        
        if (status === 'approved') {
          await DocumentService.approveDocument(documentId);
        } else if (status === 'rejected') {
          await DocumentService.rejectDocument(documentId, reason || '');
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["companyDocuments"] });
      },
    });
  };

  return {
    useGetCompanyDocuments,
    useUpdateDocumentStatus,
  };
}; 