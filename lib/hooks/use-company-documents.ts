"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyDocumentService } from "@/lib/services/companyDocument";
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
          const documents = await CompanyDocumentService.getCompanyDocuments(companyId);
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
        await CompanyDocumentService.updateDocumentStatus(
          documentId,
          status,
          reason
        );
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