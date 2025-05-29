"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ArrowLeft, Eye, Download } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusIcon } from "@/lib/utils/document-utils";
import { useCompanyDocuments } from "@/lib/hooks/use-company-documents";
import { Loading } from "@/components/ui/loading";
import { CompanyDocumentService } from "@/lib/services/companyDocument";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "rejected":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export default function DocumentDetailsPage() {
  const t = useTranslations('documents');
  const params = useParams();
  const documentId = params.id as string;
  const { useGetCompanyDocuments } = useCompanyDocuments();
  const { data: documents, isLoading } = useGetCompanyDocuments();
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const document = documents?.find(doc => doc.id === documentId);

  useEffect(() => {
    const getUrl = async () => {
      if (document?.filePath) {
        const url = await CompanyDocumentService.getPublicUrl(document.filePath);
        setPublicUrl(url);
      }
    };
    getUrl();
  }, [document?.filePath]);

  if (isLoading) {
    return <Loading />;
  }

  if (!document) {
    return (
      <div className="text-center py-8">
        <h2 className="text-lg font-medium mb-2">{t('details.notFound.title')}</h2>
        <p className="text-muted-foreground mb-4">{t('details.notFound.description')}</p>
        <Button asChild>
          <Link href="/dashboard/documents">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('details.backToList')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/documents">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{t("detail.title")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{document.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("detail.type")}</p>
              <p className="font-medium">{t(`types.${document.type.toLowerCase()}`)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("detail.createdAt")}</p>
              <p className="font-medium">
                {document.created_at ? new Date(document.created_at).toLocaleDateString("tr-TR") : 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("detail.updatedAt")}</p>
              <p className="font-medium">
                {document.updated_at ? new Date(document.updated_at).toLocaleDateString("tr-TR") : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            {publicUrl && (
              <>
                <Button asChild className="flex-1">
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {t("detail.view")}
                  </a>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <a href={publicUrl} download className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {t("detail.download")}
                  </a>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 